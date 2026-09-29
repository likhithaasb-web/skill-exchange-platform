const mongoose = require('mongoose');

const TeachingSkillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    default: 'General'
  },
  level: {
    type: String,
    enum: ['Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Expert'],
    default: 'Intermediate'
  },
  yearsExperience: {
    type: Number,
    default: 1
  },
  verificationStatus: {
    type: String,
    enum: ['Self-Declared', 'Peer-Verified', 'Project-Demonstrated'],
    default: 'Self-Declared'
  },
  verifiedByCount: {
    type: Number,
    default: 0
  },
  endorsements: [{
    endorserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    endorserUsername: String,
    exchangeId: { type: mongoose.Schema.Types.ObjectId, ref: 'SkillExchange' },
    note: String,
    date: { type: Date, default: Date.now }
  }]
}, { _id: true });

const LearningSkillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    default: 'General'
  },
  targetLevel: {
    type: String,
    enum: ['Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Expert'],
    default: 'Intermediate'
  },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'High'
  },
  preferredFormat: {
    type: [String],
    default: ['Whiteboard', 'Voice']
  }
}, { _id: true });

const SkillProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  skillsTeaching: [TeachingSkillSchema],
  skillsLearning: [LearningSkillSchema],
  stats: {
    skillsTaught: { type: Number, default: 0 },
    skillsLearned: { type: Number, default: 0 },
    exchangesCompleted: { type: Number, default: 0 },
    projectsCompleted: { type: Number, default: 0 },
    teachingHours: { type: Number, default: 0 },
    learningHours: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SkillProfile', SkillProfileSchema);
