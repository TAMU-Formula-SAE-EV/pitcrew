import { useState, useEffect } from 'react';
import { getEventSource } from '@/lib/sseClient';

export const useInterviews = () => {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInterviews = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/interviews', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Error fetching interviews: ${response.statusText}`);
      }
      const data = await response.json();
      setInterviews(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // initial fetch
    fetchInterviews();

    // set up SSE for automatic updates
    const es = getEventSource();
    const onMessage = (event: MessageEvent) => {
      const data = event.data.trim();
      if (data.startsWith(':')) return; // ignore heartbeat
      try {
        JSON.parse(data);
      } catch (err) {
        console.warn('SSE: Could not parse message, proceeding anyway', err);
      }
      // re-fetch interviews on any update
      fetchInterviews();
    };

    es.addEventListener('message', onMessage);
    return () => {
      es.removeEventListener('message', onMessage);
      es.close(); // Clean up the SSE connection on unmount
    };
  }, []);

  return { interviews, isLoading };
};
