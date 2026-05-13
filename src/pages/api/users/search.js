const mongoose = require('mongoose');
const { requireAuth } = require('../../../lib/requireAuth');
const { connectDB } = require('../../../lib/db');
const { applySecurityHeaders } = require('../../../middleware/securityHeaders');
const User = require('../../../models/User');
const Friend = require('../../../models/Friend');

export default requireAuth(async (req, res) => {
  applySecurityHeaders(res);

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const q = String(req.query.q || '').trim();
  if (q.length < 2) {
    return res.status(200).json({ users: [] });
  }

  const userId = req.session.sub;
  await connectDB();

  // Find existing friend relationships so we can exclude them from results.
  const existing = await Friend.find({
    $or: [{ requesterId: userId }, { recipientId: userId }],
  }).select('requesterId recipientId');

  const excludedIds = new Set([userId]);
  existing.forEach((f) => {
    excludedIds.add(String(f.requesterId));
    excludedIds.add(String(f.recipientId));
  });

  const users = await User.find({
    _id: { $nin: [...excludedIds].filter((id) => mongoose.isValidObjectId(id)) },
    anonymousDisplayName: { $regex: q, $options: 'i' },
  })
    .select('anonymousDisplayName')
    .limit(8)
    .lean();

  return res.status(200).json({
    users: users.map((u) => ({ id: String(u._id), displayName: u.anonymousDisplayName })),
  });
});
