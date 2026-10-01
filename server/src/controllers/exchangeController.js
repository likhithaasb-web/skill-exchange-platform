const User = require('../models/User');
const SkillProfile = require('../models/SkillProfile');
const SkillExchange = require('../models/SkillExchange');
const SkillStudio = require('../models/SkillStudio');
const Notification = require('../models/Notification');
const { calculateSkillMatch } = require('../utils/matchingEngine');

const RELATED_SKILLS_MAP = {
  python: ['cybersecurity', 'data science', 'django', 'backend', 'machine learning', 'linux', 'api'],
  react: ['javascript', 'typescript', 'frontend', 'ui/ux', 'next.js', 'figma', 'html', 'css'],
  javascript: ['react', 'typescript', 'node.js', 'frontend', 'web development'],
  typescript: ['javascript', 'react', 'node.js', 'angular', 'frontend'],
  cybersecurity: ['python', 'linux', 'ethical hacking', 'networking', 'security', 'cryptography'],
  figma: ['ui/ux', 'design', 'prototyping', 'product design', 'frontend', 'react'],
  design: ['figma', 'ui/ux', 'graphic design', 'illustration', 'photoshop', 'blender'],
  docker: ['kubernetes', 'cloud', 'devops', 'linux', 'ci/cd', 'aws'],
  linux: ['cybersecurity', 'docker', 'bash', 'devops', 'python', 'cloud'],
  backend: ['python', 'node.js', 'sql', 'databases', 'api', 'golang'],
  frontend: ['react', 'javascript', 'css', 'html', 'tailwind', 'ui/ux', 'figma'],
  security: ['cybersecurity', 'linux', 'python', 'networking', 'cryptography']
};

function getRelatedKeywords(term) {
  if (!term) return [];
  const lower = term.toLowerCase().trim();
  const keywords = new Set();
  keywords.add(lower);

  for (const [key, related] of Object.entries(RELATED_SKILLS_MAP)) {
    if (lower.includes(key) || key.includes(lower)) {
      related.forEach(r => keywords.add(r));
    }
  }
  return Array.from(keywords);
}

exports.discoverPeers = async (req, res, next) => {
  try {
    const { skill, category, level, language, mutualOnly } = req.query;
    const currentUserId = req.user?._id;

    // Load current user profile if authenticated
    let myUser = null;
    let myProfile = null;
    if (currentUserId) {
      myUser = await User.findById(currentUserId);
      myProfile = await SkillProfile.findOne({ userId: currentUserId });
    }

    // Build user query
    const userQuery = {
      'privacySettings.profileVisibility': { $ne: 'private' }
    };
    if (currentUserId) {
      userQuery._id = { $ne: currentUserId, $nin: myUser?.security?.blockedUsers || [] };
    }

    const users = await User.find(userQuery).select('-passwordHash').limit(50);
    const userIds = users.map(u => u._id);

    const profiles = await SkillProfile.find({ userId: { $in: userIds } });
    const profileMap = new Map();
    profiles.forEach(p => profileMap.set(p.userId.toString(), p));

    let peers = users.map(u => {
      const p = profileMap.get(u._id.toString()) || { skillsTeaching: [], skillsLearning: [], stats: {} };
      let matchInfo = {
        isMutualMatch: false,
        isOneWayTeach: false,
        isOneWayLearn: false,
        compatibilityScore: 0,
        whyMatch: [],
        breakdown: []
      };

      if (myProfile && myUser) {
        matchInfo = calculateSkillMatch(myProfile, myUser, p, u);
      }

      return {
        user: u,
        profile: p,
        matchInfo
      };
    });

    const allCandidates = [...peers];

    // Apply search filter if provided (supports skill, username, and display name)
    if (skill) {
      const queryLower = skill.toLowerCase().trim();
      const strippedQuery = queryLower.replace(/^@/, '');
      peers = peers.filter(item => {
        const usernameLower = (item.user.username || '').toLowerCase();
        const displayNameLower = (item.user.displayName || '').toLowerCase();

        // Match username with or without @
        const usernameMatch = usernameLower.includes(queryLower) ||
                              usernameLower.replace(/^@/, '').includes(strippedQuery) ||
                              (strippedQuery && usernameLower.includes(strippedQuery));

        // Match display name
        const displayNameMatch = displayNameLower.includes(queryLower) || displayNameLower.includes(strippedQuery);

        // Match teaching skills
        const teachesMatch = item.profile.skillsTeaching.some(s =>
          s.name.toLowerCase().includes(queryLower) || s.name.toLowerCase().includes(strippedQuery)
        );

        // Match learning skills
        const learnsMatch = item.profile.skillsLearning.some(s =>
          s.name.toLowerCase().includes(queryLower) || s.name.toLowerCase().includes(strippedQuery)
        );

        return usernameMatch || displayNameMatch || teachesMatch || learnsMatch;
      });
    }

    if (category) {
      const catLower = category.toLowerCase().trim();
      peers = peers.filter(item => {
        return item.profile.skillsTeaching.some(s => s.category?.toLowerCase().includes(catLower)) ||
               item.profile.skillsLearning.some(s => s.category?.toLowerCase().includes(catLower));
      });
    }

    if (level) {
      peers = peers.filter(item => {
        return item.profile.skillsTeaching.some(s => s.level?.toLowerCase() === level.toLowerCase().trim());
      });
    }

    if (language) {
      peers = peers.filter(item => {
        return item.user.languages?.some(l => l.toLowerCase() === language.toLowerCase().trim());
      });
    }

    if (mutualOnly === 'true') {
      peers = peers.filter(item => item.matchInfo.isMutualMatch);
    }

    // Sort: Mutual matches first, then score descending, then active
    peers.sort((a, b) => {
      if (a.matchInfo.isMutualMatch && !b.matchInfo.isMutualMatch) return -1;
      if (!a.matchInfo.isMutualMatch && b.matchInfo.isMutualMatch) return 1;
      return b.matchInfo.compatibilityScore - a.matchInfo.compatibilityScore;
    });

    // Compute Similar Suggestions
    const matchedIds = new Set(peers.map(p => p.user._id.toString()));
    const unselectedCandidates = allCandidates.filter(c => !matchedIds.has(c.user._id.toString()));

    const relatedKeywords = skill ? getRelatedKeywords(skill) : [];
    const myLearningSkills = myProfile?.skillsLearning?.map(s => s.name.toLowerCase()) || [];
    const myTeachingSkills = myProfile?.skillsTeaching?.map(s => s.name.toLowerCase()) || [];

    const poolForSuggestions = unselectedCandidates.length > 0 ? unselectedCandidates : allCandidates;
    const scoredSuggestions = poolForSuggestions.map(c => {
      let simScore = c.matchInfo?.compatibilityScore || 0;
      let reason = '';

      // Check if candidate teaches what current user wants to learn
      const teachesUserGoal = c.profile?.skillsTeaching?.find(s =>
        myLearningSkills.some(ml => s.name.toLowerCase().includes(ml) || ml.includes(s.name.toLowerCase()))
      );
      if (teachesUserGoal) {
        simScore += 45;
        reason = `Teaches ${teachesUserGoal.name} (Matches your learning goal)`;
      }

      // Check if candidate wants to learn what current user teaches
      const wantsUserSkill = c.profile?.skillsLearning?.find(s =>
        myTeachingSkills.some(mt => s.name.toLowerCase().includes(mt) || mt.includes(s.name.toLowerCase()))
      );
      if (wantsUserSkill) {
        simScore += 35;
        if (!reason) reason = `Wants to learn ${wantsUserSkill.name} from you`;
      }

      // Check related keyword match if search term provided
      if (skill && relatedKeywords.length > 0) {
        const relatedSkill = c.profile?.skillsTeaching?.find(s =>
          relatedKeywords.some(kw => s.name.toLowerCase().includes(kw) || kw.includes(s.name.toLowerCase()))
        );
        if (relatedSkill) {
          simScore += 35;
          if (!reason) reason = `Related to '${skill}': Offers ${relatedSkill.name}`;
        }
      }

      // Category overlap
      if (category) {
        const catMatch = c.profile?.skillsTeaching?.some(s => s.category?.toLowerCase().includes(category.toLowerCase()));
        if (catMatch) {
          simScore += 25;
          if (!reason) reason = `Shares category: ${category}`;
        }
      }

      // Mutual match bonus
      if (c.matchInfo?.isMutualMatch) {
        simScore += 50;
        if (!reason) reason = `Mutual Match • High Compatibility`;
      }

      if (!reason) {
        const topTeach = c.profile?.skillsTeaching?.[0]?.name;
        reason = topTeach ? `Offers ${topTeach} • Recommended Peer` : `Verified Exchange Peer`;
      }

      return {
        ...c,
        similarityScore: simScore,
        suggestionReason: reason
      };
    });

    scoredSuggestions.sort((a, b) => b.similarityScore - a.similarityScore);
    const similarSuggestions = scoredSuggestions.slice(0, 6);

    return res.json({
      success: true,
      count: peers.length,
      peers,
      similarSuggestions
    });
  } catch (err) {
    next(err);
  }
};

exports.createExchangeRequest = async (req, res, next) => {
  try {
    const { recipientId, requestedSkill, offeredSkill, preferredFormat, preferredFormats, message } = req.body;
    const requesterId = req.user._id;

    if (!recipientId || !requestedSkill || !offeredSkill) {
      return res.status(400).json({
        success: false,
        message: 'Recipient, requested skill, and offered skill are required.'
      });
    }

    if (recipientId.toString() === requesterId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot initiate a skill exchange with yourself.'
      });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ success: false, message: 'Recipient user not found.' });
    }

    // Check contact preferences
    if (recipient.privacySettings.contactPreference === 'nobody') {
      return res.status(403).json({
        success: false,
        message: 'This user is currently not accepting exchange requests.'
      });
    }

    // Check blocked status
    if (recipient.security.blockedUsers.includes(requesterId)) {
      return res.status(403).json({
        success: false,
        message: 'Unable to send exchange request to this user.'
      });
    }

    // Check existing pending request
    const existing = await SkillExchange.findOne({
      requesterId,
      recipientId,
      status: 'pending'
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active pending exchange request with this member.'
      });
    }

    const formatsArray = Array.isArray(preferredFormats) && preferredFormats.length > 0
      ? preferredFormats
      : (preferredFormat ? (Array.isArray(preferredFormat) ? preferredFormat : [preferredFormat]) : ['Mixed']);
    const formatString = formatsArray.join(', ');

    const exchange = new SkillExchange({
      requesterId,
      recipientId,
      requestedSkill: typeof requestedSkill === 'string' ? { name: requestedSkill } : requestedSkill,
      offeredSkill: typeof offeredSkill === 'string' ? { name: offeredSkill } : offeredSkill,
      preferredFormat: formatString,
      preferredFormats: formatsArray,
      message: message || `Hi! I would love to exchange skills with you: teach ${offeredSkill.name || offeredSkill} and learn ${requestedSkill.name || requestedSkill}.`,
      status: 'pending'
    });

    await exchange.save();

    // Create notification for recipient
    await Notification.create({
      recipientId,
      senderId: requesterId,
      type: 'exchange_request',
      title: 'New Skill Exchange Proposal',
      message: `@${req.user.username} wants to exchange skills: Teach ${exchange.offeredSkill.name} ↔ Learn ${exchange.requestedSkill.name}.`,
      link: '/exchanges'
    });

    return res.status(201).json({
      success: true,
      message: 'Exchange proposal sent successfully!',
      exchange
    });
  } catch (err) {
    next(err);
  }
};

exports.getMyExchanges = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const exchanges = await SkillExchange.find({
      $or: [{ requesterId: userId }, { recipientId: userId }]
    })
      .populate('requesterId', 'username displayName avatar location tagline')
      .populate('recipientId', 'username displayName avatar location tagline')
      .populate('studioId', 'title status sessionSettings')
      .sort({ updatedAt: -1 });

    return res.json({
      success: true,
      exchanges
    });
  } catch (err) {
    next(err);
  }
};

exports.getExchangeById = async (req, res, next) => {
  try {
    const { exchangeId } = req.params;
    const userId = req.user._id;

    const exchange = await SkillExchange.findById(exchangeId)
      .populate('requesterId', 'username displayName avatar bio location tagline')
      .populate('recipientId', 'username displayName avatar bio location tagline')
      .populate('studioId');

    if (!exchange) {
      return res.status(404).json({ success: false, message: 'Exchange not found.' });
    }

    const isParticipant = exchange.requesterId._id.toString() === userId.toString() ||
                          exchange.recipientId._id.toString() === userId.toString();

    if (!isParticipant) {
      return res.status(403).json({ success: false, message: 'Access denied to this exchange.' });
    }

    return res.json({
      success: true,
      exchange
    });
  } catch (err) {
    next(err);
  }
};

exports.respondToExchange = async (req, res, next) => {
  try {
    const { exchangeId } = req.params;
    const { action } = req.body; // 'accept', 'decline', 'cancel'
    const userId = req.user._id;

    const exchange = await SkillExchange.findById(exchangeId);
    if (!exchange) {
      return res.status(404).json({ success: false, message: 'Exchange not found.' });
    }

    const isRecipient = exchange.recipientId.toString() === userId.toString();
    const isRequester = exchange.requesterId.toString() === userId.toString();

    if (!isRecipient && !isRequester) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    if (action === 'cancel' && isRequester) {
      exchange.status = 'cancelled';
      await exchange.save();
      return res.json({ success: true, message: 'Exchange request cancelled.', exchange });
    }

    if (!isRecipient) {
      return res.status(403).json({ success: false, message: 'Only recipient can accept or decline.' });
    }

    if (action === 'decline') {
      exchange.status = 'declined';
      await exchange.save();

      await Notification.create({
        recipientId: exchange.requesterId,
        senderId: userId,
        type: 'exchange_declined',
        title: 'Exchange Proposal Update',
        message: `@${req.user.username} was unable to accept your skill exchange request at this time.`,
        link: '/exchanges'
      });

      return res.json({ success: true, message: 'Exchange declined.', exchange });
    }

    if (action === 'accept') {
      exchange.status = 'accepted';

      // Create a private Skill Studio for the pair!
      const studio = new SkillStudio({
        exchangeId: exchange._id,
        title: `${exchange.offeredSkill.name} ↔ ${exchange.requestedSkill.name} Studio`,
        topicSkillTeach: exchange.offeredSkill.name,
        topicSkillLearn: exchange.requestedSkill.name,
        participants: [
          { userId: exchange.requesterId, role: 'host' },
          { userId: exchange.recipientId, role: 'participant' }
        ],
        status: 'active',
        sessionSettings: {
          whiteboardPermission: 'everyone',
          codePermission: 'everyone',
          uploadPermission: 'everyone',
          screenSharePermission: 'everyone',
          cameraAllowed: true,
          voiceAllowed: true
        }
      });

      await studio.save();
      exchange.studioId = studio._id;
      await exchange.save();

      // Notify requester
      await Notification.create({
        recipientId: exchange.requesterId,
        senderId: userId,
        type: 'exchange_accepted',
        title: 'Exchange Accepted! 🚀',
        message: `@${req.user.username} accepted your skill exchange! Your private Skill Studio is now open.`,
        link: `/studio/${studio._id}`
      });

      return res.json({
        success: true,
        message: 'Exchange accepted! Skill Studio created.',
        exchange,
        studioId: studio._id
      });
    }

    return res.status(400).json({ success: false, message: 'Invalid action.' });
  } catch (err) {
    next(err);
  }
};

exports.completeExchange = async (req, res, next) => {
  try {
    const { exchangeId } = req.params;
    const userId = req.user._id;

    const exchange = await SkillExchange.findById(exchangeId);
    if (!exchange) return res.status(404).json({ success: false, message: 'Exchange not found.' });

    const isRequester = exchange.requesterId.toString() === userId.toString();
    const isRecipient = exchange.recipientId.toString() === userId.toString();

    if (!isRequester && !isRecipient) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    if (isRequester) exchange.completionDetails.requesterConfirmed = true;
    if (isRecipient) exchange.completionDetails.recipientConfirmed = true;

    // If both confirmed, mark completed and update passports
    if (exchange.completionDetails.requesterConfirmed && exchange.completionDetails.recipientConfirmed) {
      exchange.status = 'completed';
      exchange.completionDetails.completedAt = new Date();

      // Update both profiles' statistics
      await SkillProfile.findOneAndUpdate(
        { userId: exchange.requesterId },
        {
          $inc: {
            'stats.exchangesCompleted': 1,
            'stats.teachingHours': 1,
            'stats.learningHours': 1
          }
        }
      );

      await SkillProfile.findOneAndUpdate(
        { userId: exchange.recipientId },
        {
          $inc: {
            'stats.exchangesCompleted': 1,
            'stats.teachingHours': 1,
            'stats.learningHours': 1
          }
        }
      );
    } else {
      exchange.status = 'in_progress';
    }

    await exchange.save();

    return res.json({
      success: true,
      message: exchange.status === 'completed'
        ? 'Skill Exchange successfully completed! Please leave peer feedback to verify skills.'
        : 'Completion confirmed. Waiting for peer confirmation.',
      exchange
    });
  } catch (err) {
    next(err);
  }
};
