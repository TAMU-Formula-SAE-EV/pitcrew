import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DecisionType, Subteams } from '@prisma/client';
import { reverseFormatSubteamName } from '@/utils/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, commenter, comment, decision, selectedSubteam } = body;
    if (!email || !commenter || !comment || !decision || ((decision === 'accept' || decision === 'override') && !selectedSubteam)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    const properSubteam = reverseFormatSubteamName(selectedSubteam) as Subteams;
    console.log('Update API: subteam:', properSubteam);

    const applicant = await prisma.applicant.findUnique({ where: { email } });
    if (!applicant) {
      return NextResponse.json(
        { error: 'Applicant not found' },
        { status: 404 }
      );
    }

    let decisionType: DecisionType;
    switch (decision) {
      case 'accept':
        decisionType = 'ACCEPTED';
        break;
      case 'reject':
        decisionType = 'REJECTED';
        break;
      case 'comment':
        decisionType = 'NEUTRAL';
        break;
      case 'override':
        decisionType = 'OVERRIDE';
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid decision type' },
          { status: 400 }
        );
    }

    // create interview decision
    let interviewDecision = await prisma.interviewDecision.create({
      data: {
        type: decisionType,
        comment,
        commenter,
        subteam: (decisionType === 'ACCEPTED' || decisionType === 'OVERRIDE') ? properSubteam : Subteams.NULL,
        applicant: { connect: { id: applicant.id } },
      },
    });

    // update applicant status as needed
    if (decisionType === 'OVERRIDE') {
      await prisma.applicant.update({
        where: { id: applicant.id },
        data: { status: 'INTERVIEWING' },
      });
    } else if (decisionType === 'ACCEPTED') {
      const acceptanceCount = await prisma.interviewDecision.count({
        where: {
          applicantId: applicant.id,
          subteam: { equals: properSubteam },
          type: 'ACCEPTED',
        },
      });
      if (acceptanceCount >= 3) {
        await prisma.applicant.update({
          where: { id: applicant.id },
          data: { selectedSubteam, status: 'INTERVIEWING' },
        });
      }
    }

    // the Prisma middleware will send a NOTIFY event upon updating the applicant

    return NextResponse.json({ success: true, data: interviewDecision });
  } catch (error) {
    console.error('Update API Error:', error);
    return NextResponse.json({ error: 'Failed to update applicant' }, { status: 500 });
  }
}