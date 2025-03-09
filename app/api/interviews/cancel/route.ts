import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const { applicantId } = await req.json();
        if (!applicantId) {
            return NextResponse.json({ error: 'Applicant ID is required' }, { status: 400 });
        }

        // find interview associated with the applicant
        const interview = await prisma.interview.findUnique({
            where: { applicantId },
            include: { admins: true },
        });

        if (!interview) {
            return NextResponse.json({ error: 'Interview not found' }, { status: 404 });
        }

        // create a canceled interview object mimicking the original interview
        await prisma.canceledInterview.create({
            data: {
                date: interview.date,
                time: interview.time,
                location: interview.location,
                notes: interview.notes,
                subteam: interview.subteam,
                applicant: {
                    connect: { id: applicantId }
                }
            }
        });

        // delete InterviewAdmin records associated with this interview
        await prisma.interviewAdmin.deleteMany({
            where: { interviewId: interview.id },
        });
    
        // delete original interview object
        await prisma.interview.delete({
            where: { id: interview.id },
        });

        return NextResponse.json({ message: 'Interview deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting InterviewAdmin:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
