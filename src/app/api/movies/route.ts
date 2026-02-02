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

async function getMoviesHandler(request: ApiRequest) {
    try {
        const { cursor, limit, genre, search } = request.query as z.infer<typeof querySchema>;

        const where: Record<string, unknown> = {};
        if (genre) {
            where.genres = { some: { id: genre } };
        }
        if (search) {
            where.title = { contains: search, mode: 'insensitive' };
        }

        const movies = await prisma.movie.findMany({
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

        const hasMore = movies.length > limit;
        const data = hasMore ? movies.slice(0, -1) : movies;
        const nextCursor = hasMore ? data[data.length - 1]?.id.toString() : null;

        return NextResponse.json({ data, nextCursor, hasMore });
    } catch (error) {
        console.error('Get movies error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export const GET = withMiddleware(getMoviesHandler, withRateLimit({ limit: 100 }), withValidation(querySchema));
