/**
 * ChatMessage.js — a single message in a friend-to-friend chat room.
 *
 * Messages are scoped to an accepted Friend relationship (friendId).
 * The compound index on { friendId, createdAt } supports efficient
 * pagination of chat history in chronological order.
 * Real usernames are never stored — senderId populates anonymousDisplayName only.
 *
 * Collection: chatmessages
 */

const mongoose = require('mongoose');

const { ObjectId } = mongoose.Schema.Types;

const chatMessageSchema = new mongoose.Schema({
  friendId: {
    type: ObjectId,
    ref: 'Friend',
    required: true,
    index: true,
  },

  senderId: {
    type: ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },

  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000,
  },

  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
});

chatMessageSchema.index({ friendId: 1, createdAt: 1 });

module.exports =
  mongoose.models.ChatMessage ||
  mongoose.model('ChatMessage', chatMessageSchema);
