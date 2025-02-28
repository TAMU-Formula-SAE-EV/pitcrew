export interface Question {
    id: string;
    question: string;
    type: 'text' | 'select' | 'text-area' | 'file';
    options?: [];
    group: number;
}

export const SUBTEAMS = [
    'aerodynamics',
    'battery',
    'chassis',
    'electronics',
    'powertrain',
    'software',
    'suspension',
    'finance',
    'marketing',
    'operations'
];

export type Subteam = typeof SUBTEAMS[number];

export const CANDIDATE_INFO = [
    {
        id: 'first_name',
        question: 'First Name',
        type: 'text',
        group: 1
    },
    {
        id: 'last_name',
        question: 'Last Name',
        type: 'text',
        group: 1
    },
    {
        id: 'phone',
        question: 'Phone Number',
        type: 'text',
        group: 1
    },
    {
        id: 'grad_sem',
        question: 'Graduating Semester',
        type: 'select',
        options: ['Spring', 'Summer', 'Fall', 'Winter'],
        group: 2
    },
    {
        id: 'grad_year',
        question: 'Graduating Year',
        type: 'select',
        options: ['2025', '2026', '2027', '2028'],
        group: 2
    },
    {
        id: 'classification',
        question: 'Classification',
        type: 'select',
        options: ['Freshmen', 'Sophomore', 'Junior', 'Senior'],
        group: 3
    },
    {
        id: 'major',
        question: 'Major',
        type: 'select',
        options: ['AERO', 'BAEN', 'BMEN', 'CHEN', 'CEEN', 'CPSC', 'CPEN', 'ECEN', 'IDEN', 'ISEN', 'MSEN', 'MEEN', 'MTDE', 'NUEN', 'OCEN', 'PETE'],
        group: 3
    },
    {
        id: 'resume_upload',
        question: 'Upload Resume',
        type: 'file',
        group: 4
    }
];

export const GENERAL_QUESTIONS = [
    {
        id: 'motivation',
        question: 'Why do you want to join Formula Electric?',
        type: 'text-area',
        group: 2
    },
    {
        id: 'experience',
        question: 'What experience do you have in working as a team?',
        type: 'text-area',
        group: 2
    },
    {
        id: 'first_choice',
        question: 'First choice subteam',
        type: 'select',
        options: SUBTEAMS as Subteam[],
        group: 1
    },
    {
        id: 'second_choice',
        question: 'Second choice subteam',
        type: 'select',
        options: SUBTEAMS as Subteam[],
        group: 1
    }
];

export const SUBTEAM_QUESTIONS: Record<Subteam, Question[]> = {
    aerodynamics: [
        {
            id: 'aerodynamics-q1',
            question: 'Aerodynamics Question 1',
            type: 'text-area',
            group: 1
        },
        {
            id: 'aerodynamics-q2',
            question: 'Aerodynamics Question 2',
            type: 'text-area',
            group: 1
        },
    ],
    battery: [
        {
            id: 'battery-q1',
            question: 'Battery Question 1',
            type: 'text-area',
            group: 1
        },
        {
            id: 'battery-q2',
            question: 'Battery Question 2',
            type: 'text-area',
            group: 1
        },
    ],
    chassis: [
        {
            id: 'chassis-q1',
            question: 'Chassis Question 1',
            type: 'text-area',
            group: 1
        },
        {
            id: 'chassis-q2',
            question: 'Chassis Question 2',
            type: 'text-area',
            group: 1
        },
    ],
    electronics: [
        {
            id: 'electronics-q1',
            question: 'electronics Question 1',
            type: 'text-area',
            group: 1
        },
        {
            id: 'electronics-q2',
            question: 'electronics Question 2',
            type: 'text-area',
            group: 1
        },
    ],
    powertrain: [
        {
            id: 'powertrain-q1',
            question: 'powertrain Question 1',
            type: 'text-area',
            group: 1
        },
        {
            id: 'powertrain-q2',
            question: 'powertrain Question 2',
            type: 'text-area',
            group: 1
        },
        {
            id: 'powertrain-q3',
            question: 'powertrain Question 3',
            type: 'text-area',
            group: 1
        },
    ],
    software: [
        {
            id: 'software-q1',
            question: 'software Question 1',
            type: 'text-area',
            group: 1
        },
        {
            id: 'software-q2',
            question: 'software Question 2',
            type: 'text-area',
            group: 1
        },
    ],
    suspension: [
        {
            id: 'suspension-q1',
            question: 'suspension Question 1',
            type: 'text-area',
            group: 1
        },
        {
            id: 'suspension-q2',
            question: 'suspension Question 2',
            type: 'text-area',
            group: 1
        },
    ],
    finance: [
        {
            id: 'finance-q1',
            question: 'finance Question 1',
            type: 'text-area',
            group: 1
        },
        {
            id: 'finance-q2',
            question: 'finance Question 2',
            type: 'text-area',
            group: 1
        },
    ],
    marketing: [
        {
            id: 'marketing-q1',
            question: 'marketing Question 1',
            type: 'text-area',
            group: 1
        },
        {
            id: 'marketing-q2',
            question: 'marketing Question 2',
            type: 'text-area',
            group: 1
        },
    ],
    operations: [
        {
            id: 'operations-q1',
            question: 'operations Question 1',
            type: 'text-area',
            group: 1
        },
        {
            id: 'operations-q2',
            question: 'operations Question 2',
            type: 'text-area',
            group: 1
        },
    ]
};