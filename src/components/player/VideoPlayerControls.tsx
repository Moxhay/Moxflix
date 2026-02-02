'use client';

import VideoPlayerProgressBar from './VideoPlayerProgressBar';
import VideoPlayerPlayButton from './VideoPlayerPlayButton';
import VideoPlayerVolumeControl from './VideoPlayerVolumeControl';
import VideoPlayerFullscreenButton from './VideoPlayerFullscreenButton';

interface VideoPlayerControlsProps {
    playing: boolean;
    progress: number;
    currentTime: number;
    duration: number;
    volume: number;
    muted: boolean;
    isFullscreen: boolean;
    onPlayPause: () => void;
    onSeek: (percent: number) => void;
    onVolumeChange: (volume: number) => void;
    onToggleMute: () => void;
    onFullscreen: () => void;
    formatTime: (seconds: number) => string;
    showEpisodesButton?: boolean;
    onToggleEpisodes?: () => void;
}

export default function VideoPlayerControls({
    playing,
    progress,
    currentTime,
    duration,
    volume,
    muted,
    isFullscreen,
    onPlayPause,
    onSeek,
    onVolumeChange,
    onToggleMute,
    onFullscreen,
    formatTime,
    showEpisodesButton,
    onToggleEpisodes
}: VideoPlayerControlsProps) {
    return (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-4 pt-20 pb-4">
            <VideoPlayerProgressBar progress={progress} onSeek={onSeek} />

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <VideoPlayerPlayButton playing={playing} onPlayPause={onPlayPause} />
                    <VideoPlayerVolumeControl
                        volume={volume}
                        muted={muted}
                        onVolumeChange={onVolumeChange}
                        onToggleMute={onToggleMute}
                    />
                    <span className="text-sm text-white">
                        {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    {showEpisodesButton && onToggleEpisodes && (
                        <button
                            onClick={onToggleEpisodes}
                            className="flex items-center gap-2 rounded-md bg-white/10 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-white/20"
                            aria-label="Show episodes"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                                />
                            </svg>
                            Episodes
                        </button>
                    )}
                    <VideoPlayerFullscreenButton isFullscreen={isFullscreen} onFullscreen={onFullscreen} />
                </div>
            </div>
        </div>
    );
}
