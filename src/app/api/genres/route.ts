import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { withMiddleware, withRateLimit, withValidation, ApiRequest } from '@/lib/middleware';

const querySchema = z.object({
    type: z.enum(['movies', 'series']).optional()
});

async function getGenresHandler(request: ApiRequest) {
    try {
        const { type } = request.query as z.infer<typeof querySchema>;

        const where = type ? { type } : undefined;

        const genres = await prisma.genre.findMany({
            where,
            orderBy: { name: 'asc' },
            select: {
                id: true,
                name: true,
                type: true
            }
        });

        return NextResponse.json({ data: genres });
    } catch (error) {
        console.error('Get genres error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export const GET = withMiddleware(getGenresHandler, withRateLimit({ limit: 100 }), withValidation(querySchema));
