'use client';

import { FullscreenIcon, ExitFullscreenIcon } from '@/components/icons';

interface VideoPlayerFullscreenButtonProps {
    isFullscreen: boolean;
    onFullscreen: () => void;
}

export default function VideoPlayerFullscreenButton({ isFullscreen, onFullscreen }: VideoPlayerFullscreenButtonProps) {
    return (
        <button onClick={onFullscreen} className="transition hover:scale-110" aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
            {isFullscreen ? <ExitFullscreenIcon size={28} className="text-white" /> : <FullscreenIcon size={28} className="text-white" />}
        </button>
    );
}
