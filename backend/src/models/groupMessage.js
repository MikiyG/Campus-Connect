const mongoose = require('mongoose');

const groupMessageSchema = new mongoose.Schema({
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true,
  },
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  body: {
    type: String,
    required: true,
    trim: true,
  },
  file_path: { type: String }, // path to uploaded file, if any
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('GroupMessage', groupMessageSchema);

