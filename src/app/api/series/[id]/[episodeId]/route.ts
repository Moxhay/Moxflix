import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { withMiddleware, withParamsValidation, withRateLimit, ApiRequest } from '@/lib/middleware';

const paramsSchema = z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a number'),
    episodeId: z.string().regex(/^\d+$/, 'Episode ID must be a number')
});

async function getEpisodeHandler(request: ApiRequest) {
    try {
        const seriesId = parseInt(request.routeParams.id);
        const episodeId = parseInt(request.routeParams.episodeId);

        const episode = await prisma.episode.findUnique({
            where: { id: episodeId },
            include: {
                season: {
                    include: {
                        series: {
                            select: { id: true, title: true }
                        }
                    }
                }
            }
        });

        if (!episode || episode.season.seriesId !== seriesId) {
            return NextResponse.json({ error: 'Episode not found' }, { status: 404 });
        }

        const allEpisodes = await prisma.episode.findMany({
            where: {
                season: { seriesId }
            },
            include: {
                season: { select: { number: true } }
            },
            orderBy: [{ season: { number: 'asc' } }, { episodeNumber: 'asc' }]
        });

        const currentIndex = allEpisodes.findIndex((e) => e.id === episodeId);
        const previousEpisode = currentIndex > 0 ? allEpisodes[currentIndex - 1] : null;
        const nextEpisode = currentIndex < allEpisodes.length - 1 ? allEpisodes[currentIndex + 1] : null;

        return NextResponse.json({
            data: {
                series: { id: episode.season.series.id, title: episode.season.series.title },
                season: { number: episode.season.number },
                episode: {
                    id: episode.id,
                    title: episode.title,
                    episodeNumber: episode.episodeNumber,
                    videoUrl: episode.videoUrl,
                    duration: episode.duration
                },
                navigation: {
                    previousId: previousEpisode?.id || null,
                    previousLabel: previousEpisode ? `S${previousEpisode.season.number}:E${previousEpisode.episodeNumber}` : null,
                    nextId: nextEpisode?.id || null,
                    nextLabel: nextEpisode ? `S${nextEpisode.season.number}:E${nextEpisode.episodeNumber}` : null
                }
            }
        });
    } catch (error) {
        console.error('Get episode error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export const GET = withMiddleware(getEpisodeHandler, withRateLimit({ limit: 100 }), withParamsValidation(paramsSchema));
