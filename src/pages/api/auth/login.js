const config = require('../../../config/config');
const { AuthService } = require('../../../services/authService');
const { applySecurityHeaders } = require('../../../middleware/securityHeaders');
const { applyRateLimit } = require('../../../middleware/rateLimit');

// 10 attempts per 15 minutes per IP — tight enough to block brute force,
// loose enough that a real user retrying a forgotten password isn't locked out.
const LOGIN_RATE_LIMIT = { max: 10, windowMs: 15 * 60 * 1000 };

export default async function handler(req, res) {
  applySecurityHeaders(res);
  if (applyRateLimit(req, res, LOGIN_RATE_LIMIT)) return;

  if (!config.features.enable_auth_system) {
    return res.status(404).json({ error: 'Not found.' });
  }

  return AuthService.login(req, res);
}
