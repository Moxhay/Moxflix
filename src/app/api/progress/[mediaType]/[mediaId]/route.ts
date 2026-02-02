import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/auth/session';
import { withMiddleware, withParamsValidation, withRateLimit, ApiRequest } from '@/lib/middleware';

const paramsSchema = z.object({
    mediaType: z.enum(['movie', 'episode']),
    mediaId: z.string().regex(/^\d+$/, 'ID must be a number')
});

async function getMediaProgressHandler(request: ApiRequest) {
    try {
        const userId = await getCurrentUserId();

        if (!userId) {
            return NextResponse.json({ data: null });
        }

        const { mediaType, mediaId } = request.routeParams;
        const id = parseInt(mediaId);

        const whereClause = mediaType === 'movie'
            ? { userId, movieId: id }
            : { userId, episodeId: id };

        const progress = await prisma.progress.findFirst({
            where: whereClause,
            select: {
                timestamp: true,
                duration: true,
                completed: true
            }
        });

        return NextResponse.json({ data: progress });
    } catch (error) {
        console.error('Get media progress error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export const GET = withMiddleware(getMediaProgressHandler, withRateLimit({ limit: 100 }), withParamsValidation(paramsSchema));
