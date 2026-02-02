'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useContinueWatching, ContinueWatchingItem } from '@/hooks/useFeed';
import { PlayIcon, FilmIcon, TvIcon, ChevronLeftIcon, ChevronRightIcon } from '@/components/icons';

function ContinueWatchingCard({ item }: { item: ContinueWatchingItem }) {
    const href = item.mediaType === 'movie'
        ? `/movies/${item.mediaId}/watch`
        : `/series/${item.seriesId}/${item.mediaId}`;

    const TypeIcon = item.mediaType === 'movie' ? FilmIcon : TvIcon;

    const formatTimeLeft = () => {
        const secondsLeft = item.duration - item.timestamp;
        if (secondsLeft < 60) return `${Math.floor(secondsLeft)}s left`;
        const minutes = Math.floor(secondsLeft / 60);
        if (minutes < 60) return `${minutes}m left`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}m left` : `${hours}h left`;
    };

    return (
        <Link href={href} className="group flex-shrink-0">
            <div className="relative w-64 overflow-hidden rounded-lg bg-gray-800 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-violet-500/20">
                <div className="relative aspect-video">
                    <Image
                        src={item.backdropUrl || item.posterUrl}
                        alt={item.title}
                        fill
                        className="object-cover transition-all duration-300 group-hover:brightness-75"
                        sizes="256px"
                    />

                    <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                        <div className="rounded-full bg-violet-600/90 p-3">
                            <PlayIcon size={24} className="text-white" />
                        </div>
                    </div>

                    <div className="absolute left-2 top-2 flex items-center gap-1 rounded bg-black/70 px-2 py-1 text-xs text-white">
                        <TypeIcon size={12} />
                        <span className="capitalize">{item.mediaType === 'episode' ? 'Series' : 'Movie'}</span>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30">
                        <div
                            className="h-full bg-violet-500"
                            style={{ width: `${item.progress}%` }}
                        />
                    </div>
                </div>

                <div className="h-20 p-3">
                    <h3 className="truncate font-semibold text-white">{item.title}</h3>
                    <p className="h-5 truncate text-sm text-gray-400">{item.subtitle || '\u00A0'}</p>
                    <p className="mt-1 text-xs text-gray-500">{formatTimeLeft()}</p>
                </div>
            </div>
        </Link>
    );
}

export default function ContinueWatching() {
    const { items, isLoading } = useContinueWatching();
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const checkScrollability = useCallback(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        setCanScrollLeft(container.scrollLeft > 0);
        setCanScrollRight(
            container.scrollLeft < container.scrollWidth - container.clientWidth - 1
        );
    }, []);

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        checkScrollability();
        container.addEventListener('scroll', checkScrollability);
        window.addEventListener('resize', checkScrollability);

        return () => {
            container.removeEventListener('scroll', checkScrollability);
            window.removeEventListener('resize', checkScrollability);
        };
    }, [checkScrollability, items]);

    const scroll = (direction: 'left' | 'right') => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const cardWidth = 256 + 16;
        const scrollAmount = cardWidth * 2;

        container.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth'
        });
    };

    if (isLoading || items.length === 0) {
        return null;
    }

    return (
        <section className="group/section relative mb-8">
            <h2 className="mb-4 text-xl font-bold text-white">Continue Watching</h2>

            <div className="relative">
                {/* Left Arrow */}
                {canScrollLeft && (
                    <button
                        onClick={() => scroll('left')}
                        className="absolute -left-2 top-1/2 z-10 flex h-full -translate-y-1/2 items-center bg-gradient-to-r from-black/80 to-transparent pl-2 pr-4 opacity-0 transition-opacity group-hover/section:opacity-100"
                        aria-label="Scroll left"
                    >
                        <div className="rounded-full bg-white/20 p-2 backdrop-blur-sm transition-colors hover:bg-white/30">
                            <ChevronLeftIcon size={24} className="text-white" />
                        </div>
                    </button>
                )}

                {/* Scrollable Container */}
                <div
                    ref={scrollContainerRef}
                    className="scrollbar-hide -mx-4 flex gap-4 overflow-x-auto px-4 pb-4"
                >
                    {items.map((item) => (
                        <ContinueWatchingCard key={`${item.mediaType}-${item.mediaId}`} item={item} />
                    ))}
                </div>

                {/* Right Arrow */}
                {canScrollRight && (
                    <button
                        onClick={() => scroll('right')}
                        className="absolute -right-2 top-1/2 z-10 flex h-full -translate-y-1/2 items-center bg-gradient-to-l from-black/80 to-transparent pl-4 pr-2 opacity-0 transition-opacity group-hover/section:opacity-100"
                        aria-label="Scroll right"
                    >
                        <div className="rounded-full bg-white/20 p-2 backdrop-blur-sm transition-colors hover:bg-white/30">
                            <ChevronRightIcon size={24} className="text-white" />
                        </div>
                    </button>
                )}
            </div>
        </section>
    );
}
