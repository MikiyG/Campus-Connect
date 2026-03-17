// src/app.js
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();

// Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({ origin: 'http://localhost:5173' })); 
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads')));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use(limiter);

// Routes
app.use('/api/auth',   require('./routes/auth.routes'));
app.use('/api/users',  require('./routes/user.routes'));
app.use('/api/groups', require('./routes/group.routes'));
app.use('/api/events', require('./routes/event.routes'));
app.use('/api/messages', require('./routes/message.routes'));
app.use('/api/admin',  require('./routes/admin.routes'));
app.use('/api/report', require('./routes/report.routes'));  // if exists

// Error handler (last)
app.use(require('./middlewares/error.middleware'));

module.exports = app;