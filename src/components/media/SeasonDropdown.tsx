'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ChevronDownIcon } from '@/components/icons';
import { useProgress } from '@/providers/ProgressProvider';

interface Episode {
    id: number;
    title: string;
    episodeNumber: number;
    duration: number | null;
}

interface Season {
    id: number;
    number: number;
    name: string;
    episodes: Episode[];
}

interface SeasonDropdownProps {
    season: Season;
    seriesId: number;
}

function EpisodeItem({ episode, seriesId }: { episode: Episode; seriesId: number }) {
    const { getEpisodeProgress } = useProgress();
    const progress = getEpisodeProgress(episode.id);

    const formatDuration = (minutes: number | null) => {
        if (!minutes) return '';
        const hrs = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hrs > 0) return `${hrs}h ${mins}m`;
        return `${mins}m`;
    };

    return (
        <Link
            href={`/series/${seriesId}/${episode.id}`}
            className="relative block overflow-hidden rounded-lg transition-colors hover:bg-violet-500/20"
        >
            <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-4">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500/30 text-sm font-medium text-violet-300">
                        {episode.episodeNumber}
                    </span>
                    <span className="text-white">{episode.title}</span>
                </div>
                {episode.duration && (
                    <span className="text-sm text-gray-400">{formatDuration(episode.duration)}</span>
                )}
            </div>
            {progress !== undefined && progress > 0 && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                    <div
                        className="h-full bg-violet-500"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                </div>
            )}
        </Link>
    );
}

function SeasonProgress({ episodes }: { episodes: Episode[] }) {
    const { getEpisodeProgress } = useProgress();

    const seasonProgress = useMemo(() => {
        if (episodes.length === 0) return 0;

        let totalProgress = 0;
        for (const episode of episodes) {
            const progress = getEpisodeProgress(episode.id);
            if (progress !== undefined) {
                totalProgress += progress;
            }
        }

        return Math.round(totalProgress / episodes.length);
    }, [episodes, getEpisodeProgress]);

    if (seasonProgress === 0) return null;

    return (
        <div className="flex items-center gap-2">
            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/20">
                <div
                    className="h-full rounded-full bg-violet-500 transition-all"
                    style={{ width: `${seasonProgress}%` }}
                />
            </div>
            <span className="text-xs text-violet-400">{seasonProgress}%</span>
        </div>
    );
}

export default function SeasonDropdown({ season, seriesId }: SeasonDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-gray-700 last:border-b-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between px-4 py-4 text-left transition-colors hover:bg-gray-800/50"
            >
                <div className="flex items-center gap-4">
                    <span className="text-lg font-semibold text-white">{season.name}</span>
                    <SeasonProgress episodes={season.episodes} />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">{season.episodes.length} episodes</span>
                    <ChevronDownIcon
                        size={20}
                        className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    />
                </div>
            </button>

            <div
                className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                }`}
            >
                <div className="space-y-1 bg-gray-900/50 px-4 py-2">
                    {season.episodes.map((episode) => (
                        <EpisodeItem key={episode.id} episode={episode} seriesId={seriesId} />
                    ))}
                </div>
            </div>
        </div>
    );
}
