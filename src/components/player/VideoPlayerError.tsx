'use client';

import Image from 'next/image';

interface VideoPlayerErrorProps {
    message: string;
    poster?: string;
    title: string;
    onBack: () => void;
}

export default function VideoPlayerError({ message, poster, title, onBack }: VideoPlayerErrorProps) {
    return (
        <div className="relative flex h-full min-h-[400px] w-full flex-col items-center justify-center overflow-hidden bg-[#0a0a0a]">
            {poster ? (
                <div className="absolute inset-0">
                    <Image
                        src={poster}
                        alt={title}
                        fill
                        sizes="100vw"
                        className="object-cover opacity-30 blur-sm"
                        priority
                    />
                </div>
            ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-violet-900/20 to-purple-900/20" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/80" />

            <div className="relative z-10 flex flex-col items-center gap-6 px-4 text-center">
                <div className="rounded-full bg-red-500/20 p-4">
                    <svg className="h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                </div>

                <div>
                    <h2 className="mb-2 text-xl font-bold text-white md:text-2xl">{title}</h2>
                    <p className="text-lg text-gray-300">{message}</p>
                </div>

                <button
                    onClick={onBack}
                    className="rounded-full bg-gradient-to-r from-violet-500 to-purple-700 px-8 py-3 font-semibold text-white transition hover:scale-105 hover:from-violet-600 hover:to-purple-800"
                >
                    Go Back
                </button>
            </div>
        </div>
    );
}
