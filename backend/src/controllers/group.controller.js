const mongoose = require('mongoose');
const Group = require('../models/group');
const GroupMessage = require('../models/groupMessage');

function requireUserId(req) {
  const id = req.user?.id;
  if (!id) {
    const err = new Error('Unauthorized');
    err.status = 401;
    throw err;
  }
  return id;
}

// GET /api/groups
// List all non-blocked groups that are visible to the user
exports.listGroups = async (req, res, next) => {
  try {
    const userId = requireUserId(req);
    const role = req.user?.role;
    const isAdmin = role === 'university_admin' || role === 'super_admin';

    let query = { blocked: false };
    
    // If not admin, only show public groups or groups the user is a member of
    if (!isAdmin) {
      query.$or = [
        { privacy: 'public' },
        { privacy: 'private', members: userId }
      ];
    }

    const groups = await Group.find(query)
      .sort({ created_at: -1 })
      .populate('created_by', 'full_name email')
      .populate('members', 'full_name email')
      .lean();
    res.json(groups);
  } catch (err) {
    next(err);
  }
};

// GET /api/groups/mine
exports.listMyGroups = async (req, res, next) => {
  try {
    const userId = requireUserId(req);
    const groups = await Group.find({ members: userId, blocked: false })
      .sort({ created_at: -1 })
      .populate('created_by', 'full_name email')
      .populate('members', 'full_name email')
      .lean();
    res.json(groups);
  } catch (err) {
    next(err);
  }
};

// POST /api/groups
exports.createGroup = async (req, res, next) => {
  try {
    const userId = requireUserId(req);
    const { name, description, privacy } = req.body || {};

    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const group = await Group.create({
      name: String(name).trim(),
      description: description ? String(description).trim() : undefined,
      privacy: privacy || 'public',
      created_by: userId,
      members: [userId],
    });

    const populated = await Group.findById(group._id)
      .populate('created_by', 'full_name email')
      .populate('members', 'full_name email')
      .lean();

    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/groups/:id
// Only creator or admin
exports.deleteGroup = async (req, res, next) => {
  try {
    const userId = requireUserId(req);
    const groupId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ message: 'Invalid group id' });
    }

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const isCreator = String(group.created_by) === String(userId);
    const role = req.user?.role;
    const isAdmin = role === 'university_admin' || role === 'super_admin';

    if (!isCreator && !isAdmin) {
      return res.status(403).json({ message: 'Not allowed to delete this group' });
    }

    await Group.findByIdAndDelete(groupId);
    await GroupMessage.deleteMany({ group: groupId });

    res.json({ message: 'Group deleted' });
  } catch (err) {
    next(err);
  }
};

// POST /api/groups/:id/join
exports.joinGroup = async (req, res, next) => {
  try {
    const userId = requireUserId(req);
    const groupId = req.params.id;
    const role = req.user?.role;
    const isAdmin = role === 'university_admin' || role === 'super_admin';

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ message: 'Invalid group id' });
    }

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (group.blocked) return res.status(403).json({ message: 'Group is blocked' });

    // Check if user can join this group based on privacy
    if (group.privacy === 'private' && !isAdmin) {
      return res.status(403).json({ message: 'This is a private group. Only added members can join.' });
    }

    const updated = await Group.findOneAndUpdate(
      { _id: groupId, blocked: false },
      { $addToSet: { members: userId } },
      { new: true }
    )
      .populate('created_by', 'full_name email')
      .populate('members', 'full_name email')
      .lean();

    if (!updated) return res.status(404).json({ message: 'Group not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// POST /api/groups/:id/leave
exports.leaveGroup = async (req, res, next) => {
  try {
    const userId = requireUserId(req);
    const groupId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ message: 'Invalid group id' });
    }

    const updated = await Group.findByIdAndUpdate(
      groupId,
      { $pull: { members: userId } },
      { new: true }
    )
      .populate('created_by', 'full_name email')
      .populate('members', 'full_name email')
      .lean();

    if (!updated) return res.status(404).json({ message: 'Group not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// ===== Group messaging =====

// helper: ensure membership
async function ensureMember(groupId, userId) {
  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    const err = new Error('Invalid group id');
    err.status = 400;
    throw err;
  }

  const group = await Group.findById(groupId).select('members blocked');
  if (!group) {
    const err = new Error('Group not found');
    err.status = 404;
    throw err;
  }
  if (group.blocked) {
    const err = new Error('Group is blocked');
    err.status = 403;
    throw err;
  }

  const isMember = group.members.some((m) => String(m) === String(userId));
  if (!isMember) {
    const err = new Error('You must join the group to view or send messages');
    err.status = 403;
    throw err;
  }

  return group;
}

// GET /api/groups/:id/messages
exports.listMessages = async (req, res, next) => {
  try {
    const userId = requireUserId(req);
    const groupId = req.params.id;

    await ensureMember(groupId, userId);

    const messages = await GroupMessage.find({ group: groupId })
      .sort({ created_at: 1 })
      .populate('from', 'full_name email profile_picture')
      .lean();

    res.json(messages);
  } catch (err) {
    next(err);
  }
};

// POST /api/groups/:id/messages
exports.sendMessage = async (req, res, next) => {
  try {
    const userId = requireUserId(req);
    const groupId = req.params.id;
    const { body } = req.body || {};

    const trimmed = body === undefined || body === null ? '' : String(body).trim();
    if (!trimmed.length && !req.file) {
      return res.status(400).json({ message: 'Message body or file is required' });
    }

    await ensureMember(groupId, userId);

    const messageData = {
      group: groupId,
      from: userId,
      body: trimmed,
    };

    if (req.file && req.file.filename) {
      messageData.file_path = `/uploads/files/${req.file.filename}`;
    }

    const created = await GroupMessage.create(messageData);

    const hydrated = await GroupMessage.findById(created._id)
      .populate('from', 'full_name email profile_picture')
      .lean();

    res.status(201).json(hydrated);
  } catch (err) {
    next(err);
  }
};

// PUT /api/groups/:id/privacy
// Update group privacy (only creator or admin)
exports.updateGroupPrivacy = async (req, res, next) => {
  try {
    const userId = requireUserId(req);
    const groupId = req.params.id;
    const { privacy } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ message: 'Invalid group id' });
    }

    if (!privacy || !['public', 'private'].includes(privacy)) {
      return res.status(400).json({ message: 'Privacy must be either "public" or "private"' });
    }

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const isCreator = String(group.created_by) === String(userId);
    const role = req.user?.role;
    const isAdmin = role === 'university_admin' || role === 'super_admin';

    if (!isCreator && !isAdmin) {
      return res.status(403).json({ message: 'Only the group creator or admin can change privacy settings' });
    }

    const updated = await Group.findByIdAndUpdate(
      groupId,
      { privacy },
      { new: true }
    )
      .populate('created_by', 'full_name email')
      .populate('members', 'full_name email')
      .lean();

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// POST /api/groups/:id/add-member
// Add a user to a private group (only creator or admin)
exports.addMember = async (req, res, next) => {
  try {
    const userId = requireUserId(req);
    const groupId = req.params.id;
    const { memberId } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ message: 'Invalid group id' });
    }

    if (!mongoose.Types.ObjectId.isValid(memberId)) {
      return res.status(400).json({ message: 'Invalid member id' });
    }

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const isCreator = String(group.created_by) === String(userId);
    const role = req.user?.role;
    const isAdmin = role === 'university_admin' || role === 'super_admin';

    if (!isCreator && !isAdmin) {
      return res.status(403).json({ message: 'Only the group creator or admin can add members' });
    }

    const updated = await Group.findByIdAndUpdate(
      groupId,
      { $addToSet: { members: memberId } },
      { new: true }
    )
      .populate('created_by', 'full_name email')
      .populate('members', 'full_name email')
      .lean();

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/groups/:id/remove-member/:memberId
// Remove a user from a group (only creator or admin)
exports.removeMember = async (req, res, next) => {
  try {
    const userId = requireUserId(req);
    const groupId = req.params.id;
    const memberId = req.params.memberId;

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ message: 'Invalid group id' });
    }

    if (!mongoose.Types.ObjectId.isValid(memberId)) {
      return res.status(400).json({ message: 'Invalid member id' });
    }

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const isCreator = String(group.created_by) === String(userId);
    const role = req.user?.role;
    const isAdmin = role === 'university_admin' || role === 'super_admin';

    if (!isCreator && !isAdmin) {
      return res.status(403).json({ message: 'Only the group creator or admin can remove members' });
    }

    // Don't allow removing the creator
    if (String(group.created_by) === String(memberId)) {
      return res.status(400).json({ message: 'Cannot remove the group creator' });
    }

    const updated = await Group.findByIdAndUpdate(
      groupId,
      { $pull: { members: memberId } },
      { new: true }
    )
      .populate('created_by', 'full_name email')
      .populate('members', 'full_name email')
      .lean();

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

