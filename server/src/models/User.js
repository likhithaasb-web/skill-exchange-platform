const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    minlength: 3,
    maxlength: 22,
    match: [/^@?[a-zA-Z0-9_]{3,20}$/, 'Username must start with @, followed by 3-20 letters, numbers, or underscores']
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  displayName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  avatar: {
    category: {
      type: String,
      enum: ['cute', 'professional', 'technical', 'nature', 'creative', 'custom'],
      default: 'technical'
    },
    id: {
      type: String,
      default: 'tech-cyber-1'
    },
    customUrl: {
      type: String,
      default: ''
    }
  },
  bio: {
    type: String,
    default: '',
    maxlength: 300
  },
  tagline: {
    type: String,
    default: 'Skill Explorer & Lifelong Learner',
    maxlength: 100
  },
  location: {
    type: String,
    default: '',
    maxlength: 100
  },
  languages: {
    type: [String],
    default: ['English']
  },
  onboardingCompleted: {
    type: Boolean,
    default: false
  },
  onboardingAnswers: {
    q1SkillWish: { type: String, default: '' },
    q2BiggestChallenge: { type: String, default: '' },
    q3BestProject: { type: String, default: '' },
    q4LearningHelper: { type: String, default: 'Someone who gives practical examples' },
    q5Aspiration: { type: String, default: '' }
  },
  appearanceSettings: {
    theme: { type: String, enum: ['dark', 'light', 'system'], default: 'dark' },
    accent: { type: String, enum: ['gold', 'blue', 'green', 'purple'], default: 'gold' },
    density: { type: String, enum: ['compact', 'comfortable', 'spacious'], default: 'comfortable' },
    motion: { type: String, enum: ['full', 'reduced'], default: 'full' }
  },
  privacySettings: {
    profileVisibility: { type: String, enum: ['public', 'members', 'private'], default: 'public' },
    skillVisibility: { type: String, enum: ['public', 'connections', 'private'], default: 'public' },
    reviewVisibility: { type: String, enum: ['public', 'private'], default: 'public' },
    showActivity: { type: Boolean, default: true },
    contactPreference: { type: String, enum: ['anyone', 'matching', 'nobody'], default: 'anyone' }
  },
  security: {
    activeSessions: [{
      sessionId: String,
      device: String,
      browser: String,
      ip: String,
      lastActive: { type: Date, default: Date.now }
    }],
    loginHistory: [{
      timestamp: { type: Date, default: Date.now },
      device: String,
      ip: String,
      status: String
    }],
    blockedUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', UserSchema);
