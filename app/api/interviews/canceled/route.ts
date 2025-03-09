import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const canceledInterviews = await prisma.canceledInterview.findMany({
            include: {
                applicant: { select: { name: true } },
            },
        });

        const events = canceledInterviews.map((interview) => ({
            id: interview.id,
            date: interview.date,
            time: interview.time,
            applicantId: interview.applicantId,
            applicant: interview.applicant.name,
            team: interview.subteam,
            room: interview.location,
        }));

        return NextResponse.json(events);
    } catch (error) {
        return NextResponse.json({ "error": error }, { status: 500 });
    }
}