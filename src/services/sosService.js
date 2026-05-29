/**
 * SosService - trusted-contact emergency chat alerts.
 *
 * Stores the Socket.io server reference so protected API routes can write SOS
 * messages into accepted friend chats and notify online contacts in real time.
 */

const { setSocketServer } = require('../lib/socketServer');

class SosService {
  static init(io) {
    setSocketServer(io);
    console.log('[SosService] Trusted-contact SOS messaging enabled.');
  }
}

module.exports = { SosService };
