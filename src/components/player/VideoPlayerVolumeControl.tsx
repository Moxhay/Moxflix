'use client';

import { VolumeIcon, VolumeMutedIcon } from '@/components/icons';

interface VideoPlayerVolumeControlProps {
    volume: number;
    muted: boolean;
    onVolumeChange: (volume: number) => void;
    onToggleMute: () => void;
}

export default function VideoPlayerVolumeControl({ volume, muted, onVolumeChange, onToggleMute }: VideoPlayerVolumeControlProps) {
    const displayVolume = muted ? 0 : volume;

    return (
        <div className="group/vol flex items-center gap-2">
            <button onClick={onToggleMute} className="transition hover:scale-110" aria-label={muted ? 'Unmute' : 'Mute'}>
                {muted || volume === 0 ? <VolumeMutedIcon size={28} className="text-white" /> : <VolumeIcon size={28} className="text-white" />}
            </button>
            <div className="flex w-0 items-center overflow-hidden transition-all duration-200 group-hover/vol:w-24">
                <div className="relative flex h-5 w-24 items-center">
                    <div className="absolute h-1 w-full rounded-full bg-white/30" />
                    <div
                        className="absolute h-1 rounded-full bg-violet-500"
                        style={{ width: `${displayVolume}%` }}
                    />
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={displayVolume}
                        onChange={(e) => onVolumeChange(Number(e.target.value) / 100)}
                        className="absolute h-1 w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition [&::-webkit-slider-thumb]:hover:scale-125 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-md"
                    />
                </div>
            </div>
        </div>
    );
}
