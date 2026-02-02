'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MediaItem } from '@/types/media';
import { HeartIcon, FilmIcon, TvIcon, StarIcon } from '@/components/icons';
import { useFavorites } from '@/providers/FavoritesProvider';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';
import { useProgress } from '@/providers/ProgressProvider';

interface MediaCardProps {
    item: MediaItem;
    progress?: number;
}

export default function MediaCard({ item, progress: propProgress }: MediaCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const { user } = useAuth();
    const { isFavorite, toggleFavorite } = useFavorites();
    const { showToast } = useToast();
    const { getMovieProgress } = useProgress();

    const progress = item.mediaType === 'movie'
        ? (propProgress ?? getMovieProgress(item.id))
        : undefined;

    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            showToast('Sign in to save favorites', 'error');
            return;
        }

        toggleFavorite(item.mediaType, item.id);
    };

    const isItemFavorite = isFavorite(item.mediaType, item.id);

    const detailPath = item.mediaType === 'movie' ? `/movies/${item.id}` : `/series/${item.id}`;
    const TypeIcon = item.mediaType === 'movie' ? FilmIcon : TvIcon;

    return (
        <Link href={detailPath}>
            <div
                className="group relative aspect-[2/3] cursor-pointer overflow-hidden rounded-lg bg-gray-800 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-violet-500/20"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <Image
                    src={item.posterUrl}
                    alt={item.title}
                    fill
                    className="object-cover transition-all duration-300 group-hover:brightness-50"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                />

                <div className="absolute left-2 top-2 flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 text-sm text-white">
                    <TypeIcon size={16} />
                    <span className="capitalize">{item.mediaType}</span>
                </div>

                <button
                    onClick={handleFavoriteClick}
                    className={`absolute right-2 top-2 z-10 rounded-full bg-black/70 p-2.5 transition-colors hover:bg-black/90 ${
                        isItemFavorite ? 'text-red-500' : 'text-white/70 hover:text-white'
                    }`}
                >
                    <HeartIcon size={18} />
                </button>

                {progress !== undefined && progress > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30">
                        <div
                            className="h-full bg-violet-500 transition-all"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                    </div>
                )}

                <div
                    className={`absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black via-black/80 to-transparent p-4 transition-all duration-300 ${
                        isHovered ? 'opacity-100' : 'pointer-events-none opacity-0'
                    }`}
                >
                    <h3 className="mb-2 line-clamp-2 text-lg font-bold text-white">{item.title}</h3>

                    {item.rating && (
                        <div className="mb-2 flex items-center gap-1 text-yellow-400">
                            <StarIcon size={14} />
                            <span className="text-sm font-semibold">{item.rating.toFixed(1)}</span>
                        </div>
                    )}

                    <p className="mb-3 line-clamp-3 text-xs text-gray-300">{item.description}</p>

                    <div className="flex flex-wrap gap-1">
                        {item.genres.slice(0, 3).map((genre) => (
                            <span key={genre.id} className="rounded bg-violet-500/30 px-2 py-0.5 text-[10px] text-violet-200">
                                {genre.name}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </Link>
    );
}
