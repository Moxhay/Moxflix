import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/auth/session';
import { withMiddleware, withRateLimit } from '@/lib/middleware';

async function getAllProgressHandler() {
    try {
        const userId = await getCurrentUserId();

        if (!userId) {
            return NextResponse.json({ data: [] });
        }

        const progress = await prisma.progress.findMany({
            where: {
                userId,
                completed: false
            },
            select: {
                movieId: true,
                episodeId: true,
                timestamp: true,
                duration: true
            }
        });

        const data = progress.map((p) => ({
            movieId: p.movieId,
            episodeId: p.episodeId,
            progress: Math.round((p.timestamp / p.duration) * 100)
        }));

        return NextResponse.json({ data });
    } catch (error) {
        console.error('Get all progress error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export const GET = withMiddleware(getAllProgressHandler, withRateLimit({ limit: 100 }));
