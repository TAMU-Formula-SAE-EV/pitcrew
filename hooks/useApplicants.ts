import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Status } from '@prisma/client';
import { useEffect, useRef } from 'react';
import { ApplicantPreviewData, ApplicantUpdate } from '@/types';

// singleton pattern for EventSource
class SSEManager {
    private static instance: SSEManager;
    private eventSource: EventSource | null = null;
    private subscribers = new Set<() => void>();
    
    private constructor() {}
    
    static getInstance() {
        if (!this.instance) {
            this.instance = new SSEManager();
        }
        return this.instance;
    }
    
    subscribe(callback: () => void) {
        if (!this.eventSource) {
            console.log('Creating new EventSource connection');
            this.eventSource = new EventSource('/api/applicants/updates');
            
            this.eventSource.onopen = () => {
                console.log('SSE connection established');
            };
            
            this.eventSource.onmessage = (event) => {
                try {
                    if (event.data.includes('connected')) {
                        console.log('SSE connection confirmed');
                        return;
                    }
                    
                    const updates: ApplicantUpdate[] = JSON.parse(event.data);
                    this.subscribers.forEach(cb => cb());
                } catch (error) {
                    console.error('Error processing SSE message:', error);
                }
            };
            
            this.eventSource.onerror = (error) => {
                console.error('SSE error:', error);
                this.cleanup();
            };
        }
        
        this.subscribers.add(callback);
        console.log(`Subscriber added. Total subscribers: ${this.subscribers.size}`);
    }
    
    unsubscribe(callback: () => void) {
        this.subscribers.delete(callback);
        console.log(`Subscriber removed. Total subscribers: ${this.subscribers.size}`);
        
        if (this.subscribers.size === 0) {
            this.cleanup();
        }
    }
    
    private cleanup() {
        if (this.eventSource) {
            console.log('Closing EventSource connection');
            this.eventSource.close();
            this.eventSource = null;
        }
    }
}

const fetchApplicants = async (status: Status): Promise<ApplicantPreviewData[]> => {
    const params = new URLSearchParams();
    params.append('status', status);
    
    const response = await fetch(`/api/applicants?${params}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch applicants: ${response.statusText}`);
    }
    
    return response.json();
};

export const useApplicants = (status: Status) => {
    const queryClient = useQueryClient();
    const sseManager = SSEManager.getInstance();
    
    useEffect(() => {
        const callback = () => {
            queryClient.invalidateQueries({ queryKey: ['applicants', status] });
        };
        
        sseManager.subscribe(callback);
        
        return () => {
            sseManager.unsubscribe(callback);
        };
    }, [queryClient, status]);

    return useQuery({
        queryKey: ['applicants', status],
        queryFn: () => fetchApplicants(status),
        staleTime: 1000 * 60 * 5,
    });
};