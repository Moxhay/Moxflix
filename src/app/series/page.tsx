'use client';

import { Suspense } from 'react';
import MediaGrid from '@/components/media/MediaGrid';
import MediaGridSkeleton from '@/components/media/MediaGridSkeleton';
import { useSeriesFeed } from '@/hooks/useFeed';

function SeriesGrid() {
    const { items, fetchNextPage, hasNextPage, isFetchingNextPage } = useSeriesFeed(20);

    return (
        <MediaGrid
            items={items}
            hasMore={hasNextPage ?? false}
            isFetchingNextPage={isFetchingNextPage}
            onLoadMore={fetchNextPage}
            title="Series"
        />
    );
}

export default function SeriesPage() {
    return (
        <div className="min-h-screen bg-black pt-20">
            <Suspense fallback={<MediaGridSkeleton />}>
                <SeriesGrid />
            </Suspense>
        </div>
    );
}
