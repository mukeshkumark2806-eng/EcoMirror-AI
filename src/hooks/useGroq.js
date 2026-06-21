import { useState, useEffect, useRef } from 'react';

/**
 * Hook to call the Groq proxy and receive a streaming response.
 * Returns sendMessage(payload) and streamingResponse (EventTarget).
 */
export default function useGroq() {
  const [streamingResponse, setStreamingResponse] = useState(null);
  const eventSourceRef = useRef(null);

  const sendMessage = async ({ messages, systemPrompt }) => {
    // Close any previous stream
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const payload = { messages, systemPrompt };
    const response = await fetch('/api/groqProxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Groq proxy error: ${err}`);
    }

    const reader = response.body.getReader();
    const es = new EventTarget();
    const readLoop = async () => {
      const { done, value } = await reader.read();
      if (done) {
        es.dispatchEvent(new Event('end'));
        return;
      }
      const chunk = new TextDecoder().decode(value);
      // Expect SSE format "data: ...\n\n"
      const lines = chunk.split(/\n\n/).filter(Boolean);
      lines.forEach(line => {
        if (line.startsWith('data:')) {
          const data = line.replace(/^data:\s*/, '');
          es.dispatchEvent(new CustomEvent('data', { detail: data }));
        }
      });
      readLoop();
    };
    readLoop();
    eventSourceRef.current = es;
    setStreamingResponse(es);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close?.();
      }
    };
  }, []);

  return { sendMessage, streamingResponse };
}
