import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');

    const users = await prisma.user.findMany({
      take: limit,
      include: {
        stats: true,
      },
      orderBy: [
        { level: 'desc' },
        { xp: 'desc' },
      ],
    });

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      userId: user.id,
      username: user.username,
      level: user.level,
      avatar: user.avatar,
      stats: {
        totalWins: user.stats?.totalWins || 0,
        totalGamesPlayed: user.stats?.totalGamesPlayed || 0,
        winRate: user.stats?.totalGamesPlayed
          ? ((user.stats.totalWins / user.stats.totalGamesPlayed) * 100).toFixed(1)
          : '0',
      },
    }));

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
