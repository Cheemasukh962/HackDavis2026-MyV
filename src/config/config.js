/**
 * Config Singleton.
 *
 * Merges public feature flags (config.json, safe to commit) with
 * private environment variables (.env, never committed).
 *
 * Node's require() cache means every file that does
 * require('./config/config') receives the exact same object — no
 * repeated dotenv calls, no duplicate reads. That's the Singleton.
 */

require('dotenv').config();

// Feature flags are defined in config.json (safe to commit — no secrets).
// Toggle these to enable or disable whole subsystems without touching service code.
// app.js reads each flag before calling the corresponding service's init().
//
// enable_anonymous_chat       — Socket.io real-time messaging between accepted friends
// enable_auth_system          — JWT login/register/logout via /api/auth/*
// enable_pwa                  — PWA manifest validation and service worker registration
// enable_journal              — Private evidence journal with GridFS media attachments
// enable_ai_chat              — AI support chat via OpenRouter (/api/ai-chat)
// enable_bookmarks            — Save AI chat responses as bookmarks with attachments
// enable_button               — Discreet PrivateModeButton on cover app pages
// enable_geolocation          — Opt-in latest-location storage via /api/geolocation
// enable_friending            — Anonymous friend request / accept / reject graph
// enable_trusted_contacts     — Mark accepted friends as trusted for SOS sharing
// enable_sos                  — SOS alert messaging to trusted contacts via Socket.io
// enable_friend_request_expiry — Auto-expire pending friend requests after a set time
// enable_swipe_panic          — Swipe gesture triggers panic exit (client-side)
// enable_journal_privacy      — Hide private journal entries when in duress mode
// enable_safety_alert         — (Not yet implemented) Automated safety check-in alerts
// enable_resource_directory   — (Not yet implemented) Searchable local resource listings
// enable_crisis_escalation    — (Not yet implemented) Escalate to emergency services

const featureFlags = require('./config.json');

const config = {
  ...featureFlags,
  env: {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || '3000',
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    NEWSAPI_AI_KEY: process.env.NEWSAPI_AI_KEY,
    ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY,
    MAPBOX_ACCESS_TOKEN: process.env.MAPBOX_ACCESS_TOKEN,
    ALLOWED_ORIGIN: process.env.ALLOWED_ORIGIN,
  },
};

module.exports = config;
