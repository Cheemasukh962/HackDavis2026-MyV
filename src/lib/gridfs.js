/**
 * gridfs.js — lazy GridFSBucket accessors for binary file storage.
 *
 * GridFS splits large files (images, audio, video, PDFs) into chunks and stores
 * them in MongoDB instead of the filesystem. Two buckets are used:
 *   - journal_attachments  → evidence files attached to journal entries
 *   - bookmark_attachments → files attached to AI chat bookmarks
 *
 * Both buckets are created lazily on first access because GridFSBucket requires
 * an active database connection, which isn't available at module load time.
 */

const mongoose = require('mongoose');

// WHY lazy: GridFSBucket requires an active DB connection. The connection
// is established asynchronously after server startup, so we can't create
// the bucket at module load time. Callers get the bucket on first use,
// which is always after connectDB() has resolved.
let _journalBucket = null;
let _bookmarkBucket = null;

/** Returns the GridFSBucket for journal evidence attachments. Throws if DB is not connected. */
function getAttachmentBucket() {
  if (!mongoose.connection.db) throw new Error('[GridFS] No database connection.');
  if (!_journalBucket) {
    _journalBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'journal_attachments',
    });
  }
  return _journalBucket;
}

/** Returns the GridFSBucket for bookmark attachments. Throws if DB is not connected. */
function getBookmarkBucket() {
  if (!mongoose.connection.db) throw new Error('[GridFS] No database connection.');
  if (!_bookmarkBucket) {
    _bookmarkBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'bookmark_attachments',
    });
  }
  return _bookmarkBucket;
}

module.exports = { getAttachmentBucket, getBookmarkBucket };
