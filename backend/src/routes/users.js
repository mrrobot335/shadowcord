const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { updateProfile, searchUsers, kickMember } = require('../controllers/userController');
const { uploadAvatar } = require('../cloudinary');

router.use(authenticateToken);
router.put('/profile', uploadAvatar.single('avatar'), updateProfile);
router.get('/search', searchUsers);
router.delete('/servers/:serverId/members/:memberId', kickMember);

module.exports = router;