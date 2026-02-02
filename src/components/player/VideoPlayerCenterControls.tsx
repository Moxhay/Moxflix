'use client';

import { PlayIcon, PauseIcon } from '@/components/icons';

interface VideoPlayerCenterControlsProps {
    playing: boolean;
    onPlayPause: () => void;
    onSkip: (seconds: number) => void;
}

export default function VideoPlayerCenterControls({ playing, onPlayPause, onSkip }: VideoPlayerCenterControlsProps) {
    return (
        <>
            <button
                onClick={onPlayPause}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/80 p-5 backdrop-blur-sm transition hover:scale-110 hover:bg-violet-500"
                aria-label={playing ? 'Pause' : 'Play'}
            >
                {playing ? <PauseIcon size={48} className="text-white" /> : <PlayIcon size={48} className="text-white" />}
            </button>

            <button
                onClick={() => onSkip(-10)}
                className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 backdrop-blur-sm transition hover:bg-violet-600/50"
                aria-label="Rewind 10 seconds"
            >
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z"
                    />
                </svg>
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium text-white">10s</span>
            </button>

            <button
                onClick={() => onSkip(10)}
                className="absolute top-1/2 right-1/4 translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 backdrop-blur-sm transition hover:bg-violet-600/50"
                aria-label="Forward 10 seconds"
            >
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z"
                    />
                </svg>
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium text-white">10s</span>
            </button>
        </>
    );
}
