import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const cosmetics = await prisma.cosmetic.findMany({
      orderBy: [
        { type: 'asc' },
        { coinCost: 'asc' },
      ],
    });

    return NextResponse.json({ cosmetics });
  } catch (error) {
    console.error('Cosmetics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
