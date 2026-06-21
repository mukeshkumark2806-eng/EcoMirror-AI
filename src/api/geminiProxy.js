// Vercel serverless function: Gemini proxy (Node.js)
// File: src/api/geminiProxy.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
  }

  const { messages, systemPrompt } = req.body;
  // Build Gemini request payload (Flash model)
  const payload = {
    model: 'gemini-1.5-flash',
    messages: [
      { role: 'system', content: systemPrompt || 'You are an AI Eco Coach' },
      ...messages,
    ],
    stream: true,
  };

  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + apiKey, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: err });
    }

    // Stream response back to client
    const reader = response.body.getReader();
    res.setHeader('Content-Type', 'text/event-stream');
    // Simple SSE forward
    const pump = async () => {
      const { done, value } = await reader.read();
      if (done) { res.end(); return; }
      const chunk = Buffer.from(value).toString('utf8');
      res.write(`data: ${chunk}\n\n`);
      pump();
    };
    pump();
  } catch (e) {
    console.error('Gemini proxy error', e);
    res.status(500).json({ error: e.message });
  }
}
