const Message = require('../models/Message');
const User = require('../models/User');

const registerMessageHandlers = (io, socket) => {
  socket.on('message:send', async ({ roomId, content }) => {
    if (!roomId || !content?.trim()) return;

    try {
      const message = await Message.create({
        roomId,
        senderId: socket.userId,
        content: content.trim(),
      });

      // pull the username so the client doesn't show raw ObjectIds
      const sender = await User.findById(socket.userId).select('username');

      const payload = {
        _id: message._id,
        roomId: message.roomId,
        senderId: message.senderId,
        senderUsername: sender?.username || 'Unknown',
        content: message.content,
        createdAt: message.createdAt,
      };

      console.log(`Message saved + broadcast in room ${roomId} from ${sender?.username}`);

      io.to(roomId).emit('message:receive', payload);
    } catch (err) {
      console.error('Failed to save message:', err.message);
      socket.emit('message:error', 'Failed to send message');
    }
  });
};

module.exports = registerMessageHandlers;