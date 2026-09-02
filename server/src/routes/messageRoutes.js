const express = require('express');
const router = express.Router();
const { getRoomMessages } = require('../controllers/messageController');
const requireAuth = require('../middleware/auth');

router.get('/:roomId', requireAuth, getRoomMessages);

module.exports = router;