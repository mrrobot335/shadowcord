const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Generate a random 4-digit discriminator tag (0001-9999)
const generateDiscriminator = () => {
  return String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0');
};

// Generate a recovery key — 24 random words from a number+letter combo
// Format: XXXX-XXXX-XXXX-XXXX-XXXX-XXXX (groups of 4 chars, 6 groups)
const generateRecoveryKey = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No confusing 0/O/1/I
  let key = '';
  for (let i = 0; i < 24; i++) {
    if (i > 0 && i % 4 === 0) key += '-';
    key += chars[Math.floor(Math.random() * chars.length)];
  }
  return key; // e.g. XKQP-3NMV-7RBT-YWZE-4HSJ-9PKF
};

const generateToken = (userId, username) => {
  return jwt.sign(
    { userId, username },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// POST /api/auth/register
const register = async (req, res) => {
  try {
    let { username, password } = req.body;
    username = username?.trim();

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Username validation: 2-32 chars, letters/numbers/underscores
    if (!/^[a-zA-Z0-9_]{2,32}$/.test(username)) {
      return res.status(400).json({ error: 'Username must be 2-32 characters, letters/numbers/underscores only' });
    }

    if (password.length < 6 || password.length > 128) {
      return res.status(400).json({ error: 'Password must be 6-128 characters' });
    }

    // Find a unique discriminator for this username
    // Same username can exist with different discriminators (like Discord)
    let discriminator;
    let displayId;
    let attempts = 0;

    while (attempts < 50) {
      discriminator = generateDiscriminator();
      displayId = `${username}#${discriminator}`;

      const existing = await prisma.user.findUnique({ where: { displayId } });
      if (!existing) break; // Found a free one
      attempts++;
    }

    if (attempts >= 50) {
      return res.status(400).json({ error: 'Username is full, please choose a different one' });
    }

    // Generate recovery key — shown to user ONCE, never stored plain text
    const recoveryKey = generateRecoveryKey();
    const recoveryHash = await bcrypt.hash(recoveryKey, 12);
    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        username,
        discriminator,
        displayId,
        passwordHash,
        recoveryHash,
        status: 'online'
      }
    });

    const token = generateToken(user.id, user.username);

    // Return the recovery key in plain text THIS ONE TIME ONLY
    // After this response, it is gone — only the hash is stored
    res.status(201).json({
      token,
      recoveryKey, // Show this to user to write down
      user: {
        id: user.id,
        username: user.username,
        discriminator: user.discriminator,
        displayId: user.displayId,
        avatarUrl: user.avatarUrl,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    let { username, password } = req.body;
    username = username?.trim();

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Username might be entered as "username" or "username#1234"
    // Support both formats
    let user;
    if (username.includes('#')) {
      // They typed their full displayId
      user = await prisma.user.findUnique({ where: { displayId: username } });
    } else {
      // Just username — if multiple exist with same name, can't log in without discriminator
      const users = await prisma.user.findMany({ where: { username } });
      if (users.length === 1) {
        user = users[0];
      } else if (users.length > 1) {
        return res.status(400).json({ 
          error: 'Multiple accounts with this username. Please login with your full tag e.g. username#1234' 
        });
      }
    }

    // Timing-safe: always run bcrypt even if user not found
    const dummyHash = '$2a$12$dummyhashfortimingattackprevention000000000000000000000';
    const isValidPassword = user
      ? await bcrypt.compare(password, user.passwordHash)
      : await bcrypt.compare(password, dummyHash);

    if (!user || !isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    await prisma.user.update({ where: { id: user.id }, data: { status: 'online' } });

    const token = generateToken(user.id, user.username);

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        discriminator: user.discriminator,
        displayId: user.displayId,
        avatarUrl: user.avatarUrl,
        status: 'online'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/auth/recover — Recover account using recovery key
const recoverAccount = async (req, res) => {
  try {
    const { displayId, recoveryKey, newPassword } = req.body;

    if (!displayId || !recoveryKey || !newPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const user = await prisma.user.findUnique({ where: { displayId } });

    const dummyHash = '$2a$12$dummyhashfortimingattackprevention000000000000000000000';
    const isValidKey = user
      ? await bcrypt.compare(recoveryKey.toUpperCase().replace(/\s/g, ''), user.recoveryHash)
      : await bcrypt.compare(recoveryKey, dummyHash);

    if (!user || !isValidKey) {
      return res.status(401).json({ error: 'Invalid recovery key or account ID' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash }
    });

    res.json({ message: 'Password reset successfully. You can now log in.' });
  } catch (error) {
    console.error('Recovery error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/auth/logout
const logout = async (req, res) => {
  try {
    await prisma.user.update({ where: { id: req.user.userId }, data: { status: 'offline' } });
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        username: true,
        discriminator: true,
        displayId: true,
        avatarUrl: true,
        status: true,
        createdAt: true
      }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { register, login, logout, getMe, recoverAccount };