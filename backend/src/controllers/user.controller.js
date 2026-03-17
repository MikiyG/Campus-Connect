const User = require('../models/user');

function normalizeMaybeNullString(value) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const s = String(value).trim();
  return s.length ? s : null;
}

function normalizeStringArray(value) {
  if (value === undefined) return undefined;
  if (value === null) return null;

  if (Array.isArray(value)) {
    const cleaned = value
      .map((v) => (v === null || v === undefined ? '' : String(v).trim()))
      .filter(Boolean);
    return cleaned.length ? cleaned : null;
  }

  const s = String(value).trim();
  if (!s.length) return null;
  const cleaned = s
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
  return cleaned.length ? cleaned : null;
}

function sanitizeUser(userDoc) {
  if (!userDoc) return null;
  const obj = userDoc.toObject ? userDoc.toObject() : userDoc;
  delete obj.password;
  return obj;
}

exports.getMe = async (req, res) => {
  try {
    const id = req.user?.id;
    if (!id) return res.status(401).json({ message: 'Unauthorized' });

    const user = await User.findById(id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ user: sanitizeUser(user) });
  } catch (err) {
    console.error('getMe error', err);
    res.status(500).json({ message: 'Failed to load profile' });
  }
};

exports.updateMe = async (req, res) => {
  try {
    const id = req.user?.id;
    if (!id) return res.status(401).json({ message: 'Unauthorized' });

    const update = {};
    if (req.body.full_name !== undefined) update.full_name = normalizeMaybeNullString(req.body.full_name);
    if (req.body.bio !== undefined) update.bio = normalizeMaybeNullString(req.body.bio);
    if (req.body.linkedin !== undefined) update.linkedin = normalizeMaybeNullString(req.body.linkedin);
    if (req.body.twitter !== undefined) update.twitter = normalizeMaybeNullString(req.body.twitter);
    if (req.body.instagram !== undefined) update.instagram = normalizeMaybeNullString(req.body.instagram);
    if (req.body.website !== undefined) update.website = normalizeMaybeNullString(req.body.website);
    if (req.body.profile_visibility !== undefined) update.profile_visibility = normalizeMaybeNullString(req.body.profile_visibility);
    if (req.body.interests !== undefined) update.interests = normalizeStringArray(req.body.interests);
    if (req.body.skills !== undefined) update.skills = normalizeStringArray(req.body.skills);

    const user = await User.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true, projection: { password: 0 } }
    );

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Profile updated', user: sanitizeUser(user) });
  } catch (err) {
    console.error('updateMe error', err);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

exports.uploadProfilePicture = async (req, res) => {
  try {
    const id = req.user?.id;
    if (!id) return res.status(401).json({ message: 'Unauthorized' });

    if (!req.file || !req.file.filename) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    const imagePath = `/uploads/profiles/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(
      id,
      { $set: { profile_picture: imagePath } },
      { new: true, projection: { password: 0 } }
    );

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Profile picture updated', user: sanitizeUser(user), profile_picture: imagePath });
  } catch (err) {
    console.error('uploadProfilePicture error', err);
    res.status(500).json({ message: 'Failed to upload profile picture' });
  }
};

exports.searchByEmail = async (req, res) => {
  try {
    const myId = req.user?.id;
    if (!myId) return res.status(401).json({ message: 'Unauthorized' });

    const emailRaw = req.query?.email;
    const email = String(emailRaw || '').trim();
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') })
      .select('full_name email profile_picture university profile_visibility')
      .lean();

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (String(user._id) === String(myId)) return res.status(400).json({ message: 'Cannot message yourself' });

    // Check profile visibility
    const role = req.user?.role;
    const isAdmin = role === 'university_admin' || role === 'super_admin';
    
    if (!isAdmin) {
      const visibility = user.profile_visibility || 'public';
      
      // If profile is private, don't allow searching
      if (visibility === 'private') {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // If profile is university-only, check if same university
      if (visibility === 'university') {
        const myUser = await User.findById(myId).select('university').lean();
        if (!myUser || myUser.university !== user.university) {
          return res.status(404).json({ message: 'User not found' });
        }
      }
      
      // If profile is connections-only, check if they are connected
      if (visibility === 'connections') {
        // This would require implementing a connections/friends system
        // For now, treat connections-only as private
        return res.status(404).json({ message: 'User not found' });
      }
    }

    res.json({ user });
  } catch (err) {
    console.error('searchByEmail error', err);
    res.status(500).json({ message: 'Failed to search user' });
  }
};

// DELETE /api/users/me - Delete current user's account
exports.deleteMe = async (req, res) => {
  try {
    const id = req.user?.id;
    if (!id) return res.status(401).json({ message: 'Unauthorized' });

    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // In a real app, you might want to:
    // - Delete related data (events, groups, messages)
    // - Clear refresh tokens from database
    // - Send a goodbye email

    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error('deleteMe error', err);
    res.status(500).json({ message: 'Failed to delete account' });
  }
};
