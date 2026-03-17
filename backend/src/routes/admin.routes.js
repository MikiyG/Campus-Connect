// src/routes/admin.routes.js
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const requireAdmin = require('../middlewares/role.middleware');
const adminController = require('../controllers/admin.controller');

// simple health check
router.get('/test', auth, requireAdmin, adminController.test);

// list users (admin)
router.get('/users', auth, requireAdmin, adminController.listUsers);

// stats: counts for overview
router.get('/stats', auth, requireAdmin, adminController.stats);
// approve a user (set status to 'approved')
router.patch('/users/:id/approve', auth, requireAdmin, adminController.approveUser);
// delete a user
router.delete('/users/:id', auth, requireAdmin, adminController.deleteUser);
// block/unblock a user
router.patch('/users/:id/block', auth, requireAdmin, adminController.blockUser);
router.patch('/users/:id/unblock', auth, requireAdmin, adminController.unblockUser);
// change user role
router.patch('/users/:id/role', auth, requireAdmin, adminController.changeUserRole);

// Events
router.get('/events', auth, requireAdmin, adminController.listEvents);
router.patch('/events/:id/approve', auth, requireAdmin, adminController.approveEvent);
router.delete('/events/:id', auth, requireAdmin, adminController.deleteEvent);
router.delete('/events/:id/with-creator', auth, requireAdmin, adminController.deleteEventAndCreator);

// Groups
router.get('/groups', auth, requireAdmin, adminController.listGroups);
router.patch('/groups/:id/block', auth, requireAdmin, adminController.blockGroup);
router.patch('/groups/:id/unblock', auth, requireAdmin, adminController.unblockGroup);
router.delete('/groups/:id/with-creator', auth, requireAdmin, adminController.deleteGroupAndCreator);

// Reports
router.get('/reports', auth, requireAdmin, adminController.listReports);
router.patch('/reports/:id/resolve', auth, requireAdmin, adminController.resolveReport);

// Report Generation Routes
router.get('/reports/user-stats', auth, requireAdmin, adminController.reportUserStats);
router.get('/reports/event-stats', auth, requireAdmin, adminController.reportEventStats);
router.get('/reports/group-stats', auth, requireAdmin, adminController.reportGroupStats);
router.get('/reports/activity', auth, requireAdmin, adminController.reportActivity);
router.get('/reports/moderation', auth, requireAdmin, adminController.reportModeration);
router.get('/reports/engagement', auth, requireAdmin, adminController.reportEngagement);
router.get('/reports/all', auth, requireAdmin, adminController.generateAllReports);

router.get('/contact-messages', auth, requireAdmin, adminController.listContactMessages);
router.patch('/contact-messages/:id/resolve', auth, requireAdmin, adminController.resolveContactMessage);

module.exports = router;
