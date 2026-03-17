const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },

  // privacy settings: public (anyone can see and join) or private (only added members can see and join)
  privacy: {
    type: String,
    enum: ['public', 'private'],
    default: 'public'
  },

  // user who created the group
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  // members of the group (creator will also be a member)
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],

  blocked: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Group', groupSchema);
