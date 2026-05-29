/**
 * openrouter.js — OpenRouter API client.
 *
 * Wraps the OpenRouter chat completions endpoint (OpenAI-compatible format).
 * Lazy-validates the API key on first call rather than at import time so
 * the server can boot without the key when AI chat is disabled.
 *
 * Supports single-model calls ({ model }) and multi-model fallback chains
 * ({ models: [...], route: 'fallback' }) via OpenRouter's native fallback routing.
 * When a model is rate-limited or unavailable, OpenRouter automatically tries
 * the next model in the array server-side.
 */

const config = require('../config/config');

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * Sends a chat completion request to OpenRouter.
 * Pass `models` (array) to enable OpenRouter's automatic model fallback chain.
 * Pass `model` (string) for a single model with no fallback.
 * @param {{ model?: string, models?: string[], messages: Array<{role: string, content: string}>, max_tokens: number }} options
 * @returns {Promise<Object>} OpenAI-format response object.
 */
async function createChatCompletion({ model, models, messages, max_tokens }) {
  const key = config.env.OPENROUTER_API_KEY;
  if (!key) throw new Error('[OpenRouter] OPENROUTER_API_KEY is missing from environment variables.');

  const body = models
    ? { models, route: 'fallback', messages, max_tokens }
    : { model, messages, max_tokens };

  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://safehaven.app',
      'X-Title': 'SafeHaven',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`[OpenRouter] ${res.status}: ${text}`);
  }

  return res.json();
}

module.exports = { createChatCompletion };
