let eventSource: EventSource | null = null;

export function getEventSource(): EventSource {
  if (!eventSource) {
    eventSource = new EventSource('/api/updates');
    eventSource.onopen = () => console.log('SSE: Connection established');
    eventSource.onerror = (error) => console.error('SSE: Error', error);
  }
  return eventSource;
}