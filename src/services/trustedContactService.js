/**
 * TrustedContactService — trusted friend allowlist.
 *
 * A trusted contact is an accepted friend that the current user explicitly
 * marks as eligible for future SOS/location sharing. Trust is one-directional:
 * each user controls their own trusted-contact list.
 */

class TrustedContactService {
  static init() {
    console.log('[TrustedContactService] Trusted contact allowlist enabled.');
  }
}

module.exports = { TrustedContactService };
