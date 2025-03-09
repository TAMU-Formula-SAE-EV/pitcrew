import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const interviews = await prisma.interview.findMany({
      include: {
        applicant: { select: { name: true } },
        admins: { include: { admin: { select: { name: true, role: true } } } },
      },
    });

    const events = interviews.map((interview) => ({
      id: interview.id,
      date: interview.date, // full date (as DateTime)
      time: interview.time, // interview time as string (e.g., "10:00 AM")
      applicantId: interview.applicantId,
      applicant: interview.applicant.name,
      team: interview.subteam, // using "subteam" as team identifier
      room: interview.location,
      interviewers: interview.admins.map((item) => ({
        name: item.admin.name,
        role: item.admin.role,
      })),
    }));

    return NextResponse.json(events);
  } catch (error) {
    return NextResponse.json({ "error": error }, { status: 500 });
  }
}
