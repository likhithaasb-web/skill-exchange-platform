const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  exchangeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SkillExchange',
    required: true
  },
  reviewerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skillTaught: {
    type: String,
    required: true
  },
  appreciationChips: {
    type: [String],
    default: []
  },
  personalNote: {
    type: String,
    maxlength: 1000,
    default: ''
  },
  visibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'public'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Review', ReviewSchema);
