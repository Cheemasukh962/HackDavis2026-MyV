/**
 * User.js — survivor account with zero-trace authentication.
 *
 * Usernames are stored lowercase and never surfaced in the UI — the only
 * visible identity is anonymousDisplayName, generated randomly at signup.
 * Passwords are hashed via bcrypt in a pre-save hook; plain text never persists.
 * An optional duressPassword allows login under coercion — the resulting JWT
 * carries { duressMode: true } so the client can silently activate a safe view.
 *
 * Collection: users
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 12;

const DISPLAY_NAME_WORDS = [
  'SafeHaven', 'WarmLight', 'QuietRiver', 'StillWater',
  'GentleBreeze', 'CalmMeadow', 'SilentStar', 'PeacefulDawn',
  'TranquilSky', 'HopefulPath', 'ClearSpring', 'SoftRain',
  'SteadfastOak', 'WiseSparrow', 'BraveRobin', 'FreeButterfly',
];

function generateAnonymousName() {
  const word = DISPLAY_NAME_WORDS[Math.floor(Math.random() * DISPLAY_NAME_WORDS.length)];
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `${word}${suffix}`;
}

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    select: false,
  },

  // WHY: These fields accept plain text on assignment. The pre-save hook below
  // intercepts any modified password field and replaces it with its bcrypt hash
  // before Mongoose ever writes to the database. Plain text never persists.
  passwordHash: {
    type: String,
    required: true,
    select: false,
  },

  // Optional second credential. When used at login, the JWT carries
  // { duressMode: true } so the client can silently activate safety mode
  // (e.g., wipe chat history, show a decoy view) without alerting an abuser.
  duressPasswordHash: {
    type: String,
    default: null,
    select: false,
  },

  // Never derived from real identity — chosen randomly at account creation.
  // This is the only name ever shown in the chat interface.
  anonymousDisplayName: {
    type: String,
    required: true,
    default: generateAnonymousName,
  },

  locationSharingEnabled: {
    type: Boolean,
    default: false,
  },

  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
});

userSchema.pre('save', async function (next) {
  try {
    if (this.isModified('passwordHash')) {
      this.passwordHash = await bcrypt.hash(this.passwordHash, SALT_ROUNDS);
    }
    if (this.isModified('duressPasswordHash') && this.duressPasswordHash) {
      this.duressPasswordHash = await bcrypt.hash(this.duressPasswordHash, SALT_ROUNDS);
    }
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.verifyPassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

userSchema.methods.verifyDuressPassword = function (plain) {
  if (!this.duressPasswordHash) return Promise.resolve(false);
  return bcrypt.compare(plain, this.duressPasswordHash);
};

// Guard against OverwriteModelError during Next.js hot reloads in dev.
module.exports = mongoose.models.User || mongoose.model('User', userSchema);
