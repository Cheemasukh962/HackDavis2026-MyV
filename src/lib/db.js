const mongoose = require('mongoose');
const config = require('../config/config');

// WHY: Store the connection promise on the Node.js global object so it
// survives Next.js hot-module reloads in dev without opening a new
// connection on every file change.
let cached = global._mongooseCache;
if (!cached) {
  cached = global._mongooseCache = { conn: null, promise: null };
}

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
