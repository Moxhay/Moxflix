'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MediaItem } from '@/types/media';
import { ChevronLeftIcon, ChevronRightIcon, StarIcon } from '@/components/icons';

interface HeroSliderProps {
    items: MediaItem[];
}

export default function HeroSlider({ items }: HeroSliderProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    const nextSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % items.length);
    }, [items.length]);

    const prevSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    }, [items.length]);

    useEffect(() => {
        if (!isAutoPlaying || items.length <= 1) return;

        const interval = setInterval(nextSlide, 5000);
        return () => clearInterval(interval);
    }, [isAutoPlaying, nextSlide, items.length]);

    if (items.length === 0) return null;

    const currentItem = items[currentIndex];
    const detailPath = currentItem.mediaType === 'movie' ? `/movies/${currentItem.id}` : `/series/${currentItem.id}`;

    return (
        <section
            className="relative h-[70vh] w-full overflow-hidden"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
        >
            {/* Images - all stacked, transition with opacity */}
            {items.map((item, idx) => {
                const imageUrl = item.backdropUrl || item.posterUrl;
                return (
                    <div
                        key={item.id}
                        className={`absolute inset-0 transition-opacity duration-700 ${
                            idx === currentIndex ? 'opacity-100' : 'opacity-0'
                        }`}
                    >
                        <Image
                            src={imageUrl}
                            alt={item.title}
                            fill
                            className="object-cover"
                            priority={idx <= 2}
                            sizes="100vw"
                        />
                    </div>
                );
            })}

            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
                <div className="max-w-2xl">
                    <span className="mb-2 inline-block rounded bg-gradient-to-r from-violet-500 to-purple-700 px-3 py-1 text-xs font-semibold uppercase text-white">
                        {currentItem.mediaType === 'movie' ? 'Movie' : 'Series'}
                    </span>
                    <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl">{currentItem.title}</h1>
                    <div className="mb-4 flex items-center gap-4">
                        {currentItem.rating && (
                            <span className="flex items-center gap-1 text-yellow-400">
                                <StarIcon size={16} />
                                {currentItem.rating.toFixed(1)}
                            </span>
                        )}
                        <span className="text-gray-300">{currentItem.genres.slice(0, 3).map((g) => g.name).join(' | ')}</span>
                    </div>
                    <p className="mb-6 line-clamp-3 text-gray-300">{currentItem.description}</p>
                    <Link
                        href={detailPath}
                        className="inline-block rounded-full bg-gradient-to-r from-violet-500 to-purple-700 px-8 py-3 font-semibold text-white transition-all hover:from-violet-600 hover:to-purple-800"
                    >
                        View Details
                    </Link>
                </div>
            </div>

            {/* Navigation arrows */}
            {items.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-all hover:bg-black/80"
                        aria-label="Previous slide"
                    >
                        <ChevronLeftIcon size={24} />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-all hover:bg-black/80"
                        aria-label="Next slide"
                    >
                        <ChevronRightIcon size={24} />
                    </button>
                </>
            )}

            {/* Dot indicators */}
            <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
                {items.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`h-2 rounded-full transition-all ${
                            index === currentIndex ? 'w-8 bg-violet-500' : 'w-2 bg-gray-500 hover:bg-gray-400'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </section>
    );
}
