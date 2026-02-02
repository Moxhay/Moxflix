'use client';

import { PlayIcon, PauseIcon } from '@/components/icons';

interface VideoPlayerPlayButtonProps {
    playing: boolean;
    onPlayPause: () => void;
}

export default function VideoPlayerPlayButton({ playing, onPlayPause }: VideoPlayerPlayButtonProps) {
    return (
        <button onClick={onPlayPause} className="transition hover:scale-110" aria-label={playing ? 'Pause' : 'Play'}>
            {playing ? <PauseIcon size={28} className="text-white" /> : <PlayIcon size={28} className="text-white" />}
        </button>
    );
}
