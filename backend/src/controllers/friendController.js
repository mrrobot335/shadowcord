const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getFriends = async (req, res) => {
  try {
    const userId = req.user.userId;
    const friendships = await prisma.friendship.findMany({
      where: { status: 'accepted', OR: [{ initiatorId: userId }, { receiverId: userId }] },
      include: {
        initiator: { select: { id: true, username: true, discriminator: true, displayId: true, avatarUrl: true, status: true } },
        receiver: { select: { id: true, username: true, discriminator: true, displayId: true, avatarUrl: true, status: true } }
      }
    });

    const friends = friendships.map(f => f.initiatorId === userId ? f.receiver : f.initiator);

    const pendingRequests = await prisma.friendship.findMany({
      where: { receiverId: userId, status: 'pending' },
      include: {
        initiator: { select: { id: true, username: true, discriminator: true, displayId: true, avatarUrl: true } }
      }
    });

    res.json({ friends, pendingRequests });
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Send friend request by displayId e.g. "shadow#4821"
const sendFriendRequest = async (req, res) => {
  try {
    const { displayId } = req.body;
    const currentUserId = req.user.userId;

    if (!displayId || !displayId.includes('#')) {
      return res.status(400).json({ error: 'Please enter a valid tag e.g. username#1234' });
    }

    const targetUser = await prisma.user.findUnique({
      where: { displayId },
      select: { id: true, username: true, displayId: true }
    });

    if (!targetUser) return res.status(404).json({ error: 'User not found' });
    if (targetUser.id === currentUserId) return res.status(400).json({ error: 'Cannot add yourself' });

    const existing = await prisma.friendship.findFirst({
      where: {
        OR: [
          { initiatorId: currentUserId, receiverId: targetUser.id },
          { initiatorId: targetUser.id, receiverId: currentUserId }
        ]
      }
    });

    if (existing) return res.status(400).json({ error: 'Friend request already exists or already friends' });

    // Get the sender's info to send with the notification
    const sender = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: { id: true, username: true, discriminator: true, displayId: true, avatarUrl: true }
    });

    const friendship = await prisma.friendship.create({
      data: { initiatorId: currentUserId, receiverId: targetUser.id, status: 'pending' }
    });

    // Emit real-time notification to the target user
    const io = req.app.get('io');
    if (io) {
      io.emit('friend:request', {
        targetUserId: targetUser.id,
        friendship: { ...friendship, initiator: sender }
      });
    }

    res.status(201).json({ friendship });
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const acceptFriendRequest = async (req, res) => {
  try {
    const { friendshipId } = req.params;
    const friendship = await prisma.friendship.findUnique({ where: { id: friendshipId } });

    if (!friendship) return res.status(404).json({ error: 'Request not found' });
    if (friendship.receiverId !== req.user.userId) return res.status(403).json({ error: 'Not authorized' });

    const updated = await prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: 'accepted' },
      include: {
        initiator: { select: { id: true, username: true, discriminator: true, displayId: true, avatarUrl: true, status: true } }
      }
    });

    res.json({ friendship: updated });
  } catch (error) {
    console.error('Accept friend request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const removeFriend = async (req, res) => {
  try {
    const { friendId } = req.params;
    const currentUserId = req.user.userId;

    await prisma.friendship.deleteMany({
      where: {
        status: 'accepted',
        OR: [
          { initiatorId: currentUserId, receiverId: friendId },
          { initiatorId: friendId, receiverId: currentUserId }
        ]
      }
    });

    res.json({ message: 'Friend removed' });
  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getFriends, sendFriendRequest, acceptFriendRequest, removeFriend };