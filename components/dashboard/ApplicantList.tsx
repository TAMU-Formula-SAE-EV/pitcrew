import styles from './ApplicantList.module.css';
import { statusMap, ApplicantSectionProps, ApplicantPreviewData, StatusType } from '@/types';
import { useApplicants } from '@/hooks/useApplicants';
import Star from "@/public/icons/star.svg";
import Checkmark from "@/public/icons/checkmark.svg";
import Arrow from "@/public/icons/right_arrow.svg";
import Resume from "@/public/icons/resume.svg";
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';

type ApplicantListProps = {
    status: StatusType;
    selectedEmail: string | null;
    onSelectApplicant: (email: string) => void;
};

export const formatSubteamName = (name: string) => {
    // handle names with underscores
    const words = name.toLowerCase().split('_');
    return words.map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
};

const ApplicantPreview = ({ 
        applicant, 
        isSelected,
        onSelect 
    }: { 
        applicant: ApplicantPreviewData;
        isSelected: boolean;
        onSelect: () => void;
    }) => {
    const daysAgo = formatDistanceToNow(new Date(applicant.appliedAt), { addSuffix: true });
    const subteams = applicant.subteams
        ?.sort((a, b) => a.preferenceOrder - b.preferenceOrder)
        .map(s => formatSubteamName(s.subteam.name))
        .join(', ');

    return (
        <div className={`${styles.applicantPreview} ${isSelected ? styles.selected : ''}`} onClick={onSelect}>
            <div className={styles.headerRow}>
                <h3 className={styles.name}>{applicant.name}</h3>
                <button 
                    className={`${styles.starButton} ${applicant.starred ? styles.starred : ''}`}
                    aria-label="Toggle star"
                >
                    <Image 
                        src={Star.src} 
                        width={13} 
                        height={13} 
                        alt='Star'
                    />
                </button>
            </div>

            <div className={styles.subteamRow}>
                <span className={styles.subteams}>{subteams}</span>
                <Image src={Arrow.src} width={14.4} height={8} alt='Arrow'/>
            </div>

            <div className={styles.detailsRow}>
                <span className={styles.badge}>{applicant.year}</span>
                {/* <div className={styles.approvalBadge}>
                    {[...Array(applicant.approvalCount)].map((_, i) => (
                        <Image 
                            key={i}
                            src={Checkmark.src} 
                            width={16} 
                            height={12} 
                            alt='Approval'
                            className={styles.checkmark}
                        />
                    ))}
                </div> */}
                <button className={styles.resumeButton}>
                    <Image src={Resume.src} width={21.6} height={12} alt='Resume'/>
                </button>
                <span className={styles.timeAgo}>{daysAgo}</span>
            </div>
        </div>
    );
};

export default function ApplicantList({ 
        status, 
        selectedEmail,
        onSelectApplicant 
    }: ApplicantListProps) {
    const { data: applicants, isLoading, error } = useApplicants(statusMap[status]);
    
    if (isLoading) {
        return <div className={styles.loadingState}>Loading applicants...</div>;
    }

    if (error) {
        return <div className={styles.errorState}>Error loading applicants</div>;
    }
    
    return (
        <div className={styles.listContainer}>
            {applicants?.map((applicant) => (
                <ApplicantPreview 
                    key={applicant.id} 
                    applicant={applicant}
                    isSelected={applicant.email === selectedEmail}
                    onSelect={() => onSelectApplicant(applicant.email)}
                />
            ))}
        </div>
    );
}