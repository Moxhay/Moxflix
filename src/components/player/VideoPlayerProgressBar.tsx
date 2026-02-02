'use client';

import { useRef, MouseEvent } from 'react';

interface VideoPlayerProgressBarProps {
    progress: number;
    onSeek: (percent: number) => void;
}

export default function VideoPlayerProgressBar({ progress, onSeek }: VideoPlayerProgressBarProps) {
    const barRef = useRef<HTMLDivElement>(null);

    const handleClick = (e: MouseEvent<HTMLDivElement>) => {
        if (!barRef.current) return;
        const rect = barRef.current.getBoundingClientRect();
        const percent = ((e.clientX - rect.left) / rect.width) * 100;
        onSeek(Math.max(0, Math.min(100, percent)));
    };

    const handleDrag = (e: MouseEvent<HTMLDivElement>) => {
        if (e.buttons !== 1 || !barRef.current) return;
        const rect = barRef.current.getBoundingClientRect();
        const percent = ((e.clientX - rect.left) / rect.width) * 100;
        onSeek(Math.max(0, Math.min(100, percent)));
    };

    return (
        <div className="group/progress mb-4">
            <div
                ref={barRef}
                className="relative h-1 w-full cursor-pointer rounded-full bg-white/30 transition-all group-hover/progress:h-2"
                onClick={handleClick}
                onMouseMove={handleDrag}
            >
                <div
                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-violet-500 to-purple-600"
                    style={{ width: `${progress}%` }}
                />
                <div
                    className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-violet-500 opacity-0 shadow-lg transition group-hover/progress:opacity-100"
                    style={{ left: `calc(${progress}% - 8px)` }}
                />
            </div>
        </div>
    );
}
