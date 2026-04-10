const express = require('express');
const router = express.Router();
const { register, login, logout, getMe, recoverAccount } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/recover', recoverAccount);
router.post('/logout', authenticateToken, logout);
router.get('/me', authenticateToken, getMe);

module.exports = router;