"use client";

import { useState, useEffect, useCallback } from 'react';

export interface InterviewEvent {
  id: string;
  interview_id: string;
  timestamp: string;
  type: 'question' | 'answer' | 'score' | 'system';
  payload: any;
}

export function useInterview(interviewId: string | null) {
  const [events, setEvents] = useState<InterviewEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!interviewId) return;

    const eventSource = new EventSource(`/api/interviews/${interviewId}/stream`);

    eventSource.onopen = () => {
      setIsConnected(true);
      setError(null);
    };

    eventSource.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        
        if (data.type === 'event') {
          setEvents((prev) => [...prev, data.data]);
        } else if (data.type === 'connected') {
          // Connection established
        } else if (data.type === 'heartbeat') {
          // Keep-alive
        }
      } catch (err) {
        console.error('Error parsing event:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('EventSource error:', err);
      setError('Connection error');
      setIsConnected(false);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [interviewId]);

  const submitAnswer = useCallback(
    async (answer: string, questionId?: string) => {
      if (!interviewId) return;

      try {
        const response = await fetch(`/api/interviews/${interviewId}/answer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answer, question_id: questionId }),
        });

        if (!response.ok) {
          throw new Error('Failed to submit answer');
        }

        return await response.json();
      } catch (err: any) {
        setError(err.message);
        throw err;
      }
    },
    [interviewId]
  );

  const startInterview = useCallback(async () => {
    if (!interviewId) return;

    try {
      const response = await fetch(`/api/interviews/${interviewId}/start`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to start interview');
      }

      return await response.json();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [interviewId]);

  const getEvaluation = useCallback(async () => {
    if (!interviewId) return null;

    try {
      const response = await fetch(`/api/interviews/${interviewId}/evaluation`);

      if (!response.ok) {
        if (response.status === 404) {
          return null; // Evaluation not ready
        }
        throw new Error('Failed to get evaluation');
      }

      return await response.json();
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  }, [interviewId]);

  return {
    events,
    isConnected,
    error,
    submitAnswer,
    startInterview,
    getEvaluation,
  };
}


