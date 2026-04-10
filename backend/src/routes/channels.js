const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getServerChannels, createChannel, deleteChannel } = require('../controllers/channelController');

router.use(authenticateToken);
router.get('/server/:serverId', getServerChannels);
router.post('/', createChannel);
router.delete('/:channelId', deleteChannel);

module.exports = router;
