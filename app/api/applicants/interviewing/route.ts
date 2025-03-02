import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const interviewingApplicants = await prisma.applicant.findMany({
      where: {
        status: "INTERVIEWING",
      },
      select: {
        name: true,
        email: true,
      }
    });
    
    return NextResponse.json(interviewingApplicants);
  } catch (error) {
    console.error('Error fetching interviewing applicants:', error);
    return NextResponse.json({ error: 'Failed to fetch interviewing applicants' }, { status: 500 });
  }
}