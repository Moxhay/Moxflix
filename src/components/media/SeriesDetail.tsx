'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useSeriesDetail, useContinueWatching } from '@/hooks/useFeed';
import { useAuth } from '@/providers/AuthProvider';
import HeroBackdrop from '@/components/media/HeroBackdrop';
import MediaPoster from '@/components/media/MediaPoster';
import MediaRating from '@/components/media/MediaRating';
import GenreBadges from '@/components/media/GenreBadges';
import SeasonsSection from '@/components/media/SeasonsSection';
import PlayButton from '@/components/media/PlayButton';

export default function SeriesDetail() {
    const params = useParams();
    const id = parseInt(params.id as string);
    const { data: series } = useSeriesDetail(id);
    const { user } = useAuth();
    const { items: continueWatchingItems } = useContinueWatching(!!user);

    const firstEpisode = series.seasons[0]?.episodes[0];

    const continueEpisode = continueWatchingItems.find(
        (item) => item.mediaType === 'episode' && item.seriesId === id
    );

    const continueLabel = continueEpisode ? `Continue ${continueEpisode.subtitle?.split(' - ')[0]}` : null;

    return (
        <>
            <HeroBackdrop imageUrl={series.backdropUrl || series.posterUrl} alt={series.title} />

            <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="-mt-48 flex flex-col gap-8 md:-mt-64 md:flex-row">
                    <MediaPoster src={series.posterUrl} alt={series.title} />

                    <div className="flex flex-1 flex-col pt-4">
                        <h1 className="mb-4 text-3xl font-bold text-white md:text-4xl lg:text-5xl">{series.title}</h1>

                        <div className="mb-4 flex flex-wrap items-center gap-4">
                            {series.rating && <MediaRating rating={series.rating} />}
                            <span className="text-gray-400">
                                {series.seasons.length} {series.seasons.length === 1 ? 'Season' : 'Seasons'}
                            </span>
                        </div>

                        <div className="mb-6">
                            <GenreBadges genres={series.genres} />
                        </div>

                        <p className="mb-8 max-w-3xl text-base leading-relaxed text-gray-300 md:text-lg">
                            {series.description}
                        </p>

                        {continueEpisode ? (
                            <Link href={`/series/${series.id}/${continueEpisode.mediaId}`}>
                                <PlayButton label={continueLabel!} />
                            </Link>
                        ) : firstEpisode ? (
                            <Link href={`/series/${series.id}/${firstEpisode.id}`}>
                                <PlayButton label="Play S1:E1" />
                            </Link>
                        ) : null}
                    </div>
                </div>

                <SeasonsSection seasons={series.seasons} seriesId={series.id} />
            </div>
        </>
    );
}
