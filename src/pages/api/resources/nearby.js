const { requireAuth } = require('../../../lib/requireAuth');
const { createChatCompletion } = require('../../../lib/openrouter');
const { applySecurityHeaders } = require('../../../middleware/securityHeaders');

const SYSTEM_PROMPT = `You are a resource discovery assistant for survivors of domestic violence.
Your goal is to provide a list of REAL-WORLD resources based on the user's provided coordinates.

You MUST respond ONLY with a valid JSON object in the following format:
{
  "shelter": [ { "name": "...", "meta": "distance and hours", "phone": "phone number", "address": "physical address", "latitude": 0.0, "longitude": 0.0 }, ... ],
  "legal": [ ... ],
  "financial": [ ... ],
  "counseling": [ ... ]
}

Guidelines:
1. Provide up to 3 real resources for each category if possible.
2. If exact coordinates don't yield specific results, use the general city/region.
3. Keep the 'meta' field brief (e.g., "1.2 mi - Open 24h").
4. 'phone' should be the actual contact number if available.
5. 'address' should be the precise, complete physical street address for accurate geocoding (e.g., "123 Main St, Sacramento, CA 95814").
6. 'latitude' and 'longitude' should be the decimal coordinates of the resource's address.
7. If you absolutely cannot find real resources, provide major national/state-wide organizations that serve that area.
8. Do NOT include any text outside the JSON block.`;

export default requireAuth(async (req, res) => {
  applySecurityHeaders(res);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const { latitude, longitude } = req.body ?? {};

  if (!latitude || !longitude) {
    return res.status(400).json({ error: 'Latitude and longitude are required.' });
  }

  try {
    const response = await createChatCompletion({
      model: 'google/gemma-4-31b-it:free',
      max_tokens: 2048,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Find domestic violence and support resources near latitude ${latitude}, longitude ${longitude}.`,
        },
      ],
    });

    const text = response.choices?.[0]?.message?.content ?? '{}';
    
    // Attempt to parse JSON from the response
    try {
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}') + 1;
      const jsonString = text.slice(jsonStart, jsonEnd);
      const data = JSON.parse(jsonString);
      return res.status(200).json(data);
    } catch (parseErr) {
      console.error('[AidAPI] JSON parse error:', text);
      return res.status(500).json({ error: 'Failed to parse AI response.' });
    }
  } catch (err) {
    console.error('[AidAPI] OpenRouter error:', err.message);
    return res.status(502).json({ error: 'AI service unavailable.' });
  }
});
