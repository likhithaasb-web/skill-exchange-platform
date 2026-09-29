const mongoose = require('mongoose');

const SkillExchangeSchema = new mongoose.Schema({
  requesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requestedSkill: {
    name: { type: String, required: true },
    category: { type: String, default: 'General' }
  },
  offeredSkill: {
    name: { type: String, required: true },
    category: { type: String, default: 'General' }
  },
  preferredFormat: {
    type: String,
    enum: ['Voice', 'Whiteboard', 'Code', 'Camera', 'Mixed'],
    default: 'Mixed'
  },
  message: {
    type: String,
    maxlength: 1000,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'in_progress', 'completed', 'declined', 'cancelled'],
    default: 'pending'
  },
  studioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SkillStudio'
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  completionDetails: {
    completedAt: Date,
    durationMinutes: { type: Number, default: 60 },
    requesterConfirmed: { type: Boolean, default: false },
    recipientConfirmed: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SkillExchange', SkillExchangeSchema);
