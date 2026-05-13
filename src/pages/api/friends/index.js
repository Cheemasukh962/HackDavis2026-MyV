const { requireAuth } = require('../../../lib/requireAuth');
const { connectDB } = require('../../../lib/db');
const { applySecurityHeaders } = require('../../../middleware/securityHeaders');
const config = require('../../../config/config');
const Friend = require('../../../models/Friend');
const User = require('../../../models/User');

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

function makePairKey(userIdA, userIdB) {
  return [String(userIdA), String(userIdB)].sort().join(':');
}

function serializeFriend(friend, currentUserId) {
  const requesterId = friend.requesterId._id?.toString() || friend.requesterId.toString();
  const recipientId = friend.recipientId._id?.toString() || friend.recipientId.toString();
  const direction = requesterId === currentUserId ? 'outgoing' : 'incoming';
  const otherUser = requesterId === currentUserId ? friend.recipientId : friend.requesterId;

  // Requester never learns their request was rejected — it appears pending until expiry.
  const status = (friend.status === 'rejected' && direction === 'outgoing') ? 'pending' : friend.status;

  return {
    id: friend._id.toString(),
    status,
    direction,
    friend: {
      id: otherUser._id?.toString() || otherUser.toString(),
      displayName: otherUser.anonymousDisplayName,
    },
    createdAt: friend.createdAt,
    updatedAt: friend.updatedAt,
  };
}

function buildExpiryClause() {
  if (!config.features.enable_friend_request_expiry) return null;
  const cutoff = new Date(Date.now() - THIRTY_DAYS_MS);
  // A pending/rejected record is expired when: older than 30 days AND not exempt.
  // Expired records are excluded entirely — accepted records always pass.
  return {
    $or: [
      { status: 'accepted' },
      { noExpiry: true },
      { createdAt: { $gte: cutoff } },
    ],
  };
}

export default requireAuth(async (req, res) => {
  applySecurityHeaders(res);

  if (!config.features.enable_friending) {
    return res.status(404).json({ error: 'Not found.' });
  }

  await connectDB();
  const userId = req.session.sub;

  // ── GET — list friend relationships ────────────────────────────────────────
  if (req.method === 'GET') {
    const statusFilter = req.query.status;

    const filter = {
      $or: [{ requesterId: userId }, { recipientId: userId }],
      // Recipient never sees their own rejected decisions — those are gone from their view.
      $nor: [{ status: 'rejected', recipientId: userId }],
      ...(statusFilter ? { status: statusFilter } : {}),
    };

    const expiryClause = buildExpiryClause();
    if (expiryClause) {
      filter.$and = [expiryClause];
    }

    const friends = await Friend
      .find(filter)
      .sort({ updatedAt: -1 })
      .populate('requesterId', 'anonymousDisplayName')
      .populate('recipientId', 'anonymousDisplayName')
      .select('-__v');

    return res.status(200).json({
      friends: friends.map((friend) => serializeFriend(friend, userId)),
    });
  }

  // ── POST — send a friend request ───────────────────────────────────────────
  if (req.method === 'POST') {
    const { anonymousDisplayName } = req.body ?? {};
    const displayName = typeof anonymousDisplayName === 'string'
      ? anonymousDisplayName.trim()
      : '';

    if (!displayName) {
      return res.status(400).json({ error: 'anonymousDisplayName is required.' });
    }

    const recipient = await User
      .findOne({ anonymousDisplayName: displayName })
      .select('anonymousDisplayName');

    if (!recipient) {
      return res.status(404).json({ error: 'Friend not found.' });
    }

    if (recipient._id.toString() === userId) {
      return res.status(400).json({ error: 'You cannot add yourself as a friend.' });
    }

    const pairKey = makePairKey(userId, recipient._id);
    const existing = await Friend
      .findOne({ pairKey })
      .populate('requesterId', 'anonymousDisplayName')
      .populate('recipientId', 'anonymousDisplayName')
      .select('-__v');

    if (existing) {
      const direction = existing.requesterId._id?.toString() === userId ? 'outgoing' : 'incoming';

      if (existing.status === 'rejected' && direction === 'outgoing') {
        // Requester wants to resend after rejection. Only allowed once the request expired.
        const canResend = !config.features.enable_friend_request_expiry
          || existing.noExpiry
          || (Date.now() - existing.createdAt.getTime() > THIRTY_DAYS_MS);

        if (!canResend) {
          return res.status(400).json({
            error: 'You can only resend a request after the previous one expires (30 days).',
          });
        }

        // Delete the old rejected record and create a fresh one to reset the expiry clock.
        await Friend.findByIdAndDelete(existing._id);
        const fresh = await Friend.create({
          requesterId: userId,
          recipientId: recipient._id,
          pairKey,
          status: 'pending',
        });
        await fresh.populate('requesterId', 'anonymousDisplayName');
        await fresh.populate('recipientId', 'anonymousDisplayName');
        return res.status(201).json({
          friend: serializeFriend(fresh, userId),
          message: 'Friend request sent.',
        });
      }

      // Check if an existing pending request has expired — treat as if it never existed.
      if (existing.status === 'pending') {
        const isExpired = config.features.enable_friend_request_expiry
          && !existing.noExpiry
          && (Date.now() - existing.createdAt.getTime() > THIRTY_DAYS_MS);

        if (isExpired) {
          await Friend.findByIdAndDelete(existing._id);
          // Fall through to create fresh below.
        } else {
          return res.status(200).json({
            friend: serializeFriend(existing, userId),
            message: 'Friend relationship already exists.',
          });
        }
      } else if (existing.status !== 'rejected') {
        // accepted or other state — just return it
        return res.status(200).json({
          friend: serializeFriend(existing, userId),
          message: 'Friend relationship already exists.',
        });
      }
    }

    const friend = await Friend.create({
      requesterId: userId,
      recipientId: recipient._id,
      pairKey,
      status: 'pending',
    });

    await friend.populate('requesterId', 'anonymousDisplayName');
    await friend.populate('recipientId', 'anonymousDisplayName');

    return res.status(201).json({
      friend: serializeFriend(friend, userId),
      message: 'Friend request sent.',
    });
  }

  return res.status(405).json({ error: 'Method not allowed.' });
});
