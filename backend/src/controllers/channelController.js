const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getServerChannels = async (req, res) => {
  try {
    const { serverId } = req.params;
    const member = await prisma.serverMember.findUnique({
      where: { userId_serverId: { userId: req.user.userId, serverId } }
    });

    if (!member) return res.status(403).json({ error: 'Not a member of this server' });

    const channels = await prisma.channel.findMany({
      where: { serverId },
      include: {
        voiceChannelUsers: {
          include: { user: { select: { id: true, username: true, avatarUrl: true } } }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json({ channels });
  } catch (error) {
    console.error('Get channels error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createChannel = async (req, res) => {
  try {
    const { name, type, serverId } = req.body;

    if (!name || !serverId) return res.status(400).json({ error: 'Name and server ID are required' });

    const member = await prisma.serverMember.findUnique({
      where: { userId_serverId: { userId: req.user.userId, serverId } }
    });

    if (!member || !['owner', 'admin'].includes(member.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const channel = await prisma.channel.create({
      data: { name: name.trim().toLowerCase().replace(/\s+/g, '-'), type: type || 'text', serverId }
    });

    res.status(201).json({ channel });
  } catch (error) {
    console.error('Create channel error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteChannel = async (req, res) => {
  try {
    const { channelId } = req.params;
    const channel = await prisma.channel.findUnique({ where: { id: channelId }, include: { server: true } });

    if (!channel) return res.status(404).json({ error: 'Channel not found' });

    const member = await prisma.serverMember.findUnique({
      where: { userId_serverId: { userId: req.user.userId, serverId: channel.serverId } }
    });

    if (!member || !['owner', 'admin'].includes(member.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    await prisma.channel.delete({ where: { id: channelId } });
    res.json({ message: 'Channel deleted' });
  } catch (error) {
    console.error('Delete channel error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getServerChannels, createChannel, deleteChannel };
