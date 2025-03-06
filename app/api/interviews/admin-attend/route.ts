import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const { interviewId, adminId } = await req.json();
        await prisma.interviewAdmin.create({
            data: {
                interviewId,
                adminId,
            },
        });
        
        return NextResponse.json({ success: true }, { status: 200 });

    } catch (e) {
        return NextResponse.json({ error: e }, { status: 500 });
    }
}