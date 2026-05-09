const config = require('../../../config/config');
const { AuthFeature } = require('../../../features/auth_feature');
const { applySecurityHeaders } = require('../../../middleware/securityHeaders');

export default async function handler(req, res) {
  applySecurityHeaders(res);

  if (!config.features.enable_auth_system) {
    return res.status(404).json({ error: 'Not found.' });
  }

  return AuthFeature.register(req, res);
}
