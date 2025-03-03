import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DetailedApplicant } from '@/types';
import { useEffect } from 'react';
import { getEventSource } from '@/lib/sseClient';

export const useApplicantDetails = (email: string | null) => {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!email) return;
        const es = getEventSource();
        const onMessage = (event: MessageEvent) => {
        const data = event.data.trim();
        if (data.startsWith(':')) return; // ignore heartbeat
        try {
            const update = JSON.parse(data);
            // invalidate only if the update payload's email matches our applicant's email
            if (update.email === email) {
            queryClient.invalidateQueries({ queryKey: ['applicant', email] });
            console.log(`SSE update for ${email}: invalidated applicant query`);
            }
        } catch (error) {
            console.error('Error processing update in details:', error);
        }
        };
        es.addEventListener('message', onMessage);
        return () => {
        es.removeEventListener('message', onMessage);
        };
    }, [email, queryClient]);

    const query = useQuery<DetailedApplicant>({
        queryKey: ['applicant', email],
        queryFn: async () => {
        if (!email) throw new Error('No email provided');
        const response = await fetch(`/api/applicants/${email}`);
        if (!response.ok) throw new Error('Failed to fetch applicant details');
        return response.json();
        },
        enabled: !!email,
    });

    return {
        ...query,
        refetchApplicant: () =>
        queryClient.invalidateQueries({ queryKey: ['applicant', email] }),
    };
};