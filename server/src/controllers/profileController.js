const User = require('../models/User');
const SkillProfile = require('../models/SkillProfile');
const Review = require('../models/Review');
const Project = require('../models/Project');

exports.getProfileByUsername = async (req, res, next) => {
  try {
    const { username } = req.params;
    const cleanUsername = username.toLowerCase().trim();

    const user = await User.findOne({ username: cleanUsername }).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User profile not found.' });
    }

    const currentUserId = req.user?._id;

    // Check blocked status
    if (currentUserId && user.security.blockedUsers.includes(currentUserId)) {
      return res.status(403).json({ success: false, message: 'This profile is not accessible.' });
    }

    // Check privacy settings
    const privacy = user.privacySettings;
    const isOwner = currentUserId && currentUserId.toString() === user._id.toString();

    if (!isOwner) {
      if (privacy.profileVisibility === 'private') {
        return res.status(403).json({ success: false, message: 'This user has made their profile private.' });
      }
      if (privacy.profileVisibility === 'members' && !currentUserId) {
        return res.status(401).json({ success: false, message: 'This profile is visible to logged-in members only.' });
      }
    }

    const profile = await SkillProfile.findOne({ userId: user._id });

    // Fetch reviews
    let reviews = [];
    if (privacy.reviewVisibility === 'public' || isOwner) {
      reviews = await Review.find({
        recipientId: user._id,
        ...(isOwner ? {} : { visibility: 'public' })
      }).populate('reviewerId', 'username displayName avatar');
    }

    // Fetch public/connection projects
    const projects = await Project.find({
      'participants.userId': user._id,
      ...(isOwner ? {} : { privacy: 'public' })
    });

    return res.json({
      success: true,
      user,
      profile: profile || { skillsTeaching: [], skillsLearning: [], stats: {} },
      reviews,
      projects,
      isOwner
    });
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { displayName, bio, tagline, location, languages, avatar } = req.body;
    const user = await User.findById(req.user._id);

    if (displayName) user.displayName = displayName.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (tagline !== undefined) user.tagline = tagline.trim();
    if (location !== undefined) user.location = location.trim();
    if (languages) user.languages = languages;
    if (avatar) user.avatar = avatar;

    await user.save();

    const userSafe = user.toObject();
    delete userSafe.passwordHash;

    return res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: userSafe
    });
  } catch (err) {
    next(err);
  }
};

exports.addTeachingSkill = async (req, res, next) => {
  try {
    const { name, category, level, yearsExperience } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Skill name is required.' });
    }

    let profile = await SkillProfile.findOne({ userId: req.user._id });
    if (!profile) {
      profile = new SkillProfile({ userId: req.user._id });
    }

    // Check if skill already added
    const exists = profile.skillsTeaching.some(s => s.name.toLowerCase() === name.toLowerCase().trim());
    if (exists) {
      return res.status(400).json({ success: false, message: 'You already listed this skill in your teaching passport.' });
    }

    profile.skillsTeaching.push({
      name: name.trim(),
      category: category || 'General',
      level: level || 'Intermediate',
      yearsExperience: yearsExperience || 1,
      verificationStatus: 'Self-Declared'
    });

    profile.stats.skillsTaught = profile.skillsTeaching.length;
    await profile.save();

    return res.json({
      success: true,
      message: 'Skill added to your Skill Passport.',
      profile
    });
  } catch (err) {
    next(err);
  }
};

exports.removeTeachingSkill = async (req, res, next) => {
  try {
    const { skillId } = req.params;
    const profile = await SkillProfile.findOne({ userId: req.user._id });

    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found.' });

    profile.skillsTeaching = profile.skillsTeaching.filter(s => s._id.toString() !== skillId);
    profile.stats.skillsTaught = profile.skillsTeaching.length;
    await profile.save();

    return res.json({
      success: true,
      message: 'Skill removed from teaching passport.',
      profile
    });
  } catch (err) {
    next(err);
  }
};

exports.addLearningSkill = async (req, res, next) => {
  try {
    const { name, category, targetLevel, priority, preferredFormat } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Skill name is required.' });
    }

    let profile = await SkillProfile.findOne({ userId: req.user._id });
    if (!profile) {
      profile = new SkillProfile({ userId: req.user._id });
    }

    const exists = profile.skillsLearning.some(s => s.name.toLowerCase() === name.toLowerCase().trim());
    if (exists) {
      return res.status(400).json({ success: false, message: 'Skill is already in your learning goals.' });
    }

    profile.skillsLearning.push({
      name: name.trim(),
      category: category || 'General',
      targetLevel: targetLevel || 'Intermediate',
      priority: priority || 'High',
      preferredFormat: preferredFormat || ['Whiteboard', 'Voice']
    });

    profile.stats.skillsLearned = profile.skillsLearning.length;
    await profile.save();

    return res.json({
      success: true,
      message: 'Learning goal added to your Skill Passport.',
      profile
    });
  } catch (err) {
    next(err);
  }
};

exports.removeLearningSkill = async (req, res, next) => {
  try {
    const { skillId } = req.params;
    const profile = await SkillProfile.findOne({ userId: req.user._id });

    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found.' });

    profile.skillsLearning = profile.skillsLearning.filter(s => s._id.toString() !== skillId);
    profile.stats.skillsLearned = profile.skillsLearning.length;
    await profile.save();

    return res.json({
      success: true,
      message: 'Learning goal removed.',
      profile
    });
  } catch (err) {
    next(err);
  }
};

exports.updatePrivacySettings = async (req, res, next) => {
  try {
    const { profileVisibility, skillVisibility, reviewVisibility, showActivity, contactPreference } = req.body;
    const user = await User.findById(req.user._id);

    if (profileVisibility) user.privacySettings.profileVisibility = profileVisibility;
    if (skillVisibility) user.privacySettings.skillVisibility = skillVisibility;
    if (reviewVisibility) user.privacySettings.reviewVisibility = reviewVisibility;
    if (showActivity !== undefined) user.privacySettings.showActivity = showActivity;
    if (contactPreference) user.privacySettings.contactPreference = contactPreference;

    await user.save();

    return res.json({
      success: true,
      message: 'Privacy settings updated successfully.',
      privacySettings: user.privacySettings
    });
  } catch (err) {
    next(err);
  }
};
