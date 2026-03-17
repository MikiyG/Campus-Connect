const multer = require('multer');
const path = require('path');
const fs = require('fs');

// store under backend/public/uploads/profiles so it matches app.js static config
const uploadDir = path.join(__dirname, '..', '..', 'public', 'uploads', 'profiles');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const name = `${base}_${Date.now()}${ext}`;
    cb(null, name);
  }
});

function fileFilter(req, file, cb) {
  if (!file.mimetype.startsWith('image/')) return cb(new Error('Only image uploads are allowed'), false);
  cb(null, true);
}

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

module.exports = upload;
