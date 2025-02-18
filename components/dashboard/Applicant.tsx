import styles from './Applicant.module.css';
import { useApplicantDetails } from '@/hooks/useApplicantDetails';

type ApplicantProps = {
    selectedEmail: string | null;
};

export default function Applicant({ selectedEmail }: ApplicantProps){
    const { data: applicant, isLoading, error } = useApplicantDetails(selectedEmail);

    if (!selectedEmail) {
        return (
            <div className={styles.container}>
                <div className={styles.emptyState}>
                    <p>Select an applicant to view their details</p>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.loadingState}>Loading applicant details...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.container}>
                <div className={styles.errorState}>Error loading applicant details</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <pre className={styles.details}>
                {JSON.stringify(applicant, null, 2)}
            </pre>
        </div>
    );
}