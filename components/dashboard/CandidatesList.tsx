import { Applicant } from '@prisma/client';
import styles from './CandidatesList.module.css';
import CandidateCard from "./CandidateCard";

interface CandidatesListProps {
    candidates: Applicant[];
}

export function CandidatesList({ candidates }: CandidatesListProps) {
    return (
        <div className={styles.grid}>
            {Array.isArray(candidates) && candidates.map((candidate) => (
                <CandidateCard key={candidate.id} candidate={candidate} />
            ))}
        </div>
    );
}