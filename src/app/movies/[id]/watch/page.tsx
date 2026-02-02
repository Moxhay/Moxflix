'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { useMovieDetail } from '@/hooks/useFeed';
import VideoPlayer from '@/components/player/VideoPlayer';

function MoviePlayer() {
    const params = useParams();
    const id = parseInt(params.id as string);
    const { data: movie } = useMovieDetail(id);

    return <VideoPlayer src={movie.videoUrl} title={movie.title} subtitle="Movie" poster={movie.posterUrl} mediaType="movie" mediaId={id} />;
}

function MoviePlayerSkeleton() {
    return (
        <div className="flex h-full w-full items-center justify-center bg-black">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-violet-500 border-t-transparent" />
        </div>
    );
}

export default function MovieWatchPage() {
    return (
        <div className="h-screen pt-16">
            <Suspense fallback={<MoviePlayerSkeleton />}>
                <MoviePlayer />
            </Suspense>
        </div>
    );
}
