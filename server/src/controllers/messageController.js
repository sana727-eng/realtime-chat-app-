const Message = require('../models/Message');

exports.getRoomMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const before = req.query.before;

    const query = { roomId };
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('senderId', 'username');

    // mark all fetched messages as read by this user (only matters for messages not sent by them)
    const messageIds = messages
      .filter((m) => m.senderId._id.toString() !== req.userId)
      .map((m) => m._id);

    if (messageIds.length > 0) {
      await Message.updateMany(
        { _id: { $in: messageIds } },
        { $addToSet: { readBy: req.userId } }
      );
    }

    const ordered = messages.reverse().map((msg) => ({
      _id: msg._id,
      roomId: msg.roomId,
      senderId: msg.senderId._id,
      senderUsername: msg.senderId.username,
      content: msg.content,
      createdAt: msg.createdAt,
      readBy: msg.readBy,
    }));

    res.json({ messages: ordered });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching messages' });
  }
};