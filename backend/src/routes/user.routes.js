// src/routes/user.routes.js
const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth.middleware');
const userController = require('../controllers/user.controller');
const uploadProfile = require('../utils/uploadProfile');

router.get('/test', (req, res) => {
	res.json({ message: 'User routes OK' });
});

// current user profile
router.get('/me', auth, userController.getMe);
router.patch('/me', auth, userController.updateMe);

router.get('/search', auth, userController.searchByEmail);

// profile picture upload
router.post('/me/profile-picture', auth, uploadProfile.single('profile_picture'), userController.uploadProfilePicture);

// delete current user account
router.delete('/me', auth, userController.deleteMe);

module.exports = router;
