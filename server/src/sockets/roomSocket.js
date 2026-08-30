const Room = require('../models/Room');

const registerRoomHandlers = (io, socket) => {
  socket.on('room:join', async (roomId) => {
    try {
      const room = await Room.findById(roomId);
      if (!room) return socket.emit('room:error', 'Room not found');

      // add user to members if not already
      if (!room.members.includes(socket.userId)) {
        room.members.push(socket.userId);
        await room.save();
      }

      socket.join(roomId);
      console.log(`User ${socket.userId} joined room ${roomId}`);

      // let everyone in the room know (including this user) who's in it now
      io.to(roomId).emit('room:userJoined', { userId: socket.userId, roomId });
    } catch (err) {
      console.error(err);
      socket.emit('room:error', 'Failed to join room');
    }
  });

  socket.on('room:leave', (roomId) => {
    socket.leave(roomId);
    console.log(`User ${socket.userId} left room ${roomId}`);
    io.to(roomId).emit('room:userLeft', { userId: socket.userId, roomId });
  });
};

module.exports = registerRoomHandlers;