'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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

interface VideoPlayerEpisodeSelectorProps {
    seriesId: number;
    seriesTitle: string;
    seasons: Season[];
    currentEpisodeId: number;
    currentSeasonNumber: number;
    isOpen: boolean;
    onClose: () => void;
}

export default function VideoPlayerEpisodeSelector({
    seriesId,
    seriesTitle,
    seasons,
    currentEpisodeId,
    currentSeasonNumber,
    isOpen,
    onClose
}: VideoPlayerEpisodeSelectorProps) {
    const router = useRouter();
    const [selectedSeason, setSelectedSeason] = useState(currentSeasonNumber);

    const currentSeason = seasons.find((s) => s.number === selectedSeason) || seasons[0];

    const formatDuration = (minutes: number | null) => {
        if (!minutes) return '';
        if (minutes < 60) return `${minutes}m`;
        const hrs = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
    };

    const handleEpisodeClick = (episodeId: number) => {
        router.push(`/series/${seriesId}/${episodeId}`);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative ml-auto flex h-full w-full max-w-md flex-col bg-gradient-to-l from-black via-black/95 to-transparent">
                <div className="flex items-center justify-between border-b border-white/10 p-4">
                    <div>
                        <h2 className="text-lg font-bold text-white">{seriesTitle}</h2>
                        <p className="text-sm text-gray-400">Episodes</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 transition hover:bg-white/10"
                        aria-label="Close"
                    >
                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="border-b border-white/10 px-4 py-4">
                    <div className="relative">
                        <select
                            value={selectedSeason}
                            onChange={(e) => setSelectedSeason(Number(e.target.value))}
                            className="w-full cursor-pointer appearance-none rounded-lg border border-white/10 bg-black/50 px-4 py-3 pr-10 text-sm font-medium text-white outline-none transition hover:border-violet-500/50 hover:bg-black/70 focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                            style={{ colorScheme: 'dark' }}
                        >
                            {seasons.map((season) => (
                                <option key={season.id} value={season.number}>
                                    Season {season.number}
                                </option>
                            ))}
                        </select>
                        <svg
                            className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-2">
                        {currentSeason?.episodes.map((episode) => {
                            const isCurrent = episode.id === currentEpisodeId;
                            return (
                                <button
                                    key={episode.id}
                                    onClick={() => !isCurrent && handleEpisodeClick(episode.id)}
                                    disabled={isCurrent}
                                    className={`group flex w-full items-start gap-4 rounded-lg p-3 text-left transition ${
                                        isCurrent
                                            ? 'bg-violet-600/30 ring-1 ring-violet-500'
                                            : 'hover:bg-white/10'
                                    }`}
                                >
                                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-white/10">
                                        {isCurrent ? (
                                            <svg className="h-5 w-5 text-violet-400" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M8 5v14l11-7z" />
                                            </svg>
                                        ) : (
                                            <span className="text-lg font-bold text-gray-400">{episode.episodeNumber}</span>
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-gray-400">
                                                E{episode.episodeNumber}
                                            </span>
                                            {isCurrent && (
                                                <span className="rounded bg-violet-600 px-1.5 py-0.5 text-xs font-medium text-white">
                                                    Playing
                                                </span>
                                            )}
                                        </div>
                                        <h3 className={`truncate font-medium ${isCurrent ? 'text-white' : 'text-gray-200'}`}>
                                            {episode.title}
                                        </h3>
                                        {episode.duration && (
                                            <span className="text-xs text-gray-500">{formatDuration(episode.duration)}</span>
                                        )}
                                    </div>

                                    {!isCurrent && (
                                        <svg
                                            className="h-5 w-5 flex-shrink-0 text-gray-500 opacity-0 transition group-hover:opacity-100"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
