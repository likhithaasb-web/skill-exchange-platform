const Review = require('../models/Review');
const SkillExchange = require('../models/SkillExchange');
const SkillProfile = require('../models/SkillProfile');
const Notification = require('../models/Notification');
const User = require('../models/User');

exports.submitReview = async (req, res, next) => {
  try {
    let { exchangeId, recipientId, skillTaught, appreciationChips, personalNote, visibility } = req.body;
    const reviewerId = req.user._id;

    if (!exchangeId || !skillTaught) {
      return res.status(400).json({
        success: false,
        message: 'Exchange ID and skill taught are required.'
      });
    }

    const exchange = await SkillExchange.findById(exchangeId);
    if (!exchange) {
      return res.status(404).json({ success: false, message: 'Skill Exchange not found.' });
    }

    // Verify reviewer was part of this exchange
    const isRequester = exchange.requesterId.toString() === reviewerId.toString();
    const isRecipient = exchange.recipientId.toString() === reviewerId.toString();
    if (!isRequester && !isRecipient) {
      return res.status(403).json({ success: false, message: 'Only participants of this exchange can leave a review.' });
    }

    // Automatically resolve recipient to the actual partner of this exchange
    const partnerId = isRequester ? exchange.recipientId : exchange.requesterId;
    if (!recipientId || recipientId.toString() === reviewerId.toString()) {
      recipientId = partnerId;
    }

    if (recipientId.toString() === reviewerId.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot review yourself.' });
    }

    // Check if already reviewed for this exchange
    const existing = await Review.findOne({ exchangeId, reviewerId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already submitted peer feedback for this exchange.' });
    }

    const review = new Review({
      exchangeId,
      reviewerId,
      recipientId,
      skillTaught: skillTaught.trim(),
      appreciationChips: Array.isArray(appreciationChips) ? appreciationChips : [],
      personalNote: personalNote ? personalNote.trim() : '',
      visibility: visibility || 'public'
    });

    await review.save();

    // Endorse the recipient's taught skill in their SkillProfile -> Upgrade to Peer-Verified!
    const recipientProfile = await SkillProfile.findOne({ userId: recipientId });
    if (recipientProfile) {
      const targetSkill = recipientProfile.skillsTeaching.find(s => s.name.toLowerCase() === skillTaught.toLowerCase());
      if (targetSkill) {
        if (targetSkill.verificationStatus === 'Self-Declared') {
          targetSkill.verificationStatus = 'Peer-Verified';
        }
        targetSkill.verifiedByCount = (targetSkill.verifiedByCount || 0) + 1;
        targetSkill.endorsements.push({
          endorserId: reviewerId,
          endorserUsername: req.user.username,
          exchangeId: exchange._id,
          note: personalNote || 'Verified peer knowledge through skill exchange.',
          date: new Date()
        });
        await recipientProfile.save();
      }
    }

    // Notify recipient
    await Notification.create({
      recipientId,
      senderId: reviewerId,
      type: 'review_received',
      title: 'Peer Verification Received! ⭐',
      message: `@${req.user.username} shared feedback for "${skillTaught}". Your Skill Passport has been verified!`,
      link: '/passport'
    });

    return res.status(201).json({
      success: true,
      message: 'Peer feedback submitted! Skill verification recorded.',
      review
    });
  } catch (err) {
    next(err);
  }
};

exports.getReviewsForUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user?._id;
    const isOwner = currentUserId && currentUserId.toString() === userId.toString();

    const query = { recipientId: userId };
    if (!isOwner) {
      query.visibility = 'public';
    }

    const reviews = await Review.find(query)
      .populate('reviewerId', 'username displayName avatar location tagline')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      reviews
    });
  } catch (err) {
    next(err);
  }
};
