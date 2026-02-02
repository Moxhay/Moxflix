import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/auth/session';
import { withMiddleware, withRateLimit, ApiRequest } from '@/lib/middleware';

const saveProgressSchema = z.object({
    mediaType: z.enum(['movie', 'episode']),
    mediaId: z.number(),
    timestamp: z.number(),
    duration: z.number()
});

async function getProgressHandler() {
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
            include: {
                movie: {
                    select: {
                        id: true,
                        title: true,
                        posterUrl: true,
                        backdropUrl: true
                    }
                },
                episode: {
                    select: {
                        id: true,
                        title: true,
                        episodeNumber: true,
                        season: {
                            select: {
                                number: true,
                                series: {
                                    select: {
                                        id: true,
                                        title: true,
                                        posterUrl: true,
                                        backdropUrl: true
                                    }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: { updatedAt: 'desc' },
            take: 10
        });

        const seenSeriesIds = new Set<number>();
        const data: Array<{
            id: number;
            mediaType: 'movie' | 'episode';
            mediaId: number;
            seriesId?: number;
            title: string;
            subtitle?: string;
            posterUrl: string;
            backdropUrl: string | null;
            timestamp: number;
            duration: number;
            progress: number;
            updatedAt: Date;
        }> = [];

        for (const p of progress) {
            if (p.movie) {
                data.push({
                    id: p.id,
                    mediaType: 'movie',
                    mediaId: p.movie.id,
                    title: p.movie.title,
                    posterUrl: p.movie.posterUrl,
                    backdropUrl: p.movie.backdropUrl,
                    timestamp: p.timestamp,
                    duration: p.duration,
                    progress: Math.round((p.timestamp / p.duration) * 100),
                    updatedAt: p.updatedAt
                });
            } else if (p.episode) {
                const seriesId = p.episode.season.series.id;
                if (seenSeriesIds.has(seriesId)) continue;
                seenSeriesIds.add(seriesId);

                data.push({
                    id: p.id,
                    mediaType: 'episode',
                    mediaId: p.episode.id,
                    seriesId,
                    title: p.episode.season.series.title,
                    subtitle: `S${p.episode.season.number}:E${p.episode.episodeNumber} - ${p.episode.title}`,
                    posterUrl: p.episode.season.series.posterUrl,
                    backdropUrl: p.episode.season.series.backdropUrl,
                    timestamp: p.timestamp,
                    duration: p.duration,
                    progress: Math.round((p.timestamp / p.duration) * 100),
                    updatedAt: p.updatedAt
                });
            }
        }

        return NextResponse.json({ data });
    } catch (error) {
        console.error('Get progress error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

async function saveProgressHandler(request: ApiRequest) {
    try {
        const userId = await getCurrentUserId();

        if (!userId) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const body = await request.json();
        const parsed = saveProgressSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: 'Invalid input', details: parsed.error.issues }, { status: 400 });
        }

        const { mediaType, mediaId, timestamp, duration } = parsed.data;

        const completed = (timestamp / duration) > 0.9;

        if (mediaType === 'movie') {
            await prisma.progress.upsert({
                where: {
                    userId_movieId: { userId, movieId: mediaId }
                },
                update: {
                    timestamp,
                    duration,
                    completed
                },
                create: {
                    userId,
                    movieId: mediaId,
                    timestamp,
                    duration,
                    completed
                }
            });
        } else {
            await prisma.progress.upsert({
                where: {
                    userId_episodeId: { userId, episodeId: mediaId }
                },
                update: {
                    timestamp,
                    duration,
                    completed
                },
                create: {
                    userId,
                    episodeId: mediaId,
                    timestamp,
                    duration,
                    completed
                }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Save progress error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export const GET = withMiddleware(getProgressHandler, withRateLimit({ limit: 100 }));
export const POST = withMiddleware(saveProgressHandler, withRateLimit({ limit: 200 }));
