const jwt = require('jsonwebtoken');
const cookie = require('cookie');

const socketAuthMiddleware = (socket, next) => {
  try {
    const rawCookies = socket.handshake.headers.cookie;

    if (!rawCookies) {
      return next(new Error('Authentication error: no cookie'));
    }

    const parsedCookies = cookie.parse(rawCookies);
    const token = parsedCookies.token;

    if (!token) {
      return next(new Error('Authentication error: no token'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    next();
  } catch (err) {
    next(new Error('Authentication error: invalid token'));
  }
};

module.exports = socketAuthMiddleware;