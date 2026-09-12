// ======================================================
// NIKHIL AI - OPENAI
// ======================================================

app.post('/api/ai', async (req, res) => {
  try {
    const q = String(req.body.message || '').trim();

    if (!q) {
      return res.status(400).json({
        error: 'Message is required'
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({
        error: 'OPENAI_API_KEY is not configured'
      });
    }

    // Search relevant NIKHILVERSE videos
    const terms = q
      .toLowerCase()
      .split(/\s+/)
      .filter(x => x.length > 2);

    const matches = db.videos
      .filter(v => {
        const text = String(
          (v.title || '') + ' ' +
          (v.description || '') + ' ' +
          (v.category || '') + ' ' +
          (v.channel || '')
        ).toLowerCase();

        return terms.some(t => text.includes(t));
      })
      .slice(0, 10);

    // If nothing matches, give AI some latest content
    const contextVideos = matches.length
      ? matches
      : db.videos.slice(0, 10);

    const contentContext = contextVideos
      .map((v, i) =>
        `${i + 1}. ${v.title}
Channel: ${v.channel || 'NIKHILVERSE'}
Category: ${v.category || 'Videos'}
URL: ${v.youtube_url || ''}
Description: ${v.description || ''}`
      )
      .join('\n\n');

    const systemInstructions = `
You are Nikhil AI, the official AI assistant for NIKHILVERSE.

Your job:
- Answer users naturally and helpfully.
- You can answer general questions.
- Help users discover NIKHILVERSE documentaries, videos and content.
- When relevant, use the NIKHILVERSE content provided below.
- Never invent a NIKHILVERSE video, title, URL, channel or fact.
- If the provided NIKHILVERSE content does not contain the requested information, clearly say that you could not find it.
- Reply in the same language/style as the user.
- For Hindi/Hinglish users, reply in natural Hindi/Hinglish.
- Keep normal answers concise but useful.

NIKHILVERSE CONTENT:
${contentContext}
`;

    const response = await fetch(
      'https://api.openai.com/v1/responses',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || 'gpt-5',
          instructions: systemInstructions,
          input: q,
          store: false
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('OpenAI API error:', data);

      return res.status(500).json({
        error:
          data?.error?.message ||
          'OpenAI API request failed'
      });
    }

    const answer =
      data.output_text ||
      'Sorry, mujhe abhi response nahi mila.';

    res.json({
      answer,
      results: matches
    });

  } catch (e) {
    console.error('Nikhil AI error:', e);

    res.status(500).json({
      error: 'Nikhil AI temporarily unavailable'
    });
  }
});
