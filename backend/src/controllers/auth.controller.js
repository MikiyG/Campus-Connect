
// src/controllers/auth.controller.js
const bcrypt = require('bcryptjs');
const User = require('../models/user'); // ensure correct filename
const { signToken } = require('../utils/jwt');

/* =========================
   LOGIN
========================= */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const user = await User.findOne({ email }).lean();
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    let matched = false;

    // bcrypt comparison
    if (user.password && user.password.length >= 60) {
      matched = await bcrypt.compare(password, user.password);
    } else {
      // fallback for plain-text passwords
      matched = password === user.password;
      if (matched) {
        const hashed = await bcrypt.hash(password, 12);
        await User.updateOne({ _id: user._id }, { password: hashed });
      }
    }

    if (!matched) return res.status(401).json({ message: 'Invalid credentials' });
    if (user.status !== 'approved') return res.status(403).json({ message: 'Account not approved' });

    const token = signToken({ id: user._id, role: user.role });
    delete user.password;

    res.json({ token, user });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Login failed' });
  }
};

/* =========================
   REGISTER
========================= */
exports.register = async (req, res) => {
  try {
    console.log('Register endpoint called');
    console.log('req.file:', req.file);
    console.log('req.body:', req.body);

    const { full_name, email, password, university, student_id, batch } = req.body;

    if (!full_name || !email || !password || !university || !batch) {
      return res.status(400).json({
        message: 'Required fields: full name, email, password, university, batch'
      });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 12);

    // Build user object matching MongoDB schema
    const userObj = {
      full_name,
      email,
      password: hashedPassword,
      role: 'student',
      status: 'pending',

      university_id: null,       // TODO: link to actual university _id
      managed_university_id: null,

      student_id: student_id || null,
      batch: batch ? parseInt(batch, 10) : null, // FIX: ensure integer

      profile_picture: null,
      cover_photo: null,
      bio: null,

      interests: null,
      skills: null,

      linkedin: null,
      twitter: null,

      profile_visibility: 'public',
      id_verification: null, // ensure matches schema

      approved_by: null,
      approved_at: null,
      rejection_reason: null,

      is_deleted: false,
      created_at: new Date()
    };

    // Handle ID upload
    if (req.file && req.file.filename) {
      const imagePath = `/uploads/ids/${req.file.filename}`;
      userObj.id_verification = {
        file_path: imagePath,
        uploaded_at: new Date(),
        verified: false
      };
      // Also set id_image_url for admin panel display
      userObj.id_image_url = imagePath;
    }

    const user = new User(userObj);
    await user.save();

    return res.status(201).json({
      message: 'Account created successfully. Please wait for admin approval.'
    });
  } catch (err) {
    console.error('Register error:', err);

    if (err.name === 'ValidationError') {
      console.error('Mongoose validation errors:', err.errors);
      return res.status(400).json({ message: 'Validation error', errors: err.errors });
    }

    // MongoDB schema validation error
    if (err.code === 121) {
      console.error('Schema validation failed:', JSON.stringify(err.errInfo, null, 2));
      return res.status(400).json({ message: 'Document validation failed', details: err.errInfo });
    }

    res.status(500).json({ message: 'Could not create account' });
  }
};
