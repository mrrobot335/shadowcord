const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getUserServers = async (req, res) => {
  try {
    const serverMembers = await prisma.serverMember.findMany({
      where: { userId: req.user.userId },
      include: {
        server: {
          include: {
            channels: true,
            _count: { select: { members: true } }
          }
        }
      }
    });
    const servers = serverMembers.map(sm => sm.server);
    res.json({ servers });
  } catch (error) {
    console.error('Get servers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createServer = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Server name is required' });
    }

    const result = await prisma.$transaction(async (tx) => {
      const server = await tx.server.create({
        data: {
          name: name.trim(),
          ownerId: req.user.userId,
          iconUrl: req.file ? await (async () => {
            const { uploadToCloudinary } = require('../cloudinary');
            return await uploadToCloudinary(req.file.buffer, 'servers');
          })() : null
        }
      });
      await tx.serverMember.create({
        data: { userId: req.user.userId, serverId: server.id, role: 'owner' }
      });
      await tx.channel.createMany({
        data: [
          { name: 'general', type: 'text', serverId: server.id },
          { name: 'General Voice', type: 'voice', serverId: server.id }
        ]
      });
      return server;
    });

    const serverWithChannels = await prisma.server.findUnique({
      where: { id: result.id },
      include: { channels: true, _count: { select: { members: true } } }
    });

    res.status(201).json({ server: serverWithChannels });
  } catch (error) {
    console.error('Create server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const joinServer = async (req, res) => {
  try {
    const { serverId } = req.body;
    const server = await prisma.server.findUnique({ where: { id: serverId }, include: { channels: true } });

    if (!server) return res.status(404).json({ error: 'Server not found' });

    const existingMember = await prisma.serverMember.findUnique({
      where: { userId_serverId: { userId: req.user.userId, serverId } }
    });

    if (existingMember) return res.status(400).json({ error: 'Already a member of this server' });

    await prisma.serverMember.create({ data: { userId: req.user.userId, serverId, role: 'member' } });

    res.json({ server });
  } catch (error) {
    console.error('Join server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getServerMembers = async (req, res) => {
  try {
    const { serverId } = req.params;
    const members = await prisma.serverMember.findMany({
      where: { serverId },
      include: {
        user: { select: { id: true, username: true, avatarUrl: true, status: true } }
      }
    });
    res.json({ members });
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteServer = async (req, res) => {
  try {
    const { serverId } = req.params;
    const server = await prisma.server.findUnique({ where: { id: serverId } });

    if (!server) return res.status(404).json({ error: 'Server not found' });
    if (server.ownerId !== req.user.userId) return res.status(403).json({ error: 'Only the server owner can delete it' });

    await prisma.server.delete({ where: { id: serverId } });
    res.json({ message: 'Server deleted' });
  } catch (error) {
    console.error('Delete server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const leaveServer = async (req, res) => {
  try {
    const { serverId } = req.params;
    await prisma.serverMember.delete({
      where: { userId_serverId: { userId: req.user.userId, serverId } }
    });
    res.json({ message: 'Left server' });
  } catch (error) {
    console.error('Leave server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getUserServers, createServer, joinServer, getServerMembers, deleteServer, leaveServer };
