const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  certificateId: {
    type: String,
    unique: true,
    required: true,
    uppercase: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['experience', 'lor', 'appreciation'],
    default: 'appreciation',
  },
  certTitle: {
    type: String,
    default: 'CERTIFICATE OF APPRECIATION',
    trim: true,
  },
  studentName: {
    type: String,
    required: [true, 'Recipient name is required'],
    trim: true,
  },
  college: {
    type: String,
    default: '',
    trim: true,
  },
  role: {
    type: String,
    required: [true, 'Work / role is required'],
    trim: true,
  },
  duration: {
    type: String,
    default: '',
    trim: true,
  },
  projectsCompleted: {
    type: Number,
    default: 1,
    min: 0,
  },
  endorsementText: {
    type: String,
    default: '',
    trim: true,
  },
  skills: [{
    type: String,
    trim: true,
  }],
  msmeRegNo: {
    type: String,
    default: 'UDYAM-UP-48-0068269',
  },
  issuedBy: {
    type: String,
    default: 'Swatantra Shukla',
  },
  issuedAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['active', 'revoked'],
    default: 'active',
  },
});

module.exports = mongoose.model('Certificate', certificateSchema);
