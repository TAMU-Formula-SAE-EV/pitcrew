import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: { email: string } }
) {
    try {
        const param = await params; // hacky nextjs bug fix about params needing to be awaited
        const email = param.email;
        const applicant = await prisma.applicant.findUnique({
            where: {
                email: email
            },
            include: {
                applications: {
                    include: {
                        subteamApps: {
                            include: {
                                subteam: true
                            }
                        }
                    }
                },
                subteams: {
                    include: {
                        subteam: true
                    }
                },
                interviews: true,
                interviewDecisions: true
            }
        });

        if (!applicant) {
            return NextResponse.json(
                { error: 'Applicant not found' }, 
                { status: 404 }
            );
        }

        const acceptedDecisions = applicant.interviewDecisions.filter(
            decision => decision.type === 'ACCEPTED'
        ).length;

        const response = {
            ...applicant,
            approvalCount: acceptedDecisions
        };

        return NextResponse.json(response);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch applicant' }, 
            { status: 500 }
        );
    }
}