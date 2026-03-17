// src/routes/report.routes.js
const express = require('express');
const router = express.Router();

router.get('/test', (req, res) => {
	res.json({ message: 'Report routes placeholder' });
});

module.exports = router;
