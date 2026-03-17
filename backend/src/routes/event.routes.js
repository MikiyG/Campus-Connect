// src/routes/event.routes.js
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const eventController = require('../controllers/event.controller');

// basic health check
router.get('/test', (req, res) => {
  res.json({ message: 'Event routes OK' });
});

// public list of approved events
router.get('/', auth, eventController.listEvents);

// events created by current user
router.get('/mine', auth, eventController.listMyEvents);

// create / delete events
router.post('/', auth, eventController.createEvent);
router.delete('/:id', auth, eventController.deleteEvent);

// join / leave events
router.post('/:id/join', auth, eventController.joinEvent);
router.post('/:id/leave', auth, eventController.leaveEvent);

module.exports = router;
