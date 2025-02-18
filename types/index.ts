import { Status } from '@prisma/client';

// frontend status type that matches the UI
export type StatusType = 'Applied' | 'Interviewing' | 'Offer' | 'Rejected';

// mapping between UI status and prisma status
export const statusMap: Record<StatusType, Status> = {
    'Applied': Status.APPLIED,
    'Interviewing': Status.INTERVIEWING,
    'Offer': Status.OFFER,
    'Rejected': Status.REJECTED
};

// base applicant type
export type ApplicantPreviewData = {
    id: string;
    name: string;
    email: string;
    year: number;
    status: Status;
    starred: boolean;
    approvalCount: number;
    appliedAt: Date;
    subteams?: {
        preferenceOrder: number;
        subteam: {
            name: string;
        };
    }[];
};

export type DetailedApplicant = {
    id: string;
    name: string;
    email: string;
    phone: string;
    major: string;
    year: number;
    semester: number;
    status: Status;
    override: boolean;
    starred: boolean;
    approvalCount: number;
    appliedAt: Date;
    applications: {
        generalResponses: any; // to update
        resumeUrl: string | null;
        subteamApps: {
            responses: any; // to update
            fileUrls: string[];
            subteam: {
                name: string;
            };
        }[];
    }[];
    subteams: {
        preferenceOrder: number;
        subteam: {
            name: string;
        };
    }[];
    interviews: {
        day: Date;
        location: string;
        notes: string | null;
    }[];
};

// update notification type
export type ApplicantUpdate = {
    id: string;
    status: Status;
    updatedAt: string;
};

export type ApplicantSectionProps = {
    status: StatusType;
};