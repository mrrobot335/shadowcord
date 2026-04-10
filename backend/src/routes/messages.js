const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getChannelMessages, getDMMessages } = require('../controllers/messageController');

router.use(authenticateToken);
router.get('/channel/:channelId', getChannelMessages);
router.get('/dm/:userId', getDMMessages);

module.exports = router;
