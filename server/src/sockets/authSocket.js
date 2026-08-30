const jwt = require('jsonwebtoken');

const parseCookies = (cookieHeader) => {
  const result = {};
  if (!cookieHeader) return result;
  cookieHeader.split(';').forEach((pair) => {
    const [key, ...rest] = pair.trim().split('=');
    result[key] = decodeURIComponent(rest.join('='));
  });
  return result;
};

const socketAuthMiddleware = (socket, next) => {
  try {
    const rawCookies = socket.handshake.headers.cookie;
    

    if (!rawCookies) {
      return next(new Error('Authentication error: no cookie'));
    }

    const parsedCookies = parseCookies(rawCookies);
    const token = parsedCookies.token;

    if (!token) {
      return next(new Error('Authentication error: no token'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    next();
  } catch (err) {
    console.log('❌ jwt.verify failed:', err.message);
    next(new Error('Authentication error: invalid token'));
  }
};

module.exports = socketAuthMiddleware;