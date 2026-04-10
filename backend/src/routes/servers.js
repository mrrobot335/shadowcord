const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  getUserServers, createServer, joinServer,
  getServerMembers, deleteServer, leaveServer
} = require('../controllers/serverController');
const { uploadServerIcon } = require('../cloudinary');

router.use(authenticateToken);
router.get('/', getUserServers);
router.post('/', uploadServerIcon.single('icon'), createServer);
router.post('/join', joinServer);
router.get('/:serverId/members', getServerMembers);
router.delete('/:serverId', deleteServer);
router.delete('/:serverId/leave', leaveServer);

module.exports = router;
