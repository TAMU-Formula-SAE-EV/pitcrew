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
    const softwareTeam = await prisma.subteam.create({
        data: {
            name: Subteams.SOFTWARE,
            description: 'Vehicle software and embedded systems'
        }
    })

    const electricalTeam = await prisma.subteam.create({
        data: {
            name: Subteams.ELECTRONICS,
            description: 'Power systems and electronics'
        }
    })

    // create an admin
    const admin = await prisma.admin.create({
        data: {
            name: 'John Doe',
            email: 'john@example.com',
            phone: '123-456-7890',
            role: AdminRole.LEAD,
            subteams: {
                connect: { id: softwareTeam.id }
            }
        }
    })

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
                        experience: '2 years of programming experience'
                    },
                    subteamApps: {
                        create: {
                            responses: {
                                technicalSkills: 'Python, C++, JavaScript',
                                projectExperience: 'Built a robot in freshman year'
                            },
                            subteam: {
                                connect: { id: softwareTeam.id }
                            }
                        }
                    }
                }
            },
            subteams: {
                create: {
                    subteam: {
                        connect: { id: softwareTeam.id }
                    },
                    preferenceOrder: 1
                }
            }
        }
    })

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
                        experience: 'Internship at Tesla'
                    },
                    subteamApps: {
                        create: [
                            {
                                responses: {
                                    technicalSkills: 'PCB Design, MATLAB',
                                    projectExperience: 'Built a solar-powered charger'
                                },
                                subteam: {
                                    connect: { id: electricalTeam.id }
                                }
                            }
                        ]
                    }
                }
            },
            subteams: {
                create: [
                    {
                        subteam: {
                            connect: { id: electricalTeam.id }
                        },
                        preferenceOrder: 1
                    },
                    {
                        subteam: {
                            connect: { id: softwareTeam.id }
                        },
                        preferenceOrder: 2
                    }
                ]
            },
            interviews: {
                create: {
                    day: new Date('2024-02-15T14:00:00Z'),
                    location: 'Engineering Building Room 101',
                    notes: 'Strong candidate, good technical background',
                    admins: {
                        create: {
                            admin: {
                                connect: { id: admin.id }
                            }
                        }
                    }
                }
            }
        }
    })

    await prisma.applicant.create({
        data: {
            name: 'John Manning',
            email: 'john@example.com',
            phone: '555-0124-123',
            major: 'Mechanical Engineering',
            classification: 'Sophomore',
            gradSem: 'Summer',
            gradYear: 2026,
            status: Status.APPLIED,
            applications: {
                create: {
                    generalResponses: {
                        whyJoin: 'Want to gain hands-on experience',
                        experience: 'Internship at Tesla'
                    },
                    subteamApps: {
                        create: [
                            {
                                responses: {
                                    technicalSkills: 'PCB Design, MATLAB',
                                    projectExperience: 'Built a solar-powered charger'
                                },
                                subteam: {
                                    connect: { id: electricalTeam.id }
                                }
                            }
                        ]
                    }
                }
            },
            subteams: {
                create: [
                    {
                        subteam: {
                            connect: { id: softwareTeam.id }
                        },
                        preferenceOrder: 1
                    },
                    {
                        subteam: {
                            connect: { id: electricalTeam.id }
                        },
                        preferenceOrder: 2
                    }
                ]
            },
        }
    })

    console.log('Database has been seeded! 🌱')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    }
    )