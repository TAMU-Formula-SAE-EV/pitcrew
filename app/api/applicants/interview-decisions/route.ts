import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DecisionType } from '@prisma/client';

export async function POST(request: NextRequest) {
    try {
        // Parse request body
        const body = await request.json();
        const { email, commenter, comment, decision } = body;

        if (!email || !commenter || !comment || !decision) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Find the applicant
        const applicant = await prisma.applicant.findUnique({
            where: {
                email: email
            }
        });

        if (!applicant) {
            return NextResponse.json(
                { error: 'Applicant not found' },
                { status: 404 }
            );
        }

        // Map frontend decision type to database DecisionType
        let decisionType;
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

        // Create the interview decision
        const interviewDecision = await prisma.interviewDecision.create({
            data: {
                type: decisionType as DecisionType,
                comment,
                commenter,
                applicant: {
                    connect: {
                        id: applicant.id
                    }
                }
            }
        });

        return NextResponse.json({
            success: true,
            data: interviewDecision
        });
    } catch (error) {
        console.error('Error creating interview decision:', error);
        return NextResponse.json(
            { error: 'Failed to create interview decision' },
            { status: 500 }
        );
    }
}