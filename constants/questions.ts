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
        id: 'resume',
        question: 'Upload Resume',
        type: 'file',
        group: 4
    }
];

export const GENERAL_QUESTIONS = [
    {
        id: 'whyJoin',
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
            question: 'Electronics Question 1',
            type: 'text-area',
            group: 1
        },
        {
            id: 'electronics-q2',
            question: 'Electronics Question 2',
            type: 'text-area',
            group: 1
        },
    ],
    powertrain: [
        {
            id: 'powertrain-q1',
            question: 'Powertrain Question 1',
            type: 'text-area',
            group: 1
        },
        {
            id: 'powertrain-q2',
            question: 'Powertrain Question 2',
            type: 'text-area',
            group: 1
        },
        {
            id: 'powertrain-q3',
            question: 'Powertrain Question 3',
            type: 'text-area',
            group: 1
        },
    ],
    software: [
        {
            id: 'software-q1',
            question: 'Software Question 1',
            type: 'text-area',
            group: 1
        },
        {
            id: 'software-q2',
            question: 'Software Question 2',
            type: 'text-area',
            group: 1
        },
    ],
    suspension: [
        {
            id: 'suspension-q1',
            question: 'Suspension Question 1',
            type: 'text-area',
            group: 1
        },
        {
            id: 'suspension-q2',
            question: 'Suspension Question 2',
            type: 'text-area',
            group: 1
        },
    ],
    finance: [
        {
            id: 'finance-q1',
            question: 'Finance Question 1',
            type: 'text-area',
            group: 1
        },
        {
            id: 'finance-q2',
            question: 'Finance Question 2',
            type: 'text-area',
            group: 1
        },
    ],
    marketing: [
        {
            id: 'marketing-q1',
            question: 'Marketing Question 1',
            type: 'text-area',
            group: 1
        },
        {
            id: 'marketing-q2',
            question: 'Marketing Question 2',
            type: 'text-area',
            group: 1
        },
    ],
    operations: [
        {
            id: 'operations-q1',
            question: 'Operations Question 1',
            type: 'text-area',
            group: 1
        },
        {
            id: 'operations-q2',
            question: 'Operations Question 2',
            type: 'text-area',
            group: 1
        },
    ]
};

export const SUBTEAM_DESIGN_CHALLENGES: Record<Subteam, string> = {
    aerodynamics: 'https://www.google.com',
    battery: 'https://www.yahoo.com',
    chassis: 'https://www.youtube.com',
    electronics: 'https://www.ebay.com',
    powertrain: 'https://www.youtube.com',
    software: 'https://www.apple.com',
    suspension: 'https://www.hotmail.com',
    finance: 'https://www.youtube.com',
    marketing: 'https://www.youtube.com',
    operations: 'https://www.youtube.com'
};