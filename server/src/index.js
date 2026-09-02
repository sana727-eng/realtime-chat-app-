require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const socketAuthMiddleware = require('./sockets/authSocket');
const User = require('./models/User');
const roomRoutes = require('./routes/roomRoutes');
const registerRoomHandlers = require('./sockets/roomSocket');
const registerMessageHandlers = require('./sockets/messageSocket');
const messageRoutes = require('./routes/messageRoutes');


const app = express();
app.use(cors({ origin: process.env.CLIENT_URL,credentials: true, }));
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/messages', messageRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL, credentials: true },
});
io.use(socketAuthMiddleware);

io.on('connection', async (socket) => {
  const user = await User.findById(socket.userId).select('username email');
  console.log(`Socket connected: ${socket.id} — user: ${user?.username} (${socket.userId})`);

  registerRoomHandlers(io, socket);
  registerMessageHandlers(io, socket);

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id} — user: ${user?.username}`);
  });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

