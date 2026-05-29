/**
 * Friend.js — friend request and relationship record.
 *
 * Represents a directional connection request between two users. The pairKey
 * field (sorted concatenation of both user IDs) enforces uniqueness so a pair
 * can only have one relationship record regardless of who initiated it.
 * Pending requests expire after 30 days unless noExpiry is set.
 *
 * Statuses: pending → accepted | rejected
 *
 * Collection: friends
 */

const mongoose = require('mongoose');

const { ObjectId } = mongoose.Schema.Types;

const friendSchema = new mongoose.Schema({
  requesterId: {
    type: ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },

  recipientId: {
    type: ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },

  // Stable sorted key for the two user IDs. Prevents duplicate relationships
  // regardless of who initiated the request.
  pairKey: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },

  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
    index: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },

  // Exempt from the 30-day pending-expiry rule (used for seeded demo requests).
  noExpiry: {
    type: Boolean,
    default: false,
  },
});

friendSchema.pre('save', function (next) {
  if (!this.isNew) this.updatedAt = new Date();
  next();
});

friendSchema.index({ requesterId: 1, recipientId: 1 });

module.exports = mongoose.models.Friend || mongoose.model('Friend', friendSchema);
