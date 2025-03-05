import { PrismaClient, Status, AdminRole, Subteams } from '@prisma/client';

const prisma = new PrismaClient()

async function main() {
    // clean the database
    await prisma.interviewAdmin.deleteMany()
    await prisma.interview.deleteMany()
    await prisma.subteamApplication.deleteMany()
    await prisma.application.deleteMany()
    await prisma.applicantSubteam.deleteMany()
    await prisma.applicant.deleteMany()
    await prisma.admin.deleteMany()
    await prisma.subteam.deleteMany()

    // create subteams
    const aerodynamicsTeam = await prisma.subteam.create({
        data: {
        name: 'AERODYNAMICS',
        description: 'Aerodynamic design and testing of vehicle components',
        },
    });

    const batteryTeam = await prisma.subteam.create({
        data: {
        name: 'BATTERY',
        description: 'Development and optimization of battery systems',
        },
    });

    const chassisTeam = await prisma.subteam.create({
        data: {
        name: 'CHASSIS',
        description: 'Design and manufacturing of vehicle chassis',
        },
    });

    const electronicsTeam = await prisma.subteam.create({
        data: {
        name: 'ELECTRONICS',
        description: 'Vehicle electronics and sensor systems',
        },
    });

    const powertrainTeam = await prisma.subteam.create({
        data: {
        name: 'POWERTRAIN',
        description: 'Design and development of powertrain systems',
        },
    });

    const softwareTeam = await prisma.subteam.create({
        data: {
        name: 'SOFTWARE',
        description: 'Vehicle software and embedded systems',
        },
    });

    const suspensionTeam = await prisma.subteam.create({
        data: {
        name: 'SUSPENSION',
        description: 'Design and testing of vehicle suspension systems',
        },
    });

    const financeTeam = await prisma.subteam.create({
        data: {
        name: 'FINANCE',
        description: 'Financial planning and management for the team',
        },
    });

    const marketingTeam = await prisma.subteam.create({
        data: {
        name: 'MARKETING',
        description: 'Brand development and marketing strategies',
        },
    });

    const operationsTeam = await prisma.subteam.create({
        data: {
        name: 'OPERATIONS',
        description: 'Team logistics and operational coordination',
        },
    });

    // create an admin
    const admin = await prisma.admin.create({
        data: {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '123-456-7890',
        role: AdminRole.LEAD,
        subteams: {
            connect: { id: softwareTeam.id },
        },
        },
    });

    // create applicants with their applications
    await prisma.applicant.create({
        data: {
        name: 'Alice Johnson',
        email: 'alice@example.com',
        phone: '555-0123',
        major: 'Computer Science',
        classification: 'Sophomore',
        gradSem: 'Summer',
        gradYear: 2026,
        status: Status.APPLIED,
        starred: true,
        applications: {
            create: {
            generalResponses: {
                whyJoin: 'I am passionate about electric vehicles',
                experience: '2 years of programming experience',
            },
            subteamApps: {
                create: {
                responses: {
                    technicalSkills: 'Python, C++, JavaScript',
                    projectExperience: 'Built a robot in freshman year',
                },
                subteam: {
                    connect: { id: softwareTeam.id },
                },
                },
            },
            },
        },
        subteams: {
            create: {
            subteam: {
                connect: { id: softwareTeam.id },
            },
            preferenceOrder: 1,
            },
        },
        },
    });

    await prisma.applicant.create({
        data: {
        name: 'Bob Smith',
        email: 'bob@example.com',
        phone: '555-0124',
        major: 'Electrical Engineering',
        classification: 'Sophomore',
        gradSem: 'Summer',
        gradYear: 2026,
        status: Status.INTERVIEWING,
        applications: {
            create: {
            generalResponses: {
                whyJoin: 'Want to gain hands-on experience',
                experience: 'Internship at Tesla',
            },
            subteamApps: {
                create: [
                {
                    responses: {
                    technicalSkills: 'PCB Design, MATLAB',
                    projectExperience: 'Built a solar-powered charger',
                    },
                    subteam: {
                    connect: { id: electronicsTeam.id },
                    },
                },
                ],
            },
            },
        },
        subteams: {
            create: [
            {
                subteam: {
                connect: { id: electronicsTeam.id },
                },
                preferenceOrder: 1,
            },
            {
                subteam: {
                connect: { id: softwareTeam.id },
                },
                preferenceOrder: 2,
            },
            ],
        },
        interviews: {
            create: {
            date: new Date('2025-03-07T00:00:00Z'),
            time: "2:00 PM",
            location: 'Engineering Building Room 101',
            notes: 'Strong candidate, good technical background',
            subteam: Subteams.ELECTRONICS,
            admins: {
                create: {
                admin: {
                    connect: { id: admin.id },
                },
                },
            },
            },
        },
        },
    });

    await prisma.applicant.create({
        data: {
        name: 'John Manning',
        email: 'john@example.com',
        phone: '555-0124-123',
        major: 'Mechanical Engineering',
        classification: 'Sophomore',
        gradSem: 'Summer',
        gradYear: 2026,
        status: Status.INTERVIEWING,
        applications: {
            create: {
            generalResponses: {
                whyJoin: 'Want to gain hands-on experience',
                experience: 'Internship at Tesla',
            },
            subteamApps: {
                create: [
                {
                    responses: {
                    technicalSkills: 'PCB Design, MATLAB',
                    projectExperience: 'Built a solar-powered charger',
                    },
                    subteam: {
                    connect: { id: electronicsTeam.id },
                    },
                },
                ],
            },
            },
        },
        subteams: {
            create: [
            {
                subteam: {
                connect: { id: softwareTeam.id },
                },
                preferenceOrder: 1,
            },
            {
                subteam: {
                connect: { id: electronicsTeam.id },
                },
                preferenceOrder: 2,
            },
            ],
        },
        interviews: {
            create: {
            date: new Date('2025-03-08T00:00:00Z'),
            time: "3:00 PM",
            location: 'Engineering Building Room 102',
            notes: 'Good mechanical background, needs further review',
            subteam: Subteams.POWERTRAIN,
            admins: {
                create: {
                admin: {
                    connect: { id: admin.id },
                },
                },
            },
            },
        },
        },
    });

    console.log('Database has been seeded! 🌱');
    }

main()
.catch((e) => {
    console.error(e);
    process.exit(1);
})
.finally(async () => {
    await prisma.$disconnect();
});
