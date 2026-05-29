const { requireAuth } = require('../../../lib/requireAuth');
const { applySecurityHeaders } = require('../../../middleware/securityHeaders');
const { createChatCompletion } = require('../../../lib/openrouter');
const config = require('../../../config/config');

const AI_MODELS = [
  'google/gemma-4-31b-it:free',
  'google/gemma-4-26b-a4b-it:free',
  'nvidia/llama-3.1-nemotron-70b-instruct:free',
];

export default requireAuth(async (req, res) => {
  applySecurityHeaders(res);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  if (!config.env.OPENROUTER_API_KEY) {
    return res.status(503).json({ error: 'AI service not configured.' });
  }

  const { name, category, address, meta } = req.body ?? {};
  if (!name) {
    return res.status(400).json({ error: 'Resource name is required.' });
  }

  try {
    const response = await createChatCompletion({
      models: AI_MODELS,
      max_tokens: 100,
      messages: [
        {
          role: 'system',
          content: `You write brief 2-sentence overviews of local support resources for survivors of domestic violence and people in crisis.
Given a resource's name, category, and location, describe what the organization likely does and who it serves.
Be factual and warm. Do not invent specific programs not implied by the name. Reply with the overview only — no headers or lists.`,
        },
        {
          role: 'user',
          content: JSON.stringify({ name, category, address, meta }),
        },
      ],
    });

    const text = (response.choices?.[0]?.message?.content || '').trim();
    return res.status(200).json({ overview: text });
  } catch (err) {
    console.error('[OverviewAPI] Error:', err.message);
    return res.status(502).json({ error: 'Overview unavailable.' });
  }
});
