const config = require('../../../config/config');
const { AuthService } = require('../../../services/authService');
const { applySecurityHeaders } = require('../../../middleware/securityHeaders');

export default function handler(req, res) {
  applySecurityHeaders(res);

  if (!config.features.enable_auth_system) {
    return res.status(404).json({ error: 'Not found.' });
  }

  return AuthService.logout(req, res);
}
