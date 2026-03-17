const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema({
  user_id1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  user_id2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  connected_at: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Compound index for uniqueness
connectionSchema.index({ user_id1: 1, user_id2: 1 }, { unique: true });

module.exports = mongoose.model('Connection', connectionSchema);

