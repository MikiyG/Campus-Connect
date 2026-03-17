const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  body: { type: String },
  file_path: { type: String }, // path to uploaded file, if any

  // when the recipient viewed this message (null = unread)
  read_at: { type: Date, default: null },

  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);
