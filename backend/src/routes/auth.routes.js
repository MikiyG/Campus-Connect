// src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const upload = require('../utils/upload');

router.get('/test', (req, res) => res.json({ message: 'Auth routes OK' }));

router.post('/login', authController.login);

// simple register placeholder if needed later
// accept optional id image under field name `id_image`
router.post('/register', upload.single('id_image'), authController.register || ((req, res) => res.status(501).json({ message: 'Register not implemented' })));

module.exports = router;