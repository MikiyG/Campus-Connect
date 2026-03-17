const multer = require('multer');
const path = require('path');
const fs = require('fs');

// store under backend/public/uploads/files so it matches app.js static config
const uploadDir = path.join(__dirname, '..', '..', 'public', 'uploads', 'files');
// ensure directory exists
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log('DEBUG: multer destination called, file:', file);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    console.log('DEBUG: multer filename called, file:', file);
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const name = `${base}_${Date.now()}${ext}`;
    cb(null, name);
  }
});

function fileFilter(req, file, cb) {
  // allow all file types for messaging
  console.log('DEBUG: fileFilter called, file:', file);
  cb(null, true);
}

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

module.exports = upload;
