import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {

        const { selectedDate: date, selectedTime: time, location, subteam, applicantId } = await req.json();
        await prisma.interview.create({
            data: {
                date,
                time,
                location,
                subteam,
                applicantId,
            },
        });

        return NextResponse.json({ success: true }, { status: 200 });

    } catch (e) {
        return NextResponse.json({ error: e }, { status: 500 });
    }
}