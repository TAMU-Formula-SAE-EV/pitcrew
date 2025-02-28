import { prisma } from "@/lib/prisma";
import { getSubteamEnum } from "@/utils/utils";
import { NextRequest, NextResponse } from "next/server";
import { Subteams } from '@prisma/client';

interface SubteamDetails {
    preferenceOrder: number;
    [key: string]: string | number;
}

interface SubteamsApplied {
    [subteamName: string]: SubteamDetails;
}

export async function POST(req: NextRequest) {
    try {
        const requestData = await req.json();

        const {
            applicantId,
            phone,
            major,
            classification,
            grad_sem: gradSem,
            grad_year: gradYear,
            generalResponses,
            subteamsApplied,
            resume
        } = requestData;

        if (!applicantId) {
            return NextResponse.json({ error: "Missing applicantId" }, { status: 400 });
        }

        const gradYearInt = gradYear ? parseInt(gradYear, 10) : null;
        const resumeUrl = resume?.name || null;

        // fetch subteam IDs based on their names and create mapping
        const subteamNames = Object.keys(subteamsApplied);
        const subteams = await prisma.subteam.findMany({
            where: {
                name: {
                    in: subteamNames.map(name => getSubteamEnum(name) as Subteams)
                }
            },
            select: {
                id: true,
                name: true
            }
        });

        const subteamIdMap = subteams.reduce((map, subteam) => {
            map[subteam.name] = subteam.id;
            return map;
        }, {} as Record<string, string>);

        await prisma.applicant.update({
            where: { id: applicantId },
            data: {
                // general applicant info
                phone,
                major,
                classification,
                gradSem,
                gradYear: gradYearInt,
                status: "APPLIED",
                applications: {
                    create: {
                        generalResponses,
                        resumeUrl,
                        // subteam-specific questions
                        subteamApps: {
                            create: Object.entries(subteamsApplied as SubteamsApplied).map(([subteam, details]) => {
                                const { preferenceOrder, ...responses } = details;
                                console.log(`Subteam Preference Order: ${preferenceOrder}, Responses:`, responses);

                                const subteamId = subteamIdMap[getSubteamEnum(subteam)];
                                if (!subteamId) {
                                    throw new Error(`Subteam ID not found for ${subteam}`);
                                }

                                return {
                                    responses,
                                    subteam: {
                                        connect: { id: subteamId }
                                    },
                                    fileUrls: []
                                };
                            })
                        }
                    }
                },
                // saving subteam preference order
                subteams: {
                    create: Object.entries(subteamsApplied as SubteamsApplied).map(([subteam, details]) => {
                        console.log(`Adding preference order ${details.preferenceOrder} for subteam ${subteam}`);
                        const subteamId = subteamIdMap[getSubteamEnum(subteam)];
                        if (!subteamId) {
                            throw new Error(`Subteam ID not found for ${subteam}`);
                        }

                        return {
                            preferenceOrder: details.preferenceOrder,
                            subteam: {
                                connect: { id: subteamId }
                            }
                        };
                    })
                }
            }
        });

        // retrieve submitted application
        const latestApplication = await prisma.application.findFirst({
            where: { applicantId },
            orderBy: { createdAt: 'desc' },
            include: {
                subteamApps: {
                    include: {
                        subteam: true
                    }
                }
            }
        });

        return NextResponse.json({ success: true, application: latestApplication }, { status: 200 })
    } catch (e) {
        return NextResponse.json({ error: e instanceof Error ? e.message : "Internal server error" }, { status: 500 });
    }
}