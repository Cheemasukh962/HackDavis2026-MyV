/**
 * db.js — MongoDB connection singleton.
 *
 * Caches the Mongoose connection on the Node.js global object so Next.js
 * hot-module reloads in development don't open a new connection on every
 * file change. In production, the cached connection is reused across
 * serverless invocations for the lifetime of the container.
 *
 * Usage: call connectDB() at the top of any API route that needs the database.
 */

const mongoose = require('mongoose');
const config = require('../config/config');

// WHY: Store the connection promise on the Node.js global object so it
// survives Next.js hot-module reloads in dev without opening a new
// connection on every file change.
let cached = global._mongooseCache;
if (!cached) {
  cached = global._mongooseCache = { conn: null, promise: null };
}

/**
 * Connects to MongoDB and returns the Mongoose connection.
 * Safe to call multiple times — returns the cached connection after the first call.
 * @returns {Promise<mongoose.Connection>}
 */
async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(config.env.MONGODB_URI, {
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = { connectDB };
