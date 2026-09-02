// userId -> Set of socket IDs currently connected for that user
const onlineUsers = new Map();

const addUserSocket = (userId, socketId) => {
  if (!onlineUsers.has(userId)) {
    onlineUsers.set(userId, new Set());
  }
  onlineUsers.get(userId).add(socketId);

  // returns true if this is the user's FIRST connection (i.e. they just came online)
  return onlineUsers.get(userId).size === 1;
};

const removeUserSocket = (userId, socketId) => {
  if (!onlineUsers.has(userId)) return false;

  onlineUsers.get(userId).delete(socketId);

  if (onlineUsers.get(userId).size === 0) {
    onlineUsers.delete(userId);
    return true; // user's LAST connection just closed — they're now offline
  }

  return false;
};

const isUserOnline = (userId) => onlineUsers.has(userId);

const getOnlineUserIds = () => Array.from(onlineUsers.keys());

module.exports = { addUserSocket, removeUserSocket, isUserOnline, getOnlineUserIds };