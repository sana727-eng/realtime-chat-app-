const Message = require('../models/Message');

exports.getRoomMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const before = req.query.before; // ISO date string, for pagination (optional today)

    const query = { roomId };
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 }) // newest first for the query...
      .limit(limit)
      .populate('senderId', 'username');

    // ...then reverse so the client renders oldest-to-newest, like a real chat
    const ordered = messages.reverse().map((msg) => ({
      _id: msg._id,
      roomId: msg.roomId,
      senderId: msg.senderId._id,
      senderUsername: msg.senderId.username,
      content: msg.content,
      createdAt: msg.createdAt,
    }));

    res.json({ messages: ordered });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching messages' });
  }
};