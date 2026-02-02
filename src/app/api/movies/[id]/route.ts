import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { withMiddleware, withParamsValidation, withRateLimit, ApiRequest } from '@/lib/middleware';

const paramsSchema = z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a number')
});

async function getMovieByIdHandler(request: ApiRequest) {
    try {
        const movieId = parseInt(request.routeParams.id);

        const movie = await prisma.movie.findUnique({
            where: { id: movieId },
            select: {
                id: true,
                title: true,
                description: true,
                posterUrl: true,
                backdropUrl: true,
                videoUrl: true,
                rating: true,
                genres: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        if (!movie) {
            return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
        }

        return NextResponse.json({ data: movie });
    } catch (error) {
        console.error('Get movie by ID error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export const GET = withMiddleware(getMovieByIdHandler, withRateLimit({ limit: 100 }), withParamsValidation(paramsSchema));
