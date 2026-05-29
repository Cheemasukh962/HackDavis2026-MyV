/**
 * BookmarkService — save and retrieve AI chat responses as bookmarks.
 *
 * Bookmarks let survivors flag important AI guidance or resource links for
 * later reference. Attachments (images, files) are stored in MongoDB GridFS
 * under the bookmark_attachments bucket. API routes live in
 * src/pages/api/bookmarks/.
 */

class BookmarkService {
  static init() {
    console.log('[BookmarkService] Bookmark system initialized.');
    console.log('[BookmarkService] Attachment storage: MongoDB GridFS (bookmark_attachments).');
  }
}

module.exports = { BookmarkService };
