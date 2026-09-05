const express = require('express');
const router = express.Router();
const { getRooms, createRoom , getOrCreateDM , getAllUsers} = require('../controllers/roomController');
const requireAuth = require('../middleware/auth');

router.get('/', requireAuth, getRooms);
router.post('/', requireAuth, createRoom);
router.post('/dm', requireAuth, getOrCreateDM);
router.get('/users/all', requireAuth, getAllUsers);


module.exports = router;