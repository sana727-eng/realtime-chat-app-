const Room = require('../models/Room');

exports.getRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ members: req.userId })
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });
    res.json({ rooms });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching rooms' });
  }
};

exports.createRoom = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Room name is required' });

    const room = await Room.create({
      name,
      createdBy: req.userId,
      members: [req.userId],
    });

    res.status(201).json({ room });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating room' });
  }
};