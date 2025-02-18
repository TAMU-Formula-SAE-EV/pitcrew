'use client';
import { useState } from 'react';
import styles from './dashboard.module.css';
import Timeline from '@/components/dashboard/Timeline';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusType } from '@/types';
import { ApplicantSection } from '@/components/dashboard/ApplicantSection';

const queryClient = new QueryClient();

export default function DashboardWrapper() {
  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard />
    </QueryClientProvider>
  );
}

function Dashboard() {
  const [activeStatus, setActiveStatus] = useState<StatusType>('Applied');

  const handleStatusChange = (status: StatusType) => {
    setActiveStatus(status);
  };

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1 className={styles.title}>LeBron James</h1>
        <p className={styles.subtitle}>View and manage all candidates.</p>

        <Timeline 
          activeTab={activeStatus} 
          onTabChange={handleStatusChange}
        />
      </div>

      <ApplicantSection status={activeStatus} />
    </main>
  );
}