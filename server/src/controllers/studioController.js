const SkillStudio = require('../models/SkillStudio');
const SkillExchange = require('../models/SkillExchange');
const User = require('../models/User');

exports.getStudioById = async (req, res, next) => {
  try {
    const { studioId } = req.params;
    const userId = req.user._id;

    const studio = await SkillStudio.findById(studioId)
      .populate('participants.userId', 'username displayName avatar location tagline')
      .populate({
        path: 'exchangeId',
        select: 'offeredSkill requestedSkill preferredFormat status requesterId recipientId'
      });

    if (!studio) {
      return res.status(404).json({ success: false, message: 'Skill Studio not found.' });
    }

    const isParticipant = studio.participants.some(p => p.userId && p.userId._id.toString() === userId.toString());
    if (!isParticipant) {
      return res.status(403).json({ success: false, message: 'Access denied. You are not a participant of this Skill Studio.' });
    }

    return res.json({
      success: true,
      studio
    });
  } catch (err) {
    next(err);
  }
};

exports.updateSessionSettings = async (req, res, next) => {
  try {
    const { studioId } = req.params;
    const { whiteboardPermission, codePermission, uploadPermission, screenSharePermission, cameraAllowed, voiceAllowed } = req.body;
    const userId = req.user._id;

    const studio = await SkillStudio.findById(studioId);
    if (!studio) return res.status(404).json({ success: false, message: 'Studio not found.' });

    // Host check
    const hostParticipant = studio.participants.find(p => p.role === 'host');
    const isHost = hostParticipant && hostParticipant.userId.toString() === userId.toString();

    if (!isHost) {
      return res.status(403).json({ success: false, message: 'Only the studio host can adjust session settings.' });
    }

    if (whiteboardPermission) studio.sessionSettings.whiteboardPermission = whiteboardPermission;
    if (codePermission) studio.sessionSettings.codePermission = codePermission;
    if (uploadPermission) studio.sessionSettings.uploadPermission = uploadPermission;
    if (screenSharePermission) studio.sessionSettings.screenSharePermission = screenSharePermission;
    if (cameraAllowed !== undefined) studio.sessionSettings.cameraAllowed = cameraAllowed;
    if (voiceAllowed !== undefined) studio.sessionSettings.voiceAllowed = voiceAllowed;

    await studio.save();

    return res.json({
      success: true,
      message: 'Studio settings updated.',
      sessionSettings: studio.sessionSettings
    });
  } catch (err) {
    next(err);
  }
};

exports.saveWhiteboardData = async (req, res, next) => {
  try {
    const { studioId } = req.params;
    const { elements } = req.body;

    const studio = await SkillStudio.findById(studioId);
    if (!studio) return res.status(404).json({ success: false, message: 'Studio not found.' });

    studio.whiteboardElements = elements || [];
    await studio.save();

    return res.json({ success: true, message: 'Whiteboard saved.' });
  } catch (err) {
    next(err);
  }
};

exports.saveCodeSpaceData = async (req, res, next) => {
  try {
    const { studioId } = req.params;
    const { code, language } = req.body;

    const studio = await SkillStudio.findById(studioId);
    if (!studio) return res.status(404).json({ success: false, message: 'Studio not found.' });

    if (code !== undefined) studio.codeSpace.code = code;
    if (language) studio.codeSpace.language = language;
    studio.codeSpace.lastEditedBy = req.user._id;
    await studio.save();

    return res.json({ success: true, message: 'Code Space saved.' });
  } catch (err) {
    next(err);
  }
};

exports.endStudioSession = async (req, res, next) => {
  try {
    const { studioId } = req.params;
    const studio = await SkillStudio.findById(studioId);
    if (!studio) return res.status(404).json({ success: false, message: 'Studio not found.' });

    studio.status = 'ended';
    studio.endedAt = new Date();
    await studio.save();

    return res.json({ success: true, message: 'Studio session ended.' });
  } catch (err) {
    next(err);
  }
};
