// src/controllers/admin.controller.js
const User = require('../models/user');
const Event = require('../models/event');
const Group = require('../models/group');
const Report = require('../models/report');
const ContactMessage = require('../models/contactMessage');
const Message = require('../models/message');
const GroupMessage = require('../models/groupMessage');
const Connection = require('../models/connection');

exports.test = (req, res) => {
  res.json({ ok: true, msg: 'admin API reachable', user: req.user });
};

exports.listUsers = async (req, res) => {
  try {
    // minimal projection to avoid sending password
    const users = await User.find({}, { password: 0 }).limit(200).lean();
    res.json(users);
  } catch (err) {
    console.error('listUsers error', err);
    res.status(500).json({ message: 'Could not fetch users' });
  }
};

exports.approveUser = async (req, res) => {
  try {
    const id = req.params.id;
    const updated = await User.findByIdAndUpdate(id, { $set: { status: 'approved' } }, { new: true, projection: { password: 0 } });
    if (!updated) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User approved', user: updated });
  } catch (err) {
    console.error('approveUser error', err);
    res.status(500).json({ message: 'Could not approve user' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error('deleteUser error', err);
    res.status(500).json({ message: 'Could not delete user' });
  }
};

exports.blockUser = async (req, res) => {
  try {
    const id = req.params.id;
    const updated = await User.findByIdAndUpdate(id, { $set: { blocked: true } }, { new: true, projection: { password: 0 } });
    if (!updated) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User blocked', user: updated });
  } catch (err) {
    console.error('blockUser error', err);
    res.status(500).json({ message: 'Could not block user' });
  }
};

exports.unblockUser = async (req, res) => {
  try {
    const id = req.params.id;
    const updated = await User.findByIdAndUpdate(id, { $set: { blocked: false } }, { new: true, projection: { password: 0 } });
    if (!updated) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User unblocked', user: updated });
  } catch (err) {
    console.error('unblockUser error', err);
    res.status(500).json({ message: 'Could not unblock user' });
  }
};

exports.changeUserRole = async (req, res) => {
  try {
    const id = req.params.id;
    const { role } = req.body;
    if (!role) return res.status(400).json({ message: 'Role is required' });
    const updated = await User.findByIdAndUpdate(id, { $set: { role } }, { new: true, projection: { password: 0 } });
    if (!updated) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User role updated', user: updated });
  } catch (err) {
    console.error('changeUserRole error', err);
    res.status(500).json({ message: 'Could not change user role' });
  }
};

// Events
exports.listEvents = async (req, res) => {
  try {
    const events = await Event.find({})
      .limit(200)
      .populate('created_by', 'full_name email student_id university id_image_url id_verification status role blocked')
      .lean();
    res.json(events);
  } catch (err) {
    console.error('listEvents error', err);
    res.status(500).json({ message: 'Could not fetch events' });
  }
};

exports.approveEvent = async (req, res) => {
  try {
    const id = req.params.id;
    const updated = await Event.findByIdAndUpdate(id, { $set: { status: 'approved' } }, { new: true });
    if (!updated) return res.status(404).json({ message: 'Event not found' });
    res.json({ message: 'Event approved', event: updated });
  } catch (err) {
    console.error('approveEvent error', err);
    res.status(500).json({ message: 'Could not approve event' });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const id = req.params.id;
    const removed = await Event.findByIdAndDelete(id);
    if (!removed) return res.status(404).json({ message: 'Event not found' });
    res.json({ message: 'Event deleted' });
  } catch (err) {
    console.error('deleteEvent error', err);
    res.status(500).json({ message: 'Could not delete event' });
  }
};

// Delete an event and its creator user (if present)
exports.deleteEventAndCreator = async (req, res) => {
  try {
    const id = req.params.id;
    const event = await Event.findById(id).populate('created_by');
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const creator = event.created_by;
    const creatorId = creator?._id;

    await Event.findByIdAndDelete(id);

    if (creatorId) {
      await User.findByIdAndDelete(creatorId);
    }

    res.json({
      message: 'Event and creator deleted',
      deleted_event_id: id,
      deleted_user_id: creatorId || null,
    });
  } catch (err) {
    console.error('deleteEventAndCreator error', err);
    res.status(500).json({ message: 'Could not delete event and creator' });
  }
};

// Groups
exports.listGroups = async (req, res) => {
  try {
    const groups = await Group.find({})
      .limit(200)
      .populate('created_by', 'full_name email student_id university id_image_url id_verification status role blocked')
      .lean();
    res.json(groups);
  } catch (err) {
    console.error('listGroups error', err);
    res.status(500).json({ message: 'Could not fetch groups' });
  }
};

exports.blockGroup = async (req, res) => {
  try {
    const id = req.params.id;
    const updated = await Group.findByIdAndUpdate(id, { $set: { blocked: true } }, { new: true });
    if (!updated) return res.status(404).json({ message: 'Group not found' });
    res.json({ message: 'Group blocked', group: updated });
  } catch (err) {
    console.error('blockGroup error', err);
    res.status(500).json({ message: 'Could not block group' });
  }
};

exports.unblockGroup = async (req, res) => {
  try {
    const id = req.params.id;
    const updated = await Group.findByIdAndUpdate(id, { $set: { blocked: false } }, { new: true });
    if (!updated) return res.status(404).json({ message: 'Group not found' });
    res.json({ message: 'Group unblocked', group: updated });
  } catch (err) {
    console.error('unblockGroup error', err);
    res.status(500).json({ message: 'Could not unblock group' });
  }
};

// Delete a group and its creator user (if present)
exports.deleteGroupAndCreator = async (req, res) => {
  try {
    const id = req.params.id;
    const group = await Group.findById(id).populate('created_by');
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const creator = group.created_by;
    const creatorId = creator?._id;

    await Group.findByIdAndDelete(id);

    if (creatorId) {
      await User.findByIdAndDelete(creatorId);
    }

    res.json({
      message: 'Group and creator deleted',
      deleted_group_id: id,
      deleted_user_id: creatorId || null,
    });
  } catch (err) {
    console.error('deleteGroupAndCreator error', err);
    res.status(500).json({ message: 'Could not delete group and creator' });
  }
};

// Reports
exports.listReports = async (req, res) => {
  try {
    const reports = await Report.find({}).limit(200).lean();
    res.json(reports);
  } catch (err) {
    console.error('listReports error', err);
    res.status(500).json({ message: 'Could not fetch reports' });
  }
};

exports.resolveReport = async (req, res) => {
  try {
    const id = req.params.id;
    const updated = await Report.findByIdAndUpdate(id, { $set: { status: 'resolved' } }, { new: true });
    if (!updated) return res.status(404).json({ message: 'Report not found' });
    res.json({ message: 'Report resolved', report: updated });
  } catch (err) {
    console.error('resolveReport error', err);
    res.status(500).json({ message: 'Could not resolve report' });
  }
};

exports.listContactMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find({})
      .sort({ created_at: -1 })
      .limit(500)
      .lean();
    res.json(messages);
  } catch (err) {
    console.error('listContactMessages error', err);
    res.status(500).json({ message: 'Could not fetch contact messages' });
  }
};

exports.resolveContactMessage = async (req, res) => {
  try {
    const id = req.params.id;
    const updated = await ContactMessage.findByIdAndUpdate(
      id,
      { $set: { resolved: true } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Contact message not found' });
    res.json({ message: 'Contact message resolved', contactMessage: updated });
  } catch (err) {
    console.error('resolveContactMessage error', err);
    res.status(500).json({ message: 'Could not resolve contact message' });
  }
};

// return counts for admin overview (best-effort for collections that may not exist)
exports.stats = async (req, res) => {
  try {
    const counts = {
      users: 0,
      events: 0,
      groups: 0,
      reports: 0,
      messages: 0,
    };

    // users (we always have User)
    counts.users = await User.countDocuments();

    // helper to try to require a model and get counts, otherwise leave 0
    const tryCount = async (name) => {
      try {
        // attempt to load model module (file may not exist in some setups)
        // eslint-disable-next-line global-require
        const Model = require(`../models/${name}`);
        if (Model && typeof Model.countDocuments === 'function') {
          return await Model.countDocuments();
        }
      } catch (e) {
        // model not found or other error — return 0
      }
      return 0;
    };

    counts.events = await tryCount('event');
    counts.groups = await tryCount('group');
    counts.reports = await tryCount('report');
    counts.messages = await tryCount('message');

    res.json(counts);
  } catch (err) {
    console.error('admin.stats error', err);
    res.status(500).json({ message: 'Could not compute stats' });
  }
};

// ==================== REPORT GENERATION ====================

// 1. User Statistics Report
exports.reportUserStats = async (req, res) => {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Total counts
    const totalUsers = await User.countDocuments();
    const blockedUsers = await User.countDocuments({ blocked: true });

    // By role
    const byRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // By status
    const byStatus = await User.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // New users in time periods
    const newUsersLast7Days = await User.countDocuments({ created_at: { $gte: sevenDaysAgo } });
    const newUsersLast30Days = await User.countDocuments({ created_at: { $gte: thirtyDaysAgo } });

    res.json({
      totalUsers,
      blockedUsers,
      byRole: byRole.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
      byStatus: byStatus.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
      newUsersLast7Days,
      newUsersLast30Days,
      generatedAt: now
    });
  } catch (err) {
    console.error('reportUserStats error', err);
    res.status(500).json({ message: 'Could not generate user statistics report' });
  }
};

// 2. Event Statistics Report
exports.reportEventStats = async (req, res) => {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Total counts
    const totalEvents = await Event.countDocuments();

    // By status
    const byStatus = await Event.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Upcoming events (date >= now and approved)
    const upcomingEvents = await Event.countDocuments({
      date: { $gte: now },
      status: 'approved'
    });

    // Events with most attendees (top 5)
    const topEventsByAttendees = await Event.find({})
      .sort({ attendees: -1 })
      .limit(5)
      .select('title date attendees status')
      .lean();

    // New events in time periods
    const newEventsLast7Days = await Event.countDocuments({ created_at: { $gte: sevenDaysAgo } });
    const newEventsLast30Days = await Event.countDocuments({ created_at: { $gte: thirtyDaysAgo } });

    res.json({
      totalEvents,
      upcomingEvents,
      byStatus: byStatus.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
      topEventsByAttendees,
      newEventsLast7Days,
      newEventsLast30Days,
      generatedAt: now
    });
  } catch (err) {
    console.error('reportEventStats error', err);
    res.status(500).json({ message: 'Could not generate event statistics report' });
  }
};

// 3. Group Statistics Report
exports.reportGroupStats = async (req, res) => {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Total counts
    const totalGroups = await Group.countDocuments();
    const blockedGroups = await Group.countDocuments({ blocked: true });

    // Groups by member count distribution
    const memberDistribution = await Group.aggregate([
      {
        $addFields: {
          memberCount: { $size: { $ifNull: ['$members', []] } }
        }
      },
      {
        $bucket: {
          groupBy: '$memberCount',
          boundaries: [0, 5, 10, 25, 50, 100, Infinity],
          default: 'Other',
          output: { count: { $sum: 1 } }
        }
      }
    ]);

    // Most active groups (by member count, top 5)
    const topGroupsByMembers = await Group.find({})
      .sort({ members: -1 })
      .limit(5)
      .select('name description members created_at')
      .lean();

    // New groups in time periods
    const newGroupsLast7Days = await Group.countDocuments({ created_at: { $gte: sevenDaysAgo } });
    const newGroupsLast30Days = await Group.countDocuments({ created_at: { $gte: thirtyDaysAgo } });

    res.json({
      totalGroups,
      blockedGroups,
      memberDistribution: memberDistribution.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
      topGroupsByMembers,
      newGroupsLast7Days,
      newGroupsLast30Days,
      generatedAt: now
    });
  } catch (err) {
    console.error('reportGroupStats error', err);
    res.status(500).json({ message: 'Could not generate group statistics report' });
  }
};

// 4. Activity Report (Messages)
exports.reportActivity = async (req, res) => {
  try {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Direct messages
    const totalDirectMessages = await Message.countDocuments();
    const messagesLast24h = await Message.countDocuments({ created_at: { $gte: twentyFourHoursAgo } });
    const messagesLast7Days = await Message.countDocuments({ created_at: { $gte: sevenDaysAgo } });

    // Group messages
    const totalGroupMessages = await GroupMessage.countDocuments();
    const groupMessagesLast24h = await GroupMessage.countDocuments({ created_at: { $gte: twentyFourHoursAgo } });
    const groupMessagesLast7Days = await GroupMessage.countDocuments({ created_at: { $gte: sevenDaysAgo } });

    // Average messages per conversation (approximation)
    const conversationCount = await Message.distinct('$or');
    // Note: This is a simplified calculation

    // Most active conversation partners
    const topMessageSenders = await Message.aggregate([
      { $group: { _id: '$from', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          userId: '$_id',
          userName: '$user.full_name',
          userEmail: '$user.email',
          messageCount: '$count'
        }
      }
    ]);

    res.json({
      directMessages: {
        total: totalDirectMessages,
        last24Hours: messagesLast24h,
        last7Days: messagesLast7Days
      },
      groupMessages: {
        total: totalGroupMessages,
        last24Hours: groupMessagesLast24h,
        last7Days: groupMessagesLast7Days
      },
      topMessageSenders,
      generatedAt: now
    });
  } catch (err) {
    console.error('reportActivity error', err);
    res.status(500).json({ message: 'Could not generate activity report' });
  }
};

// 5. Content Moderation Report
exports.reportModeration = async (req, res) => {
  try {
    const totalReports = await Report.countDocuments();

    // By status
    const byStatus = await Report.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // By type
    const byType = await Report.aggregate([
      { $group: { _id: '$targetType', count: { $sum: 1 } } }
    ]);

    // Resolution rate
    const resolvedCount = await Report.countDocuments({ status: 'resolved' });
    const openCount = await Report.countDocuments({ status: 'open' });
    const resolutionRate = totalReports > 0 ? ((resolvedCount / totalReports) * 100).toFixed(2) : 0;

    // Recent reports (last 10)
    const recentReports = await Report.find({})
      .sort({ created_at: -1 })
      .limit(10)
      .lean();

    // Reports by day (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const reportsByDay = await Report.aggregate([
      { $match: { created_at: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      totalReports,
      byStatus: byStatus.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
      byType: byType.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
      resolvedCount,
      openCount,
      resolutionRate: parseFloat(resolutionRate),
      recentReports,
      reportsByDay: reportsByDay.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
      generatedAt: new Date()
    });
  } catch (err) {
    console.error('reportModeration error', err);
    res.status(500).json({ message: 'Could not generate moderation report' });
  }
};

// 6. Engagement Report
exports.reportEngagement = async (req, res) => {
  try {
    // Total connections
    const totalConnections = await Connection.countDocuments({ status: 'accepted' });
    const pendingConnections = await Connection.countDocuments({ status: 'pending' });

    // Total contact messages
    const totalContactMessages = await ContactMessage.countDocuments();
    const unresolvedContactMessages = await ContactMessage.countDocuments({ resolved: false });

    // Users by engagement level (event participation)
    const topEventParticipants = await Event.aggregate([
      { $unwind: '$attendees' },
      { $group: { _id: '$attendees', eventCount: { $sum: 1 } } },
      { $sort: { eventCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          userId: '$_id',
          userName: '$user.full_name',
          userEmail: '$user.email',
          eventsAttended: '$eventCount'
        }
      }
    ]);

    // Users by group membership
    const topGroupMembers = await Group.aggregate([
      { $unwind: '$members' },
      { $group: { _id: '$members', groupCount: { $sum: 1 } } },
      { $sort: { groupCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          userId: '$_id',
          userName: '$user.full_name',
          userEmail: '$user.email',
          groupsJoined: '$groupCount'
        }
      }
    ]);

    // Overall engagement metrics
    const Message = require('../models/message');
    const totalMessages = await Message.countDocuments();
    const totalGroupMessages = await GroupMessage.countDocuments();

    res.json({
      connections: {
        total: totalConnections,
        pending: pendingConnections
      },
      contactMessages: {
        total: totalContactMessages,
        unresolved: unresolvedContactMessages
      },
      messages: {
        direct: totalMessages,
        group: totalGroupMessages
      },
      topEventParticipants,
      topGroupMembers,
      generatedAt: new Date()
    });
  } catch (err) {
    console.error('reportEngagement error', err);
    res.status(500).json({ message: 'Could not generate engagement report' });
  }
};

// Generate all reports at once
exports.generateAllReports = async (req, res) => {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // User Stats
    const totalUsers = await User.countDocuments();
    const blockedUsers = await User.countDocuments({ blocked: true });
    const byRole = await User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]);
    const byStatus = await User.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
    const newUsersLast7Days = await User.countDocuments({ created_at: { $gte: sevenDaysAgo } });
    const newUsersLast30Days = await User.countDocuments({ created_at: { $gte: thirtyDaysAgo } });

    // Event Stats
    const totalEvents = await Event.countDocuments();
    const upcomingEvents = await Event.countDocuments({ date: { $gte: now }, status: 'approved' });
    const byEventStatus = await Event.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
    const topEventsByAttendees = await Event.find({}).sort({ attendees: -1 }).limit(5).select('title date attendees status').lean();
    const newEventsLast7Days = await Event.countDocuments({ created_at: { $gte: sevenDaysAgo } });
    const newEventsLast30Days = await Event.countDocuments({ created_at: { $gte: thirtyDaysAgo } });

    // Group Stats
    const totalGroups = await Group.countDocuments();
    const blockedGroups = await Group.countDocuments({ blocked: true });
    const topGroupsByMembers = await Group.find({}).sort({ members: -1 }).limit(5).select('name description members created_at').lean();
    const newGroupsLast7Days = await Group.countDocuments({ created_at: { $gte: sevenDaysAgo } });
    const newGroupsLast30Days = await Group.countDocuments({ created_at: { $gte: thirtyDaysAgo } });

    // Activity Stats
    const totalDirectMessages = await Message.countDocuments();
    const messagesLast24h = await Message.countDocuments({ created_at: { $gte: twentyFourHoursAgo } });
    const messagesLast7Days = await Message.countDocuments({ created_at: { $gte: sevenDaysAgo } });
    const totalGroupMessages = await GroupMessage.countDocuments();
    const groupMessagesLast24h = await GroupMessage.countDocuments({ created_at: { $gte: twentyFourHoursAgo } });
    const groupMessagesLast7Days = await GroupMessage.countDocuments({ created_at: { $gte: sevenDaysAgo } });

    // Moderation Stats
    const totalReports = await Report.countDocuments();
    const resolvedCount = await Report.countDocuments({ status: 'resolved' });
    const openCount = await Report.countDocuments({ status: 'open' });
    const resolutionRate = totalReports > 0 ? ((resolvedCount / totalReports) * 100).toFixed(2) : 0;
    const byReportStatus = await Report.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
    const byReportType = await Report.aggregate([{ $group: { _id: '$targetType', count: { $sum: 1 } } }]);

    // Engagement Stats
    const totalConnections = await Connection.countDocuments({ status: 'accepted' });
    const pendingConnections = await Connection.countDocuments({ status: 'pending' });
    const totalContactMessages = await ContactMessage.countDocuments();

    res.json({
      userStats: {
        totalUsers,
        blockedUsers,
        byRole: byRole.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
        byStatus: byStatus.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
        newUsersLast7Days,
        newUsersLast30Days
      },
      eventStats: {
        totalEvents,
        upcomingEvents,
        byStatus: byEventStatus.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
        topEventsByAttendees,
        newEventsLast7Days,
        newEventsLast30Days
      },
      groupStats: {
        totalGroups,
        blockedGroups,
        topGroupsByMembers,
        newGroupsLast7Days,
        newGroupsLast30Days
      },
      activityStats: {
        directMessages: { total: totalDirectMessages, last24Hours: messagesLast24h, last7Days: messagesLast7Days },
        groupMessages: { total: totalGroupMessages, last24Hours: groupMessagesLast24h, last7Days: groupMessagesLast7Days }
      },
      moderationStats: {
        totalReports,
        resolvedCount,
        openCount,
        resolutionRate: parseFloat(resolutionRate),
        byStatus: byReportStatus.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
        byType: byReportType.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {})
      },
      engagementStats: {
        connections: { total: totalConnections, pending: pendingConnections },
        contactMessages: { total: totalContactMessages }
      },
      generatedAt: now
    });
  } catch (err) {
    console.error('generateAllReports error', err);
    res.status(500).json({ message: 'Could not generate all reports' });
  }
};
