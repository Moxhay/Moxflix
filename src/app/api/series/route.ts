import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { withMiddleware, withValidation, withRateLimit, ApiRequest } from '@/lib/middleware';

const DEFAULT_LIMIT = 20;

const querySchema = z.object({
    cursor: z.string().optional(),
    limit: z.coerce.number().min(1).max(50).optional().default(DEFAULT_LIMIT),
    genre: z.coerce.number().optional(),
    search: z.string().min(1).max(25).trim().optional()
});

async function getSeriesHandler(request: ApiRequest) {
    try {
        const { cursor, limit, genre, search } = request.query as z.infer<typeof querySchema>;

        const where: Record<string, unknown> = {};
        if (genre) {
            where.genres = { some: { id: genre } };
        }
        if (search) {
            where.title = { contains: search, mode: 'insensitive' };
        }

        const series = await prisma.series.findMany({
            where: Object.keys(where).length > 0 ? where : undefined,
            take: limit + 1,
            ...(cursor && {
                cursor: { id: parseInt(cursor) },
                skip: 1
            }),
            orderBy: { id: 'asc' },
            select: {
                id: true,
                title: true,
                description: true,
                posterUrl: true,
                backdropUrl: true,
                rating: true,
                genres: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        const hasMore = series.length > limit;
        const data = hasMore ? series.slice(0, -1) : series;
        const nextCursor = hasMore ? data[data.length - 1]?.id.toString() : null;

        return NextResponse.json({ data, nextCursor, hasMore });
    } catch (error) {
        console.error('Get series error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export const GET = withMiddleware(getSeriesHandler, withRateLimit({ limit: 100 }), withValidation(querySchema));
