import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DetailedApplicant } from '@/types';
import { useEffect } from 'react';

export const useApplicantDetails = (email: string | null) => {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!email) return;

        const eventSource = new EventSource('/api/applicants/updates');
        
        eventSource.onmessage = (event) => {
            try {
                const update = JSON.parse(event.data);
                if (update.email === email) {
                    queryClient.invalidateQueries({
                        queryKey: ['applicant', email]
                    });
                }
            } catch (error) {
                console.error('Error processing update:', error);
            }
        };

        return () => {
            eventSource.close();
        };
    }, [email, queryClient]);

    return useQuery<DetailedApplicant>({
        queryKey: ['applicant', email],
        queryFn: async () => {
            if (!email) throw new Error('No email provided');
            const response = await fetch(`/api/applicants/${email}`);
            if (!response.ok) throw new Error('Failed to fetch applicant details');
            return response.json();
        },
        enabled: !!email,
    });
};