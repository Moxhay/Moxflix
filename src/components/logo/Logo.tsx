interface LogoProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizes = {
    sm: { text: 'text-xl' },
    md: { text: 'text-2xl' },
    lg: { text: 'text-4xl' },
    xl: { text: 'text-6xl' }
};

export default function Logo({ size = 'md' }: LogoProps) {
    const { text } = sizes[size];

    const gradientClasses = 'bg-gradient-to-r from-violet-400 via-purple-500 to-violet-600 bg-clip-text text-transparent drop-shadow-lg';

    return (
        <div className="flex items-center gap-2">
            {/* Mobile: Show only M */}
            <span className={`${text} ${gradientClasses} font-extrabold tracking-wider md:hidden`}>
                M
            </span>
            {/* Desktop: Show full MOXFLIX */}
            <span className={`${text} ${gradientClasses} hidden font-extrabold tracking-wider md:block`}>
                MOXFLIX
            </span>
        </div>
    );
}
