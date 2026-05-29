/**
 * AiChatService — AI support chat via OpenRouter.
 *
 * Validates that OPENROUTER_API_KEY is present at startup. The actual API calls
 * live in src/pages/api/ai-chat/index.js — this service just gates initialization
 * so a missing key fails loudly on boot rather than silently at request time.
 */

const config = require('../config/config');

class AiChatService {
  static init() {
    if (!config.env.OPENROUTER_API_KEY) {
      console.warn('[AiChatService] OPENROUTER_API_KEY not set — AI chat will return errors.');
    } else {
      console.log('[AiChatService] AI support chat initialized (OpenRouter / google/gemma-4-31b-it:free).');
    }
  }
}

module.exports = { AiChatService };
