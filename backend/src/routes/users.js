const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { authenticateToken } = require('../middleware/auth');
const { updateProfile, searchUsers, kickMember } = require('../controllers/userController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => { cb(null, path.join(__dirname, '../../uploads')); },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-avatar${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 } });

router.use(authenticateToken);
router.put('/profile', upload.single('avatar'), updateProfile);
router.get('/search', searchUsers);
router.delete('/servers/:serverId/members/:memberId', kickMember);

module.exports = router;
