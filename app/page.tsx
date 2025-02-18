"use client"

import { useSession, signIn } from 'next-auth/react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function Home() {

  const { data: session } = useSession();

  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const errorMessages: Record<string, string> = {
    AccessDenied: 'Please use your Texas A&M email to log in.',
    CredentialsSignin: 'Invalid email or password.',
    Default: 'An unexpected error occurred. Please try again.',
  };

  const errorMessage = error ? errorMessages[error] || errorMessages.Default : null;

  return (
    <main>
      <div>
        <h1>Formula Electric Recruiting</h1>
        <p>Join our team and help build the future of electric racing.</p>
        <div>
          <Link href="/apply">Apply Now</Link>
        </div>
        {!session && (
          <div>
            <p>You are not signed in.</p>
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
            <button onClick={() => signIn('google', { callbackUrl: '/dashboard' })}>Sign in with Google</button>
          </div>
        )}
      </div>
    </main>
  );
}