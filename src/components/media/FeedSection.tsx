'use client';

import MediaGrid from './MediaGrid';
import { useMixedFeed } from '@/hooks/useFeed';

export default function FeedSection() {
    const { items, fetchNextPage, hasNextPage, isFetchingNextPage } = useMixedFeed(20);

    return (
        <MediaGrid
            items={items}
            hasMore={hasNextPage ?? false}
            isFetchingNextPage={isFetchingNextPage}
            onLoadMore={fetchNextPage}
        />
    );
}
