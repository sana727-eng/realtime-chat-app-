const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  isDM: {
    type: Boolean,
    default: false,
  },
  dmKey: {
    type: String,
    unique: true,
    sparse: true, // allows multiple docs with dmKey: null (non-DM rooms)
  },
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);