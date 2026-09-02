const registerTypingHandlers = (io, socket) => {
  socket.on('typing:start', ({ roomId }) => {
    if (!roomId) return;
    // broadcast to everyone else in the room (not back to the sender)
    socket.to(roomId).emit('typing:userStarted', {
      userId: socket.userId,
      roomId,
    });
  });

  socket.on('typing:stop', ({ roomId }) => {
    if (!roomId) return;
    socket.to(roomId).emit('typing:userStopped', {
      userId: socket.userId,
      roomId,
    });
  });

  // safety net: if a user disconnects mid-typing, make sure their indicator clears
  socket.on('disconnect', () => {
    // we don't know which room(s) they were typing in without extra tracking,
    // so for now this relies on the client-side timeout (step 3) as the real safety net.
    // A future improvement: track "currently typing in room X" server-side per socket.
  });
};

module.exports = registerTypingHandlers;