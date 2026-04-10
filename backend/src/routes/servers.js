const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { authenticateToken } = require('../middleware/auth');
const { getUserServers, createServer, joinServer, getServerMembers, deleteServer, leaveServer } = require('../controllers/serverController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => { cb(null, path.join(__dirname, '../../uploads')); },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only images allowed'));
  }
});

router.use(authenticateToken);
router.get('/', getUserServers);
router.post('/', upload.single('icon'), createServer);
router.post('/join', joinServer);
router.get('/:serverId/members', getServerMembers);
router.delete('/:serverId', deleteServer);
router.delete('/:serverId/leave', leaveServer);

module.exports = router;
