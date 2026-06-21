import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import useGroq from '../hooks/useGroq';
import useLocalStorage from '../hooks/useLocalStorage';

const EcoCoachContext = createContext();

export const EcoCoachProvider = ({ children }) => {
  const [history, setHistory] = useLocalStorage('ecoCoachHistory', []);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const { sendMessage: sendToGroq, streamingResponse } = useGroq();

  // Listen to streaming response and update history
  useEffect(() => {
    if (!streamingResponse) return;
    setIsTyping(true);
    const handleChunk = chunk => {
      // Append chunk to the last assistant message
      setHistory(prev => {
        const last = prev[prev.length - 1];
        if (last && last.role === 'assistant') {
          const updated = { ...last, content: (last.content || '') + chunk };
          return [...prev.slice(0, -1), updated];
        }
        // If no assistant message yet, create one
        return [...prev, { role: 'assistant', content: chunk }];
      });
    };
    streamingResponse.on('data', e => handleChunk(e));
    streamingResponse.on('end', () => setIsTyping(false));
    streamingResponse.on('error', err => {
      console.error(err);
      setError(err.message);
      setIsTyping(false);
    });
    // cleanup
    return () => {
      streamingResponse.removeAllListeners();
    };
  }, [streamingResponse, setHistory]);

  const sendMessage = async (userMessage, assessmentData) => {
    // Append user message to history
    setHistory(prev => [...prev, { role: 'user', content: userMessage }]);
    // Build system prompt using assessment data if provided
    const systemPrompt = assessmentData
      ? `You are an Eco Coach. Provide recommendations based on the following assessment results: ${JSON.stringify(
          assessmentData,
        )}`
      : undefined;
    // Send to Gemini
    await sendToGroq({ messages: history, systemPrompt });
  };

  return (
    <EcoCoachContext.Provider value={{ history, sendMessage, isTyping, error }}>
      {children}
    </EcoCoachContext.Provider>
  );
};

export const useEcoCoach = () => useContext(EcoCoachContext);
