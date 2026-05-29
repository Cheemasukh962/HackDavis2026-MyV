/**
 * Feature Orchestrator.
 *
 * This is the ONLY place features are activated. The pattern is always:
 *   1. Import the feature class.
 *   2. Read its toggle from config.
 *   3. Call FeatureClass.init() inside the guard — nothing else runs if disabled.
 *
 * Keep this file lean. Business logic lives in src/services/, not here.
 */

const config = require('./config/config');
const { ChatSocketService } = require('./services/chatSocketService');
const { AuthService } = require('./services/authService');
const { PwaService } = require('./services/pwaService');
const { JournalService } = require('./services/journalService');
const { AiChatService } = require('./services/aiChatService');
const { BookmarkService } = require('./services/bookmarkService');
const { ButtonService } = require('./services/buttonService');
const { GeolocationService } = require('./services/geolocationService');
const { FriendService } = require('./services/friendService');
const { TrustedContactService } = require('./services/trustedContactService');
const { SosService } = require('./services/sosService');

/**
 * @param {import('socket.io').Server} io  - Socket.io server instance from server.js
 */
function initFeatures(io) {
  if (config.features.enable_pwa) {
    PwaService.init();
  }

  if (config.features.enable_auth_system) {
    AuthService.init();
  }

  if (config.features.enable_anonymous_chat) {
    ChatSocketService.init(io);
  }

  if (config.features.enable_journal) {
    JournalService.init();
  }

  if (config.features.enable_ai_chat) {
    AiChatService.init();
  }

  if (config.features.enable_bookmarks) {
    BookmarkService.init();
  }

  if (config.features.enable_button) {
    ButtonService.init();
  }

  if (config.features.enable_geolocation) {
    GeolocationService.init();
  }

  if (config.features.enable_friending) {
    FriendService.init();
  }

  if (config.features.enable_trusted_contacts) {
    TrustedContactService.init();
  }

  if (config.features.enable_sos) {
    SosService.init(io);
  }

  // Template for adding the next feature:
  //
  // const { SafetyAlertFeature } = require('./features/safety_alert_feature');
  // if (config.features.enable_safety_alert) {
  //   SafetyAlertFeature.init(io);
  // }
}

module.exports = { initFeatures };
