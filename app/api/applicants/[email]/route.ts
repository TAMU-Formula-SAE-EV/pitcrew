import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: { email: string } }
) {
    try {
        const applicant = await prisma.applicant.findUnique({
            where: {
                email: params.email
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
                interviews: true
            }
        });

        if (!applicant) {
            return NextResponse.json(
                { error: 'Applicant not found' }, 
                { status: 404 }
            );
        }

        return NextResponse.json(applicant);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch applicant' }, 
            { status: 500 }
        );
    }
}