'use client';
import { Suspense, useEffect } from 'react';
import { useState } from 'react';
import useSWR from 'swr';
import { Status, Subteams } from '@prisma/client';
import { FlowTabs } from '@/components/dashboard/FlowTabs';
import { CandidatesList } from '@/components/dashboard/CandidatesList';
import styles from './dashboard.module.css';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const fetcher = (url: string) => fetch(url).then(r => r.json());

function CandidatesSection({ activeStatus, selectedSubteams }: {
    activeStatus: Status;
    selectedSubteams: Subteams[]
}) {
    const { data: applicants = [] } = useSWR(
        `/api/applicants?status=${activeStatus}${selectedSubteams.length ? '&' + selectedSubteams.map(t => `subteam=${t}`).join('&') : ''
        }`,
        fetcher,
        {
            refreshInterval: 30000,
            revalidateOnFocus: false,
            fallbackData: [],
            keepPreviousData: true
        }
    );

    return <CandidatesList candidates={applicants} />;
}

export default function Dashboard() {
    const [activeStatus, setActiveStatus] = useState<Status>(Status.APPLIED);
    const [selectedSubteams, setSelectedSubteams] = useState<Subteams[]>([]);

    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status !== 'loading' && !session) {
            router.push('/');
        }
    }, [session, status, router]);

    if (status === 'loading') {
        return <p>Loading...</p>;
    }

    if (!session) {
        return null;
    }

    return (
        <main className={styles.main}>
            <div className={styles.header}>
                <h1 className={styles.title}>{session.user?.name}</h1>
                <p className={styles.subtitle}>View and manage all candidates.</p>
            </div>

            <FlowTabs activeStatus={activeStatus} onStatusChange={setActiveStatus} />

            <div className={styles.content}>
                <CandidatesSection
                    activeStatus={activeStatus}
                    selectedSubteams={selectedSubteams}
                />
            </div>
        </main>
    );
}