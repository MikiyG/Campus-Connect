const mongoose = require('mongoose');
const Event = require('../models/event');

function requireUserId(req) {
  const id = req.user?.id;
  if (!id) {
    const err = new Error('Unauthorized');
    err.status = 401;
    throw err;
  }
  return id;
}

// GET /api/events
// List approved events (public listing)
exports.listEvents = async (req, res, next) => {
  try {
    const filter = { status: 'approved' };
    const events = await Event.find(filter)
      .sort({ date: 1, created_at: -1 })
      .populate('created_by', 'full_name email')
      .lean();
    res.json(events);
  } catch (err) {
    next(err);
  }
};

// GET /api/events/mine
// List events created by the current user (any status)
exports.listMyEvents = async (req, res, next) => {
  try {
    const userId = requireUserId(req);
    const events = await Event.find({ created_by: userId })
      .sort({ created_at: -1 })
      .lean();
    res.json(events);
  } catch (err) {
    next(err);
  }
};

// POST /api/events
exports.createEvent = async (req, res, next) => {
  try {
    const userId = requireUserId(req);
    const { title, description, date } = req.body || {};

    if (!title || !String(title).trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const event = await Event.create({
      title: String(title).trim(),
      description: description ? String(description).trim() : undefined,
      date: date ? new Date(date) : null,
      created_by: userId,
      attendees: [userId], // creator automatically joins
      status: 'pending',
    });

    const populated = await Event.findById(event._id)
      .populate('created_by', 'full_name email')
      .lean();

    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/events/:id
// Creator or admin can delete
exports.deleteEvent = async (req, res, next) => {
  try {
    const userId = requireUserId(req);
    const eventId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: 'Invalid event id' });
    }

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const isCreator = String(event.created_by) === String(userId);
    const role = req.user?.role;
    const isAdmin = role === 'university_admin' || role === 'super_admin';

    if (!isCreator && !isAdmin) {
      return res.status(403).json({ message: 'Not allowed to delete this event' });
    }

    await Event.findByIdAndDelete(eventId);
    res.json({ message: 'Event deleted' });
  } catch (err) {
    next(err);
  }
};

// POST /api/events/:id/join
exports.joinEvent = async (req, res, next) => {
  try {
    const userId = requireUserId(req);
    const eventId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: 'Invalid event id' });
    }

    const updated = await Event.findByIdAndUpdate(
      eventId,
      { $addToSet: { attendees: userId } },
      { new: true }
    )
      .populate('created_by', 'full_name email')
      .lean();

    if (!updated) return res.status(404).json({ message: 'Event not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// POST /api/events/:id/leave
exports.leaveEvent = async (req, res, next) => {
  try {
    const userId = requireUserId(req);
    const eventId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: 'Invalid event id' });
    }

    const updated = await Event.findByIdAndUpdate(
      eventId,
      { $pull: { attendees: userId } },
      { new: true }
    )
      .populate('created_by', 'full_name email')
      .lean();

    if (!updated) return res.status(404).json({ message: 'Event not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

