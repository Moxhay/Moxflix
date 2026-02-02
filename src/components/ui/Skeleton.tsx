interface SkeletonProps {
    className?: string;
}

export default function Skeleton({ className = '' }: SkeletonProps) {
    return <div className={`animate-pulse bg-gray-700 ${className}`} />;
}

export function SkeletonText({ className = '', lines = 1 }: SkeletonProps & { lines?: number }) {
    return (
        <div className={`space-y-2 ${className}`}>
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton key={i} className={`h-4 rounded ${i === lines - 1 && lines > 1 ? 'w-2/3' : 'w-full'}`} />
            ))}
        </div>
    );
}

export function SkeletonPoster({ className = '' }: SkeletonProps) {
    return <Skeleton className={`aspect-[2/3] rounded-xl ${className}`} />;
}

export function SkeletonBadge({ className = '' }: SkeletonProps) {
    return <Skeleton className={`h-8 w-20 rounded-full ${className}`} />;
}

export function SkeletonHero({ className = '' }: SkeletonProps) {
    return <Skeleton className={`h-[50vh] min-h-[400px] w-full md:h-[60vh] ${className}`} />;
}

export function SkeletonSeasonItem() {
    return (
        <div className="border-b border-gray-700 px-4 py-4 last:border-b-0">
            <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-32 rounded" />
                <Skeleton className="h-5 w-24 rounded" />
            </div>
        </div>
    );
}
