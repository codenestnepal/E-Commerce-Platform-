const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../frontend/Images/uploads');
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (e) {
  // Graceful fallback
}

let multer;
let upload;
try {
  multer = require('multer');
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname) || '.jpg';
      const cleanName = path.basename(file.originalname, ext).replace(/[^a-z0-9]/gi, '_').toLowerCase();
      cb(null, `${Date.now()}_${cleanName}${ext}`);
    }
  });

  upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
  });
} catch (e) {
  upload = null;
}

// Single image upload endpoint
router.post('/', (req, res, next) => {
  if (upload && upload.single) {
    return upload.single('image')(req, res, (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }
      if (!req.file) {
        // Check for base64 fallback in json body
        if (req.body && req.body.imageBase64) {
          return handleBase64(req, res);
        }
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }
      const publicUrl = `/Images/uploads/${req.file.filename}`;
      return res.status(200).json({
        success: true,
        message: 'Image uploaded successfully',
        url: publicUrl,
        filename: req.file.filename
      });
    });
  }

  // Fallback for body base64 or URL
  handleBase64(req, res);
});

function handleBase64(req, res) {
  const { imageBase64, filename } = req.body || {};
  if (!imageBase64) {
    // If client supplied direct URL, return it
    if (req.body && req.body.url) {
      return res.status(200).json({ success: true, url: req.body.url });
    }
    return res.status(400).json({ success: false, message: 'No image data provided' });
  }

  try {
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const fname = `${Date.now()}_${(filename || 'upload').replace(/[^a-z0-9]/gi, '_')}.jpg`;
    const targetFile = path.join(uploadDir, fname);
    fs.writeFileSync(targetFile, buffer);
    return res.status(200).json({
      success: true,
      message: 'Base64 image saved successfully',
      url: `/Images/uploads/${fname}`,
      filename: fname
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to save image: ' + err.message });
  }
}

module.exports = router;
