import { ApplicantSectionProps } from '@/types';
import ApplicantList from './ApplicantList';
import Applicant from './Applicant';
import { useState, useEffect } from 'react';
import styles from './ApplicantSection.module.css';

export function ApplicantSection({ status }: ApplicantSectionProps) {
    const [selectedEmail, setSelectedEmail] = useState<string | null>(null);

    useEffect(() => {
        setSelectedEmail(null);
    }, [status]);

    return (
        <div className={styles.applicantsSection}>
            <ApplicantList 
            status={status}
            selectedEmail={selectedEmail}
            onSelectApplicant={setSelectedEmail}/>

            <Applicant selectedEmail={selectedEmail} />
        </div>
    );
}