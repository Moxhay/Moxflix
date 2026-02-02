import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/auth/session';
import { withMiddleware, withRateLimit, ApiRequest } from '@/lib/middleware';

const toggleSchema = z.object({
    mediaType: z.enum(['movie', 'series']),
    mediaId: z.number()
});

async function getFavoritesHandler(request: ApiRequest) {
    try {
        const userId = await getCurrentUserId();

        if (!userId) {
            return NextResponse.json({ data: [] });
        }

        const url = new URL(request.url);
        const detailed = url.searchParams.get('detailed') === 'true';

        if (detailed) {
            const favorites = await prisma.favorite.findMany({
                where: { userId },
                include: {
                    movie: { include: { genres: true } },
                    series: { include: { genres: true } }
                }
            });

            const data = favorites.map((fav) => {
                if (fav.movie) {
                    return {
                        id: fav.movie.id,
                        title: fav.movie.title,
                        description: fav.movie.description,
                        posterUrl: fav.movie.posterUrl,
                        backdropUrl: fav.movie.backdropUrl,
                        rating: fav.movie.rating,
                        genres: fav.movie.genres,
                        mediaType: 'movie' as const
                    };
                }
                return {
                    id: fav.series!.id,
                    title: fav.series!.title,
                    description: fav.series!.description,
                    posterUrl: fav.series!.posterUrl,
                    backdropUrl: fav.series!.backdropUrl,
                    rating: fav.series!.rating,
                    genres: fav.series!.genres,
                    mediaType: 'series' as const
                };
            });
            return NextResponse.json({ data });
        }

        const favorites = await prisma.favorite.findMany({
            where: { userId },
            select: {
                movieId: true,
                seriesId: true
            }
        });

        const data = favorites.map((fav) => ({
            mediaType: fav.movieId ? 'movie' : 'series',
            mediaId: fav.movieId || fav.seriesId
        }));

        return NextResponse.json({ data });
    } catch (error) {
        console.error('Get favorites error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

async function toggleFavoriteHandler(request: ApiRequest) {
    try {
        const userId = await getCurrentUserId();

        if (!userId) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const body = await request.json();
        const parsed = toggleSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: 'Invalid input', details: parsed.error.issues }, { status: 400 });
        }

        const { mediaType, mediaId } = parsed.data;

        const whereClause = mediaType === 'movie'
            ? { userId, movieId: mediaId }
            : { userId, seriesId: mediaId };

        const existing = await prisma.favorite.findFirst({ where: whereClause });

        if (existing) {
            await prisma.favorite.delete({ where: { id: existing.id } });
            return NextResponse.json({ isFavorite: false });
        }

        const createData = mediaType === 'movie'
            ? { userId, movieId: mediaId }
            : { userId, seriesId: mediaId };

        await prisma.favorite.create({ data: createData });
        return NextResponse.json({ isFavorite: true });
    } catch (error) {
        console.error('Toggle favorite error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export const GET = withMiddleware(getFavoritesHandler, withRateLimit({ limit: 100 }));
export const POST = withMiddleware(toggleFavoriteHandler, withRateLimit({ limit: 100 }));