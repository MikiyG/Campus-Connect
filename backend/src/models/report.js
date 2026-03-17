const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  targetType: { type: String, enum: ['user', 'event', 'group', 'message'], required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reason: { type: String },
  status: { type: String, enum: ['open', 'resolved'], default: 'open' },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', reportSchema);
