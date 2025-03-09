import { useState, useEffect } from 'react';
import { getEventSource } from '@/lib/sseClient';

interface CanceledInterviewEvent {
  id: string;
  date: Date;
  time: string;
  applicantId: string;
  applicant: string;
  team: string;
  room: string;
}
interface InterviewEvent extends CanceledInterviewEvent {
  interviewers: {
    name: string;
    role: string;
  }[];
}

export const useInterviews = () => {
  const [activeInterviews, setActiveInterviews] = useState<InterviewEvent[]>([]);
  const [canceledInterviews, setCanceledInterviews] = useState<CanceledInterviewEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInterviews = async () => {
    setIsLoading(true);
    try {
      const activeResponse = await fetch('/api/interviews', { cache: 'no-store' });
      const canceledResponse = await fetch('/api/interviews/canceled', { cache: 'no-store' });

      if (!activeResponse.ok || !canceledResponse.ok) {
        throw new Error(`Error fetching interviews: ${activeResponse.statusText} ${canceledResponse.statusText}`);
      }

      const activeData = await activeResponse.json();
      const canceledData = await canceledResponse.json();

      setActiveInterviews(activeData);
      setCanceledInterviews(canceledData);
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

  return { activeInterviews, canceledInterviews, fetchInterviews, isLoading };
};
