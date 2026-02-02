'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMovieDetail } from '@/hooks/useFeed';
import HeroBackdrop from '@/components/media/HeroBackdrop';
import MediaPoster from '@/components/media/MediaPoster';
import MediaRating from '@/components/media/MediaRating';
import GenreBadges from '@/components/media/GenreBadges';
import PlayButton from '@/components/media/PlayButton';

export default function MovieDetail() {
    const params = useParams();
    const id = parseInt(params.id as string);
    const { data: movie } = useMovieDetail(id);

    return (
        <>
            <HeroBackdrop imageUrl={movie.backdropUrl || movie.posterUrl} alt={movie.title} />

            <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="-mt-48 flex flex-col gap-8 md:-mt-64 md:flex-row">
                    <MediaPoster src={movie.posterUrl} alt={movie.title} />

                    <div className="flex flex-1 flex-col pt-4">
                        <h1 className="mb-4 text-3xl font-bold text-white md:text-4xl lg:text-5xl">{movie.title}</h1>

                        <div className="mb-4 flex flex-wrap items-center gap-4">
                            {movie.rating && <MediaRating rating={movie.rating} />}
                        </div>

                        <div className="mb-6">
                            <GenreBadges genres={movie.genres} />
                        </div>

                        <p className="mb-8 max-w-3xl text-base leading-relaxed text-gray-300 md:text-lg">
                            {movie.description}
                        </p>

                        <Link href={`/movies/${movie.id}/watch`}>
                            <PlayButton />
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
