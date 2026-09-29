const mongoose = require('mongoose');

const SkillStudioSchema = new mongoose.Schema({
  exchangeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SkillExchange',
    required: true
  },
  title: {
    type: String,
    required: true,
    default: 'Skill Studio Collaborative Session'
  },
  topicSkillTeach: String,
  topicSkillLearn: String,
  participants: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['host', 'participant'], default: 'participant' },
    isOnline: { type: Boolean, default: false },
    joinedAt: { type: Date, default: Date.now }
  }],
  status: {
    type: String,
    enum: ['active', 'paused', 'ended'],
    default: 'active'
  },
  sessionSettings: {
    whiteboardPermission: { type: String, enum: ['everyone', 'host_only'], default: 'everyone' },
    codePermission: { type: String, enum: ['everyone', 'host_only'], default: 'everyone' },
    uploadPermission: { type: String, enum: ['everyone', 'host_only'], default: 'everyone' },
    screenSharePermission: { type: String, enum: ['everyone', 'host_only'], default: 'everyone' },
    cameraAllowed: { type: Boolean, default: true },
    voiceAllowed: { type: Boolean, default: true }
  },
  whiteboardElements: {
    type: Array,
    default: []
  },
  codeSpace: {
    language: { type: String, default: 'javascript' },
    code: {
      type: String,
      default: '// Welcome to Skill Studio Code Space\n// Share code snippets, write algorithms, or test ideas collaboratively.\n'
    },
    lastEditedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  chatMessages: [{
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    senderName: String,
    senderUsername: String,
    senderAvatar: Object,
    text: String,
    createdAt: { type: Date, default: Date.now }
  }],
  endedAt: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('SkillStudio', SkillStudioSchema);
