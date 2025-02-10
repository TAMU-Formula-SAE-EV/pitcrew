import { Applicant } from '@prisma/client';

interface CandidateCardProps {
    candidate: Applicant;
}

export default function CandidateCard({ candidate }: CandidateCardProps) {
    // time since application helper
    const getTimeSince = (date: Date) => {
        const days = Math.floor((new Date().getTime() - new Date(date).getTime()) / (1000 * 3600 * 24));
        return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    };

    return (
        <div>
            <div>
                <h3>{candidate.name}</h3>
                {candidate.starred && <span>★</span>}
            </div>
            
            <div>
                <span>{candidate.major}</span>
                <span>{candidate.year}</span>
                <span>Semester {candidate.semester}</span>
                <span>{getTimeSince(candidate.createdAt)}</span>
            </div>

            <div>
                <span>Status: {candidate.status}</span>
                {candidate.override && <span>(Override)</span>}
            </div>
        </div>
    );
}