require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const serverRoutes = require('./routes/servers');
const channelRoutes = require('./routes/channels');
const messageRoutes = require('./routes/messages');
const friendRoutes = require('./routes/friends');
const userRoutes = require('./routes/users');

const { initializeSocket } = require('./socket/socketHandler');

const app = express();
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  }
});

app.set('io', io);

app.use(cors({
  origin: '*',
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/servers', serverRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/users', userRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

initializeSocket(io);

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Client URL: ${process.env.CLIENT_URL}`);
});
