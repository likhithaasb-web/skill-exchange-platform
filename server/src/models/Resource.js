const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  studioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SkillStudio',
    required: true
  },
  exchangeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SkillExchange'
  },
  uploaderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploaderUsername: {
    type: String,
    required: true
  },
  uploaderDisplayName: {
    type: String,
    required: true
  },
  uploaderAvatar: {
    type: Object,
    default: {}
  },
  originalName: {
    type: String,
    required: true
  },
  storedFilename: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    enum: ['PDF', 'DOC', 'DOCX', 'PPT', 'PPTX', 'TXT', 'IMAGE', 'CODE', 'ZIP', 'OTHER'],
    default: 'OTHER'
  },
  mimeType: {
    type: String,
    required: true
  },
  sizeBytes: {
    type: Number,
    required: true
  },
  storagePath: {
    type: String,
    required: true
  },
  description: {
    type: String,
    maxlength: 300,
    default: ''
  },
  downloadCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Resource', ResourceSchema);
