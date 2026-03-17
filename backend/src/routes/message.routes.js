// src/routes/message.routes.js
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const messageController = require('../controllers/message.controller');
const uploadFiles = require('../utils/uploadFiles');

router.get('/test', (req, res) => {
	res.json({ message: 'Message routes placeholder' });
});

router.get('/conversations', auth, messageController.listConversations);
router.get('/thread/:otherUserId', auth, messageController.getThread);
router.post('/send', auth, uploadFiles.single('file'), messageController.sendMessage);

// notifications / unread
router.get('/unread-count', auth, messageController.unreadCount);
router.post('/thread/:otherUserId/read', auth, messageController.markThreadRead);

router.post('/contact', messageController.submitContact);

module.exports = router;
