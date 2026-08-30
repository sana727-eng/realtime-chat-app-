const express = require('express');
const router = express.Router();
const { getRooms, createRoom } = require('../controllers/roomController');
const requireAuth = require('../middleware/auth');

router.get('/', requireAuth, getRooms);
router.post('/', requireAuth, createRoom);

module.exports = router;