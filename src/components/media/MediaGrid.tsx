'use client';

import MediaCard from './MediaCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { MediaItem } from '@/types/media';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

interface MediaGridProps {
    items: MediaItem[];
    hasMore: boolean;
    isFetchingNextPage: boolean;
    onLoadMore: () => void;
    title?: string;
}

export default function MediaGrid({ items, hasMore, isFetchingNextPage, onLoadMore, title = 'Browse All' }: MediaGridProps) {
    const sentinelRef = useIntersectionObserver<HTMLDivElement>({
        rootMargin: '400px',
        onIntersect: () => {
            if (hasMore && !isFetchingNextPage) {
                onLoadMore();
            }
        }
    });

    return (
        <div className="px-4 py-8 md:px-8">
            <h2 className="mb-6 text-2xl font-bold text-white">{title}</h2>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {items.map((item, index) => (
                    <MediaCard key={`${item.mediaType}-${item.id}-${index}`} item={item} />
                ))}
            </div>

            {isFetchingNextPage && (
                <div className="mt-8 flex justify-center">
                    <LoadingSpinner />
                </div>
            )}

            {hasMore && <div ref={sentinelRef} className="h-20 w-full" />}

            {!hasMore && items.length > 0 && <div className="mt-8 text-center text-gray-400">You have reached the end</div>}
        </div>
    );
}
