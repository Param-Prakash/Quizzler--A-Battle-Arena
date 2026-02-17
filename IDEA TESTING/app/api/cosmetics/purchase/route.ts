import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { cosmeticId } = body;

    // Get user and cosmetic
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    const cosmetic = await prisma.cosmetic.findUnique({
      where: { id: cosmeticId },
    });

    if (!user || !cosmetic) {
      return NextResponse.json(
        { error: 'User or cosmetic not found' },
        { status: 404 }
      );
    }

    // Check if user has enough coins
    if (user.coins < cosmetic.coinCost) {
      return NextResponse.json(
        { error: 'Not enough coins' },
        { status: 400 }
      );
    }

    // Check if user already owns this cosmetic
    const existing = await prisma.userCosmetic.findUnique({
      where: {
        userId_cosmeticId: {
          userId: user.id,
          cosmeticId: cosmetic.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Already owned' },
        { status: 400 }
      );
    }

    // Purchase cosmetic
    const [userCosmetic, updatedUser] = await prisma.$transaction([
      prisma.userCosmetic.create({
        data: {
          userId: user.id,
          cosmeticId: cosmetic.id,
        },
        include: {
          cosmetic: true,
        },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: {
          coins: { decrement: cosmetic.coinCost },
        },
      }),
    ]);

    return NextResponse.json({
      message: 'Cosmetic purchased successfully',
      userCosmetic,
      remainingCoins: updatedUser.coins,
    });
  } catch (error) {
    console.error('Purchase cosmetic error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
