const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getFriends, sendFriendRequest, acceptFriendRequest, removeFriend } = require('../controllers/friendController');

router.use(authenticateToken);
router.get('/', getFriends);
router.post('/request', sendFriendRequest);
router.post('/accept/:friendshipId', acceptFriendRequest);
router.delete('/:friendId', removeFriend);

module.exports = router;
