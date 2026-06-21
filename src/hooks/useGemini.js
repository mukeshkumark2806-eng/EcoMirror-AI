import { useState, useEffect, useRef } from 'react';

/**
 * Hook to send messages to the Gemini proxy and receive a streaming response.
 * Returns sendMessage (payload) and streamingResponse (EventSource).
 */
export default function useGemini() {
  const [streamingResponse, setStreamingResponse] = useState(null);
  const eventSourceRef = useRef(null);

  const sendMessage = async ({ messages, systemPrompt }) => {
    // Close any previous stream
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // Prepare payload for proxy (POST body)
    const payload = {
      messages,
      systemPrompt,
    };

    // Use EventSource via fetch with SSE (the proxy returns text/event-stream)
    const response = await fetch('/api/geminiProxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Gemini proxy error: ${err}`);
    }

    const reader = response.body.getReader();
    const stream = new ReadableStream({
      start(controller) {
        function pump() {
          reader.read().then(({ done, value }) => {
            if (done) {
              controller.close();
              return;
            }
            // value is a Uint8Array – convert to string
            const chunk = new TextDecoder().decode(value);
            // Expect SSE format "data: ...\n\n"
            const dataLines = chunk.split(/\n\n/).filter(Boolean);
            dataLines.forEach(line => {
              if (line.startsWith('data:')) {
                const data = line.replace(/^data:\s*/, '');
                controller.enqueue(data);
              }
            });
            pump();
          });
        }
        pump();
      },
    });

    const es = new EventTarget();
    const streamReader = stream.getReader();
    // Forward streamed chunks as custom events
    const readLoop = async () => {
      const { done, value } = await streamReader.read();
      if (done) {
        es.dispatchEvent(new Event('end'));
        return;
      }
      es.dispatchEvent(new CustomEvent('data', { detail: value }));
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
