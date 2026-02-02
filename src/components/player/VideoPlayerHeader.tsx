'use client';

interface VideoPlayerHeaderProps {
    title: string;
    subtitle?: string;
    onBack: () => void;
}

export default function VideoPlayerHeader({ title, subtitle, onBack }: VideoPlayerHeaderProps) {
    return (
        <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/90 via-black/50 to-transparent px-4 pt-4 pb-20">
            <div className="flex items-center gap-4">
                <button onClick={onBack} className="rounded-full p-2 transition hover:bg-violet-600/50" aria-label="Go back">
                    <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <div>
                    <h1 className="text-xl font-bold text-white md:text-2xl">{title}</h1>
                    {subtitle && <p className="text-sm text-gray-300">{subtitle}</p>}
                </div>
            </div>
        </div>
    );
}
