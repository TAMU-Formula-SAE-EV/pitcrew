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

// TO-DO: Make this generalized, it only creates a new user with "name", "email", and "phone" rn
export async function POST(
    request: NextRequest,
    { params }: { params: { email: string, name: string, phone: string, starred: boolean } }
) {
    try { 
        const { email, name, phone, starred } = await request.json();

        const newApplicant = await prisma.applicant.create({
            data: { email: email, name: name, phone: phone, starred: starred }
        });

        return NextResponse.json(newApplicant);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to create applicant' },
            { status: 500 }
        );
    }
}

// TO-DO: Make this generalized, it only updates "starred" rn
export async function PATCH(
    request: NextRequest,
    { params }: { params: { email: string, starred: boolean } }
) {
    try {
        const { starred } = await request.json();

        const updatedApplicant = await prisma.applicant.update({
            where: { email: params.email },
            data: { starred },
        });

        return NextResponse.json(updatedApplicant);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to update status' },
            { status: 500 }
        );
    }
}