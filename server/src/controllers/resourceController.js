const path = require('path');
const fs = require('fs');
const Resource = require('../models/Resource');
const SkillStudio = require('../models/SkillStudio');
const Notification = require('../models/Notification');
const { getCategoryFromExtension } = require('../middleware/upload');

exports.uploadResource = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select a file to upload.' });
    }

    const { studioId, exchangeId, description } = req.body;
    if (!studioId) {
      return res.status(400).json({ success: false, message: 'Studio ID is required.' });
    }

    const studio = await SkillStudio.findById(studioId);
    if (!studio) {
      return res.status(404).json({ success: false, message: 'Skill Studio not found.' });
    }

    const isParticipant = studio.participants.some(p => p.userId.toString() === req.user._id.toString());
    if (!isParticipant) {
      return res.status(403).json({ success: false, message: 'Only studio participants can share resources.' });
    }

    // Check host upload permission
    if (studio.sessionSettings.uploadPermission === 'host_only') {
      const isHost = studio.participants.some(p => p.role === 'host' && p.userId.toString() === req.user._id.toString());
      if (!isHost) {
        return res.status(403).json({ success: false, message: 'Host has restricted resource uploads to host-only.' });
      }
    }

    const ext = path.extname(req.file.originalname);
    const fileCategory = getCategoryFromExtension(ext);

    const resource = new Resource({
      studioId: studio._id,
      exchangeId: exchangeId || studio.exchangeId,
      uploaderId: req.user._id,
      uploaderUsername: req.user.username,
      uploaderDisplayName: req.user.displayName,
      uploaderAvatar: req.user.avatar,
      originalName: req.file.originalname,
      storedFilename: req.file.filename,
      fileType: fileCategory,
      mimeType: req.file.mimetype,
      sizeBytes: req.file.size,
      storagePath: req.file.path,
      description: description || ''
    });

    await resource.save();

    // Notify other participants in the studio
    const otherParticipants = studio.participants.filter(p => p.userId.toString() !== req.user._id.toString());
    for (const p of otherParticipants) {
      await Notification.create({
        recipientId: p.userId,
        senderId: req.user._id,
        type: 'resource_shared',
        title: 'New Resource Shared',
        message: `@${req.user.username} shared "${resource.originalName}" in your Skill Studio.`,
        link: `/studio/${studio._id}`
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Resource uploaded successfully.',
      resource
    });
  } catch (err) {
    next(err);
  }
};

exports.getStudioResources = async (req, res, next) => {
  try {
    const { studioId } = req.params;
    const studio = await SkillStudio.findById(studioId);
    if (!studio) return res.status(404).json({ success: false, message: 'Studio not found.' });

    const isParticipant = studio.participants.some(p => p.userId.toString() === req.user._id.toString());
    if (!isParticipant) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const resources = await Resource.find({ studioId }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      resources
    });
  } catch (err) {
    next(err);
  }
};

exports.downloadResource = async (req, res, next) => {
  try {
    const { resourceId } = req.params;
    const resource = await Resource.findById(resourceId);

    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found or has been removed.' });
    }

    // Check authorization: User must be a participant of the studio
    const studio = await SkillStudio.findById(resource.studioId);
    if (studio) {
      const isParticipant = studio.participants.some(p => p.userId.toString() === req.user._id.toString());
      if (!isParticipant) {
        return res.status(403).json({ success: false, message: 'Unauthorized to download this private resource.' });
      }
    }

    if (!fs.existsSync(resource.storagePath)) {
      return res.status(404).json({ success: false, message: 'Physical file not found on server.' });
    }

    resource.downloadCount += 1;
    await resource.save();

    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(resource.originalName)}"`);
    res.setHeader('Content-Type', resource.mimeType);

    const fileStream = fs.createReadStream(resource.storagePath);
    fileStream.pipe(res);
  } catch (err) {
    next(err);
  }
};

exports.deleteResource = async (req, res, next) => {
  try {
    const { resourceId } = req.params;
    const resource = await Resource.findById(resourceId);

    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found.' });

    if (resource.uploaderId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the uploader can delete this resource.' });
    }

    if (fs.existsSync(resource.storagePath)) {
      fs.unlinkSync(resource.storagePath);
    }

    await Resource.findByIdAndDelete(resourceId);

    return res.json({ success: true, message: 'Resource deleted.' });
  } catch (err) {
    next(err);
  }
};
