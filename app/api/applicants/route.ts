import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { Status, Subteams } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.getAll('status').filter((s): s is Status => Object.values(Status).includes(s as Status));
  const subteams = searchParams.getAll('subteam').filter((s): s is Subteams => Object.values(Subteams).includes(s as Subteams));

  try {
    const applicants = await prisma.applicant.findMany({
      where: {
        AND: [
          status.length > 0 ? { status: { in: status } } : {},
          subteams.length > 0 ? {
            subteams: {
              some: {
                subteam: {
                  name: {
                    in: subteams
                  }
                }
              }
            }
          } : {}
        ]
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(applicants);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch applicants' }, { status: 500 });
  }
}