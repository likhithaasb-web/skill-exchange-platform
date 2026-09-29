const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  reporterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetType: {
    type: String,
    enum: ['user', 'message', 'resource', 'studio', 'review'],
    required: true
  },
  targetId: {
    type: String,
    required: true
  },
  targetDetails: {
    type: Object,
    default: {}
  },
  reason: {
    type: String,
    enum: [
      'Harassment',
      'Spam',
      'Scam',
      'Inappropriate content',
      'Impersonation',
      'Malicious file',
      'Other'
    ],
    required: true
  },
  details: {
    type: String,
    maxlength: 1000,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'investigating', 'resolved', 'dismissed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Report', ReportSchema);
