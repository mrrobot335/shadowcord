const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getChannelMessages = async (req, res) => {
  try {
    const { channelId } = req.params;
    const limit = parseInt(req.query.limit) || 50;

    const messages = await prisma.message.findMany({
      where: { channelId },
      include: { user: { select: { id: true, username: true, avatarUrl: true } } },
      orderBy: { createdAt: 'asc' },
      take: limit
    });

    res.json({ messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getDMMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.userId;

    const messages = await prisma.directMessage.findMany({
      where: {
        OR: [
          { senderId: currentUserId, receiverId: userId },
          { senderId: userId, receiverId: currentUserId }
        ]
      },
      include: {
        sender: { select: { id: true, username: true, avatarUrl: true } },
        receiver: { select: { id: true, username: true, avatarUrl: true } }
      },
      orderBy: { createdAt: 'asc' },
      take: 50
    });

    res.json({ messages });
  } catch (error) {
    console.error('Get DM messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getChannelMessages, getDMMessages };
