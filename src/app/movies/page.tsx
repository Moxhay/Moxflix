'use client';

import { Suspense } from 'react';
import MediaGrid from '@/components/media/MediaGrid';
import MediaGridSkeleton from '@/components/media/MediaGridSkeleton';
import { useMoviesFeed } from '@/hooks/useFeed';

function MoviesGrid() {
    const { items, fetchNextPage, hasNextPage, isFetchingNextPage } = useMoviesFeed(20);

    return (
        <MediaGrid
            items={items}
            hasMore={hasNextPage ?? false}
            isFetchingNextPage={isFetchingNextPage}
            onLoadMore={fetchNextPage}
            title="Movies"
        />
    );
}

export default function MoviesPage() {
    return (
        <div className="min-h-screen bg-black pt-20">
            <Suspense fallback={<MediaGridSkeleton />}>
                <MoviesGrid />
            </Suspense>
        </div>
    );
}
