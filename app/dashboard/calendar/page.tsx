"use client"

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Calendar() {

    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status !== 'loading' && !session || !session?.user?.admin) {
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
        <main>
            <div>
                <h1>Calendar</h1>
                <p>View upcoming events and deadlines</p>
            </div>
        </main>
    )
}