const Room = require('../models/Room');
const User = require('../models/User');

exports.getRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ members: req.userId })
      .populate('createdBy', 'username')
      .populate('members', 'username')
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
    if (name.trim().length < 1 || name.trim().length > 50) {
      return res.status(400).json({ message: 'Room name must be 1-50 characters' });
}
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

exports.getOrCreateDM = async (req, res) => {
  try {
    const { userId: otherUserId } = req.body;
    if (!otherUserId) return res.status(400).json({ message: 'otherUserId is required' });
    if (otherUserId === req.userId) {
      return res.status(400).json({ message: "Can't start a DM with yourself" });
    }

    const dmKey = [req.userId, otherUserId].sort().join('_');

    let room = await Room.findOne({ dmKey });

    if (!room) {
      const otherUser = await User.findById(otherUserId).select('username');
      if (!otherUser) return res.status(404).json({ message: 'User not found' });

      room = await Room.create({
        name: otherUser.username, // placeholder; client can override display with the other participant's name
        createdBy: req.userId,
        members: [req.userId, otherUserId],
        isDM: true,
        dmKey,
      });
    }

    res.json({ room });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating/fetching DM' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.userId } }).select('username');
    res.json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching users' });
  }
};