const { requireAuth } = require('../../../lib/requireAuth');
const { connectDB } = require('../../../lib/db');
const { applySecurityHeaders } = require('../../../middleware/securityHeaders');
const User = require('../../../models/User');

function serializePreferences(user) {
  return {
    locationSharingEnabled: Boolean(user?.locationSharingEnabled),
  };
}

export default requireAuth(async (req, res) => {
  applySecurityHeaders(res);
  await connectDB();

  const userId = req.session.sub;

  if (req.method === 'GET') {
    const user = await User.findById(userId).select('locationSharingEnabled');
    if (!user) return res.status(404).json({ error: 'User not found.' });

    return res.status(200).json({ preferences: serializePreferences(user) });
  }

  if (req.method === 'PATCH') {
    const update = {};

    if (typeof req.body?.locationSharingEnabled === 'boolean') {
      update.locationSharingEnabled = req.body.locationSharingEnabled;
    }

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ error: 'No valid preferences provided.' });
    }

    const user = await User
      .findByIdAndUpdate(userId, { $set: update }, { new: true, runValidators: true })
      .select('locationSharingEnabled');

    if (!user) return res.status(404).json({ error: 'User not found.' });

    return res.status(200).json({ preferences: serializePreferences(user) });
  }

  return res.status(405).json({ error: 'Method not allowed.' });
});
