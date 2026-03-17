// src/server.js
require('dotenv').config();
const connectDB = require('./config/db');   // your DB connection file
const app = require('./app');               // ← must import the exported app

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Database connection failed:', err);
    process.exit(1);
  });