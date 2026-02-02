import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { withMiddleware, withParamsValidation, withRateLimit, ApiRequest } from '@/lib/middleware';

const paramsSchema = z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a number')
});

async function getSeriesByIdHandler(request: ApiRequest) {
    try {
        const seriesId = parseInt(request.routeParams.id);

        const series = await prisma.series.findUnique({
            where: { id: seriesId },
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
                },
                seasons: {
                    orderBy: { number: 'asc' },
                    select: {
                        id: true,
                        number: true,
                        name: true,
                        episodes: {
                            orderBy: { episodeNumber: 'asc' },
                            select: {
                                id: true,
                                title: true,
                                episodeNumber: true,
                                duration: true
                            }
                        }
                    }
                }
            }
        });

        if (!series) {
            return NextResponse.json({ error: 'Series not found' }, { status: 404 });
        }

        return NextResponse.json({ data: series });
    } catch (error) {
        console.error('Get series by ID error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export const GET = withMiddleware(getSeriesByIdHandler, withRateLimit({ limit: 100 }), withParamsValidation(paramsSchema));
