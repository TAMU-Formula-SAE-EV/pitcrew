import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Status } from '@prisma/client';
import { useEffect } from 'react';
import { ApplicantPreviewData } from '@/types';
import { getEventSource } from '@/lib/sseClient';

const fetchApplicants = async (status: Status): Promise<ApplicantPreviewData[]> => {
  const params = new URLSearchParams();
  params.append('status', status);
  const response = await fetch(`/api/applicants?${params}`, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Error fetching applicants: ${response.statusText}`);
  }
  return response.json();
};

export const useApplicants = (status: Status) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const es = getEventSource();
    const onMessage = (event: MessageEvent) => {
      const data = event.data.trim();
      if (data.startsWith(':')) return; // ignore heartbeat
      // Log and optionally parse the payload
      try {
        const payload = JSON.parse(data);
        console.log('SSE update payload:', payload);
      } catch (err) {
        console.warn('SSE: Unable to parse payload, proceeding anyway', err);
      }
      // Invalidate queries for all applicant statuses
      ['APPLIED', 'INTERVIEWING', 'OFFER', 'REJECTED'].forEach((statusKey) => {
        queryClient.invalidateQueries({ queryKey: ['applicants', statusKey] });
      });
      console.log('SSE update received, invalidated applicant queries');
    };

    es.addEventListener('message', onMessage);
    return () => {
      es.removeEventListener('message', onMessage);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['applicants', status],
    queryFn: () => fetchApplicants(status),
    staleTime: 60 * 1000,
    refetchOnMount: true,
  });
};