// src/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  full_name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    match: /^.+@.+\..+$/
  },

  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ['student', 'university_admin', 'super_admin'],
    default: 'student'
  },

  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },

  blocked: {
    type: Boolean,
    default: false
  },

  student_id: {
    type: String,
    default: null
  },

  university: {
    type: String,
    default: null
  },

  // ✅ batch must be Number to match MongoDB validator
  batch: {
    type: Number,
    default: null
  },

  id_image_url: {
    type: String,
    default: null
  },

  // ✅ MongoDB validator requires an object, but allow null for new users
  id_verification: {
    type: {
      file_path: { type: String },
      uploaded_at: { type: Date },
      verified: { type: Boolean, default: false }
    },
    default: null
  },

  profile_picture: {
    type: String,
    default: null
  },

  cover_photo: {
    type: String,
    default: null
  },

  bio: {
    type: String,
    default: null
  },

  interests: {
    type: [String],
    default: null
  },

  skills: {
    type: [String],
    default: null
  },

  linkedin: {
    type: String,
    default: null
  },

  twitter: {
    type: String,
    default: null
  },

  instagram: {
    type: String,
    default: null
  },

  website: {
    type: String,
    default: null
  },

  profile_visibility: {
    type: String,
    enum: ['public', 'university', 'connections', 'private'],
    default: 'public'
  },

  is_deleted: {
    type: Boolean,
    default: false
  },

  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
