const { requireAuth } = require('../../../lib/requireAuth');
const { applySecurityHeaders } = require('../../../middleware/securityHeaders');
const appConfig = require('../../../config/config');

const VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Rachel — ElevenLabs default

export default requireAuth(async (req, res) => {
  applySecurityHeaders(res);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const apiKey = appConfig.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return res.status(501).json({ error: 'TTS service not configured.' });
  }

  const { text } = req.body ?? {};
  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'text is required.' });
  }

  const trimmed = text.trim().slice(0, 5000);

  try {
    const upstream = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        body: JSON.stringify({
          text: trimmed,
          model_id: 'eleven_turbo_v2',
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      }
    );

    if (!upstream.ok) {
      const err = await upstream.json().catch(() => ({}));
      console.error('[TTS] ElevenLabs error:', err);
      return res.status(upstream.status).json({ error: 'TTS generation failed.' });
    }

    const audioBuffer = Buffer.from(await upstream.arrayBuffer());
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', audioBuffer.length);
    return res.status(200).send(audioBuffer);
  } catch (err) {
    console.error('[TTS] Internal error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});
