const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 120
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  exchangeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SkillExchange'
  },
  participants: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, default: 'Collaborator' },
    skillsContributed: [String]
  }],
  skillsUsed: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    enum: ['planning', 'in_progress', 'completed'],
    default: 'in_progress'
  },
  githubUrl: {
    type: String,
    default: ''
  },
  liveUrl: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  },
  privacy: {
    type: String,
    enum: ['public', 'connections', 'private'],
    default: 'connections'
  },
  completedAt: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('Project', ProjectSchema);
