const mongoose = require('mongoose');

const DirectMessageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  text: {
    type: String,
    required: true,
    maxlength: 2000,
  },
  attachments: [{
    filename: String,
    url: String,
    fileType: String,
  }],
  isRead: {
    type: Boolean,
    default: false,
  },
  readAt: Date,
}, {
  timestamps: true,
});

// Index for high-performance conversation querying
DirectMessageSchema.index({ senderId: 1, recipientId: 1, createdAt: -1 });

module.exports = mongoose.model('DirectMessage', DirectMessageSchema);
