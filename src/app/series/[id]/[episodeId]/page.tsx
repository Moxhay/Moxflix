'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { useEpisode, useSeriesDetail } from '@/hooks/useFeed';
import VideoPlayer from '@/components/player/VideoPlayer';

function EpisodePlayer() {
    const params = useParams();
    const seriesId = parseInt(params.id as string);
    const episodeId = parseInt(params.episodeId as string);

    const { data } = useEpisode(seriesId, episodeId);
    const { data: seriesData } = useSeriesDetail(seriesId);

    const seriesNavigation = {
        seriesId: seriesData.id,
        seriesTitle: seriesData.title,
        currentEpisodeId: episodeId,
        currentSeasonNumber: data.season.number,
        seasons: seriesData.seasons
    };

    return (
        <VideoPlayer
            src={data.episode.videoUrl}
            title={data.series.title}
            subtitle={`S${data.season.number}:E${data.episode.episodeNumber} - ${data.episode.title}`}
            poster={seriesData.posterUrl}
            seriesNavigation={seriesNavigation}
            mediaType="episode"
            mediaId={episodeId}
        />
    );
}

function EpisodePlayerSkeleton() {
    return (
        <div className="flex h-full w-full items-center justify-center bg-black">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-violet-500 border-t-transparent" />
        </div>
    );
}

export default function EpisodeWatchPage() {
    return (
        <div className="h-screen pt-16">
            <Suspense fallback={<EpisodePlayerSkeleton />}>
                <EpisodePlayer />
            </Suspense>
        </div>
    );
}
