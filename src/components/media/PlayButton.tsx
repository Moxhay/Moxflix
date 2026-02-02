interface PlayButtonProps {
    label?: string;
    variant?: 'primary' | 'secondary';
}

export default function PlayButton({ label = 'Play', variant = 'primary' }: PlayButtonProps) {
    const baseClasses = 'flex w-fit items-center gap-2 rounded-lg px-8 py-3 text-lg font-semibold transition-colors';
    const variantClasses = variant === 'primary'
        ? 'bg-violet-600 text-white hover:bg-violet-700'
        : 'border border-gray-500 bg-transparent text-white hover:border-gray-400 hover:bg-white/10';

    return (
        <button className={`${baseClasses} ${variantClasses}`}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                <path
                    fillRule="evenodd"
                    d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
                    clipRule="evenodd"
                />
            </svg>
            {label}
        </button>
    );
}
