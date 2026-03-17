
const mongoose = require('mongoose');
const Message = require('../models/message');
const User = require('../models/user');
const ContactMessage = require('../models/contactMessage');

function requireUserId(req) {
  const id = req.user?.id;
  if (!id) {
    const err = new Error('Unauthorized');
    err.status = 401;
    throw err;
  }
  return id;
}

exports.listConversations = async (req, res, next) => {
  try {
    const myId = requireUserId(req);

    const docs = await Message.find({
      $or: [{ from: myId }, { to: myId }]
    })
      .sort({ created_at: -1 })
      .limit(500)
      .lean();

    const byOtherId = new Map();

    for (const m of docs) {
      const fromId = String(m.from);
      const toId = String(m.to);
      const otherId = fromId === String(myId) ? toId : fromId;
      if (!otherId) continue;
      if (!byOtherId.has(otherId)) {
        byOtherId.set(otherId, {
          other_user_id: otherId,
          last_message_body: m.body || '',
          last_message_at: m.created_at,
          // unread if there exists at least one message in this direction not read
          has_unread: false,
        });
      }
    }

    // compute unread per conversation
    for (const m of docs) {
      const toId = String(m.to);
      const fromId = String(m.from);
      if (toId !== String(myId)) continue; // only messages sent to me can be unread
      if (m.read_at) continue;
      const otherId = fromId;
      const conv = byOtherId.get(otherId);
      if (conv) {
        conv.has_unread = true;
      }
    }

    const otherIds = Array.from(byOtherId.keys())
      .filter((id) => mongoose.Types.ObjectId.isValid(id));

    const users = await User.find({ _id: { $in: otherIds } })
      .select('full_name email profile_picture university bio')
      .lean();

    const userById = new Map(users.map((u) => [String(u._id), u]));

    const conversations = Array.from(byOtherId.values())
      .map((c) => ({
        ...c,
        other_user: userById.get(String(c.other_user_id)) || null,
      }))
      .sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());

    res.json(conversations);
  } catch (err) {
    next(err);
  }
};

exports.getThread = async (req, res, next) => {
  try {
    const myId = requireUserId(req);
    const otherUserId = req.params.otherUserId;
    if (!otherUserId) return res.status(400).json({ message: 'otherUserId is required' });
    if (!mongoose.Types.ObjectId.isValid(otherUserId)) return res.status(400).json({ message: 'Invalid user id' });

    const messages = await Message.find({
      $or: [
        { from: myId, to: otherUserId },
        { from: otherUserId, to: myId },
      ]
    })
      .sort({ created_at: 1 })
      .populate('from', 'full_name email profile_picture')
      .populate('to', 'full_name email profile_picture')
      .lean();

    res.json(messages);
  } catch (err) {
    next(err);
  }
};

exports.sendMessage = async (req, res, next) => {
  try {
    const myId = requireUserId(req);
    const { to, body } = req.body || {};
    if (!to) return res.status(400).json({ message: '`to` is required' });
    if (!mongoose.Types.ObjectId.isValid(to)) return res.status(400).json({ message: 'Invalid recipient id' });

    const trimmed = body === undefined || body === null ? '' : String(body).trim();
    if (!trimmed.length && !req.file) return res.status(400).json({ message: 'Message body or file is required' });

    const recipient = await User.findById(to).select('_id').lean();
    if (!recipient) return res.status(404).json({ message: 'Recipient not found' });

    const messageData = { from: myId, to, body: trimmed };

    if (req.file && req.file.filename) {
      messageData.file_path = `/uploads/files/${req.file.filename}`;
    }

    const created = await Message.create(messageData);
    const hydrated = await Message.findById(created._id)
      .populate('from', 'full_name email profile_picture')
      .populate('to', 'full_name email profile_picture')
      .lean();

    res.status(201).json(hydrated);
  } catch (err) {
    next(err);
  }
};

// total unread messages for current user
exports.unreadCount = async (req, res, next) => {
  try {
    const myId = requireUserId(req);
    const count = await Message.countDocuments({
      to: myId,
      read_at: null,
    });
    res.json({ unread: count });
  } catch (err) {
    next(err);
  }
};

// mark all messages from otherUserId -> me as read
exports.markThreadRead = async (req, res, next) => {
  try {
    const myId = requireUserId(req);
    const otherUserId = req.params.otherUserId;
    if (!otherUserId) return res.status(400).json({ message: 'otherUserId is required' });
    if (!mongoose.Types.ObjectId.isValid(otherUserId)) return res.status(400).json({ message: 'Invalid user id' });

    const result = await Message.updateMany(
      {
        from: otherUserId,
        to: myId,
        read_at: null,
      },
      { $set: { read_at: new Date() } }
    );

    res.json({ updated: result.modifiedCount || 0 });
  } catch (err) {
    next(err);
  }
};

exports.submitContact = async (req, res, next) => {
  try {
    const { name, email, body } = req.body || {};
    const cleanName = String(name || '').trim();
    const cleanEmail = String(email || '').trim();
    const cleanBody = String(body || '').trim();

    if (!cleanName) return res.status(400).json({ message: 'Name is required' });
    if (!cleanEmail) return res.status(400).json({ message: 'Email is required' });
    if (!cleanBody) return res.status(400).json({ message: 'Message is required' });

    await ContactMessage.create({
      name: cleanName,
      email: cleanEmail,
      body: cleanBody,
    });

    res.status(201).json({ message: 'Message received' });
  } catch (err) {
    next(err);
  }
};
