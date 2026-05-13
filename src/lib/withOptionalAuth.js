const jwt = require('jsonwebtoken');
const config = require('../config/config');

/**
 * withOptionalAuth — getServerSideProps wrapper for pages that are public
 * but can use a session when one exists. Never redirects to login.
 *
 * Injects `session` into props: { sub, displayName, duressMode } | null
 */
function withOptionalAuth(getServerSidePropsFunc) {
  return async (context) => {
    const { req, res } = context;
    const token = req.cookies?.auth_token;

    let session = null;
    if (token) {
      try {
        const decoded = jwt.verify(token, config.env.JWT_SECRET);
        session = {
          sub: decoded.sub,
          displayName: decoded.displayName,
          duressMode: decoded.duressMode || false,
        };
      } catch {
        // Expired or tampered — clear the cookie but stay on the page.
        res.setHeader(
          'Set-Cookie',
          'auth_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict'
        );
      }
    }

    if (!getServerSidePropsFunc) {
      return { props: { session } };
    }

    const result = await getServerSidePropsFunc(context, session);

    if (result.props) {
      return { props: { ...result.props, session } };
    }
    return result;
  };
}

module.exports = { withOptionalAuth };
