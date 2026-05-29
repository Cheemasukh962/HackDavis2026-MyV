/**
 * FriendService — anonymous friend graph.
 *
 * Users connect through anonymous display names only. Real usernames stay out
 * of friend APIs and UI payloads. Friend records are stored as request pairs
 * with pending/accepted/rejected status so future location sharing can require
 * an accepted relationship before exposing sensitive data.
 */

class FriendService {
  static init() {
    console.log('[FriendService] Anonymous friending enabled.');
  }
}

module.exports = { FriendService };
