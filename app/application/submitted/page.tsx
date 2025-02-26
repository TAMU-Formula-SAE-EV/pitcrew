"use client"

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import styles from './Submitted.module.css';
import Logo from "@/public/icons/logo.svg";
import Image from 'next/image';
import FormulaLogo from '@/public/icons/formula-logo.svg';
import InstaLogo from '@/public/icons/insta.svg';
import Link from 'next/link';

export default function Submitted() {

    const { data: session } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (session) {
            if (session.user.admin) {
                router.push('/dashboard');
            }
            // } else if (session.user.status === 'REGISTRATION') {
            //     router.push('/application');
            // }
        }
    })

    return (
        <main>
            <div className={styles.container}>
                <div className={styles.content}>
                    <Image className={styles.logo} src={Logo} alt="PitCrew Logo" />
                    <h1 className={styles.title}>Submitted!</h1>
                    <hr className={styles.line} />
                    <p className={styles.subtitle}>We have received your application to be a full team member of TAMU Formula Electric for the 2025-2026 school year.</p>
                    <p className={styles.subtitle}>Interview decisions will go out the week of March 16th.</p>
                    <div className={styles.iconContainer}>
                        <Link
                            href='https://www.tamuformulaelectric.com'
                        >
                            <Image className={styles.formulaLogo} src={FormulaLogo} alt="Formula Logo" />
                        </Link>
                        <Link
                            href='https://www.instagram.com/tamuformulaelectric/'
                        >
                            <Image className={styles.insta} src={InstaLogo} alt="Insta Logo" />
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}