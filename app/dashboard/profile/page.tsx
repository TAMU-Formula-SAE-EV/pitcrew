'use client';

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Profile() {

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
        <div>
            <h1>Welcome, {session.user?.name}</h1>
            <p>Email: {session.user?.email}</p>
            <p>Role: {session.user?.role}</p>
            <div>
                <button onClick={() => signOut({ callbackUrl: '/' })}>Sign out</button>
            </div>
        </div>
    );
}