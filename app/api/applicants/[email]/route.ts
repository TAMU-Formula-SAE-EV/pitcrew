import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { email: string } }
) {
  try {
    // Fix for Next.js params bug
    const param = await params;
    const email = param.email;
    
    const applicant = await prisma.applicant.findUnique({
      where: { email },
      include: {
        applications: {
          include: {
            subteamApps: {
              include: { subteam: true }
            }
          }
        },
        subteams: { include: { subteam: true } },
        interview: true,
        interviewDecisions: true
      }
    });

    if (!applicant) {
      return NextResponse.json({ error: 'Applicant not found' }, { status: 404 });
    }

    const acceptedDecisions = applicant.interviewDecisions.filter(
      decision => decision.type === 'ACCEPTED'
    ).length;

    // For simplicity, assume one application per applicant
    const application = applicant.applications[0] || null;
    const allResponses = {
      candidateInfo: {
        name: applicant.name,
        email: applicant.email,
        phone: applicant.phone,
        major: applicant.major,
        classification: applicant.classification,
        gradSem: applicant.gradSem,
        gradYear: applicant.gradYear,
        resumeUrl: application?.resumeUrl || null,
      },
      generalResponses: application?.generalResponses || {},
      subteamApplications: application?.subteamApps?.map(app => ({
        subteam: app.subteam.name,
        responses: app.responses,
        fileUrls: app.fileUrls
      })) || []
    };

    const response = {
      ...applicant,
      approvalCount: acceptedDecisions,
      allResponses
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to fetch applicant: ${error}` },
      { status: 500 }
    );
  }
}
