// Vercel serverless function: Groq proxy (Node.js)
// File: src/api/groqProxy.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GROQ_API_KEY not configured' });
  }

  const { messages, systemPrompt } = req.body;

  const payload = {
    model: 'groq-llama3-8b-8192',
    messages: [
      { role: 'system', content: systemPrompt || 'You are an AI Eco Coach' },
      ...messages,
    ],
    stream: true,
  };

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: err });
    }

    // Stream response back to client as Server‑Sent Events
    const reader = response.body.getReader();
    res.setHeader('Content-Type', 'text/event-stream');
    const pump = async () => {
      const { done, value } = await reader.read();
      if (done) { res.end(); return; }
      const chunk = Buffer.from(value).toString('utf8');
      res.write(`data: ${chunk}\n\n`);
      pump();
    };
    pump();
  } catch (e) {
    console.error('Groq proxy error', e);
    res.status(500).json({ error: e.message });
  }
}
