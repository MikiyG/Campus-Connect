// src/routes/group.routes.js
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const groupController = require('../controllers/group.controller');
const uploadFiles = require('../utils/uploadFiles');

// basic health check
router.get('/test', (req, res) => {
  res.json({ message: 'Group routes OK' });
});

// group listing
router.get('/', auth, groupController.listGroups);
router.get('/mine', auth, groupController.listMyGroups);

// create / delete group
router.post('/', auth, groupController.createGroup);
router.delete('/:id', auth, groupController.deleteGroup);

// membership
router.post('/:id/join', auth, groupController.joinGroup);
router.post('/:id/leave', auth, groupController.leaveGroup);

// group privacy and member management
router.put('/:id/privacy', auth, groupController.updateGroupPrivacy);
router.post('/:id/add-member', auth, groupController.addMember);
router.delete('/:id/remove-member/:memberId', auth, groupController.removeMember);

// group messaging
router.get('/:id/messages', auth, groupController.listMessages);
router.post('/:id/messages', auth, uploadFiles.single('file'), groupController.sendMessage);

module.exports = router;
