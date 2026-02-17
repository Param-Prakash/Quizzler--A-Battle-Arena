import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const topic = searchParams.get('topic');

    const topics = await prisma.question.groupBy({
      by: ['topic'],
      _count: {
        topic: true,
      },
    });

    const formattedTopics = topics.map((t) => ({
      name: t.topic,
      count: t._count.topic,
    }));

    return NextResponse.json({ topics: formattedTopics });
  } catch (error) {
    console.error('Topics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
