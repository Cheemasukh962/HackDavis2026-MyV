const mongoose = require('mongoose');
const { requireAuth } = require('../../../../lib/requireAuth');
const { connectDB } = require('../../../../lib/db');
const { applySecurityHeaders } = require('../../../../middleware/securityHeaders');
const JournalEntry = require('../../../../models/JournalEntry');

export default requireAuth(async (req, res) => {
  applySecurityHeaders(res);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const { id } = req.query;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: 'Invalid entry ID.' });
  }

  const userId = new mongoose.Types.ObjectId(req.session.sub);

  await connectDB();

  const entry = await JournalEntry.findOne({ _id: id, isPrivate: false });
  if (!entry) return res.status(404).json({ error: 'Entry not found.' });

  const alreadyLiked = entry.likedBy.some((id) => id.equals(userId));

  if (alreadyLiked) {
    entry.likedBy.pull(userId);
    entry.hearts = Math.max(0, entry.hearts - 1);
  } else {
    entry.likedBy.push(userId);
    entry.hearts += 1;
  }

  await entry.save();

  return res.status(200).json({ liked: !alreadyLiked, hearts: entry.hearts });
});
