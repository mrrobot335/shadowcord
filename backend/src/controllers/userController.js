const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const updateProfile = async (req, res) => {
  try {
    const { username } = req.body;
    const updateData = {};

    if (username) {
      const existing = await prisma.user.findUnique({ where: { username } });
      if (existing && existing.id !== req.user.userId) {
        return res.status(400).json({ error: 'Username already taken' });
      }
      updateData.username = username;
    }

    if (req.file) {
      const { uploadToCloudinary } = require('../cloudinary');
      const url = await uploadToCloudinary(req.file.buffer, 'avatars');
      updateData.avatarUrl = url;
    }

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: updateData,
      select: { id: true, username: true, email: true, avatarUrl: true, status: true }
    });

    res.json({ user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.status(400).json({ error: 'Search query too short' });

    const users = await prisma.user.findMany({
      where: { username: { contains: q, mode: 'insensitive' }, NOT: { id: req.user.userId } },
      select: { id: true, username: true, avatarUrl: true, status: true },
      take: 10
    });

    res.json({ users });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const kickMember = async (req, res) => {
  try {
    const { serverId, memberId } = req.params;
    const requester = await prisma.serverMember.findUnique({
      where: { userId_serverId: { userId: req.user.userId, serverId } }
    });

    if (!requester || !['owner', 'admin'].includes(requester.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    await prisma.serverMember.delete({ where: { userId_serverId: { userId: memberId, serverId } } });
    res.json({ message: 'Member kicked' });
  } catch (error) {
    console.error('Kick member error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { updateProfile, searchUsers, kickMember };
