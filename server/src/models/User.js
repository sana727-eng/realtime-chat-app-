const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    default: '',
  },
}, { timestamps: true }); // timestamps: true auto-adds createdAt + updatedAt

module.exports = mongoose.model('User', userSchema);