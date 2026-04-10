const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const voiceRooms = new Map();
const socketToUser = new Map();

const initializeSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication required'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      socket.username = decoded.username;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.username} (${socket.id})`);
    socketToUser.set(socket.id, socket.userId);
    io.emit('user:online', { userId: socket.userId });

    socket.on('channel:join', (channelId) => { socket.join(`channel:${channelId}`); });
    socket.on('channel:leave', (channelId) => { socket.leave(`channel:${channelId}`); });

    socket.on('message:send', async (data) => {
      try {
        const { channelId, content } = data;
        if (!content || !content.trim()) return;

        const message = await prisma.message.create({
          data: { content: content.trim(), userId: socket.userId, channelId },
          include: { user: { select: { id: true, username: true, avatarUrl: true } } }
        });

        io.to(`channel:${channelId}`).emit('message:new', { message });
      } catch (error) {
        console.error('Message send error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('typing:start', ({ channelId }) => {
      socket.to(`channel:${channelId}`).emit('typing:start', { userId: socket.userId, username: socket.username, channelId });
    });

    socket.on('typing:stop', ({ channelId }) => {
      socket.to(`channel:${channelId}`).emit('typing:stop', { userId: socket.userId, channelId });
    });

    socket.on('dm:send', async (data) => {
      try {
        const { receiverId, content } = data;
        if (!content || !content.trim()) return;

        const dm = await prisma.directMessage.create({
          data: { content: content.trim(), senderId: socket.userId, receiverId },
          include: {
            sender: { select: { id: true, username: true, avatarUrl: true } },
            receiver: { select: { id: true, username: true, avatarUrl: true } }
          }
        });

        const receiverSockets = [...socketToUser.entries()]
          .filter(([_, userId]) => userId === receiverId)
          .map(([socketId]) => socketId);

        receiverSockets.forEach(socketId => { io.to(socketId).emit('dm:new', { message: dm }); });
        socket.emit('dm:new', { message: dm });
      } catch (error) {
        console.error('DM send error:', error);
      }
    });

    socket.on('voice:join', async ({ channelId }) => {
      try {
        if (!voiceRooms.has(channelId)) voiceRooms.set(channelId, new Set());
        const room = voiceRooms.get(channelId);
        const existingPeers = [...room];
        room.add(socket.id);
        socket.join(`voice:${channelId}`);

        await prisma.voiceChannelUser.upsert({
          where: { userId_channelId: { userId: socket.userId, channelId } },
          update: {},
          create: { userId: socket.userId, channelId }
        });

        socket.emit('voice:existing-peers', {
          peers: existingPeers.map(peerId => ({ socketId: peerId, userId: socketToUser.get(peerId) }))
        });

        socket.to(`voice:${channelId}`).emit('voice:user-joined', {
          socketId: socket.id, userId: socket.userId, username: socket.username
        });

        io.to(`channel:${channelId}`).emit('voice:users-update', {
          channelId, users: await getVoiceChannelUsers(channelId)
        });
      } catch (error) {
        console.error('Voice join error:', error);
      }
    });

    socket.on('voice:leave', async ({ channelId }) => {
      try {
        const room = voiceRooms.get(channelId);
        if (room) { room.delete(socket.id); if (room.size === 0) voiceRooms.delete(channelId); }
        socket.leave(`voice:${channelId}`);

        await prisma.voiceChannelUser.deleteMany({ where: { userId: socket.userId, channelId } });

        io.to(`voice:${channelId}`).emit('voice:user-left', { socketId: socket.id, userId: socket.userId });
        io.to(`channel:${channelId}`).emit('voice:users-update', { channelId, users: await getVoiceChannelUsers(channelId) });
      } catch (error) {
        console.error('Voice leave error:', error);
      }
    });

    socket.on('voice:offer', ({ targetSocketId, offer }) => {
      io.to(targetSocketId).emit('voice:offer', { offer, fromSocketId: socket.id, fromUserId: socket.userId });
    });

    socket.on('voice:answer', ({ targetSocketId, answer }) => {
      io.to(targetSocketId).emit('voice:answer', { answer, fromSocketId: socket.id });
    });

    socket.on('voice:ice-candidate', ({ targetSocketId, candidate }) => {
      io.to(targetSocketId).emit('voice:ice-candidate', { candidate, fromSocketId: socket.id });
    });

    socket.on('call:initiate', ({ targetUserId }) => {
      const targetSockets = [...socketToUser.entries()]
        .filter(([_, userId]) => userId === targetUserId)
        .map(([socketId]) => socketId);
      targetSockets.forEach(socketId => {
        io.to(socketId).emit('call:incoming', { fromSocketId: socket.id, fromUserId: socket.userId, fromUsername: socket.username });
      });
    });

    socket.on('call:accept', ({ targetSocketId }) => { io.to(targetSocketId).emit('call:accepted', { fromSocketId: socket.id }); });
    socket.on('call:reject', ({ targetSocketId }) => { io.to(targetSocketId).emit('call:rejected', { fromSocketId: socket.id }); });
    socket.on('call:end', ({ targetSocketId }) => { io.to(targetSocketId).emit('call:ended', { fromSocketId: socket.id }); });
    socket.on('call:offer', ({ targetSocketId, offer }) => { io.to(targetSocketId).emit('call:offer', { offer, fromSocketId: socket.id }); });
    socket.on('call:answer', ({ targetSocketId, answer }) => { io.to(targetSocketId).emit('call:answer', { answer, fromSocketId: socket.id }); });
    socket.on('call:ice-candidate', ({ targetSocketId, candidate }) => { io.to(targetSocketId).emit('call:ice-candidate', { candidate, fromSocketId: socket.id }); });

    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.username}`);
      for (const [channelId, room] of voiceRooms.entries()) {
        if (room.has(socket.id)) {
          room.delete(socket.id);
          io.to(`voice:${channelId}`).emit('voice:user-left', { socketId: socket.id, userId: socket.userId });
          await prisma.voiceChannelUser.deleteMany({ where: { userId: socket.userId } }).catch(() => {});
        }
      }
      socketToUser.delete(socket.id);
      await prisma.user.update({ where: { id: socket.userId }, data: { status: 'offline' } }).catch(() => {});
      io.emit('user:offline', { userId: socket.userId });
    });
  });
};

async function getVoiceChannelUsers(channelId) {
  const users = await prisma.voiceChannelUser.findMany({
    where: { channelId },
    include: { user: { select: { id: true, username: true, avatarUrl: true } } }
  });
  return users.map(u => u.user);
}

module.exports = { initializeSocket };
