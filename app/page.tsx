"use client"

import { useSession, signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import styles from './page.module.css';
import Logo from "@/public/icons/logo.svg";
import FrontPage from '@/public/icons/front-page.svg'
import Image from 'next/image';

export default function Home() {

  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      if (session.user.admin) {
        router.push('/dashboard');
      } else {
        if (session.user.status === 'REGISTRATION') {
          router.push('/application');
        } else if (session.user.status === 'APPLIED') {
          router.push('/application/submitted');
        } else if (session.user.status === 'INTERVIEWING') {
          router.push('/schedule-interview')
        }
      }
    }
  })

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
      <div className={styles.container}>
        <div className={styles.left}>
          <Image
            className={styles.logo}
            src={Logo}
            alt="PitCrew Logo"
          />
          <h1 className={styles.title}>Get Started</h1>
          <p className={styles.subtitle}>Welcome to Pitcrew</p>
          <button className={styles.googleButton} onClick={() => signIn('google', { callbackUrl: '/dashboard' })}>Sign in with Google</button>
          {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        </div>

        <div className={styles.right}>
          <Image
            src={FrontPage}
            alt='Pitcrew'
            className={styles.image} />
        </div>
      </div>
    </main>
  );
}