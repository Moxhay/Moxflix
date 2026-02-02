import Skeleton, { SkeletonText, SkeletonPoster, SkeletonBadge, SkeletonHero, SkeletonSeasonItem } from '@/components/ui/Skeleton';

export default function SeriesDetailSkeleton() {
    return (
        <>
            <SkeletonHero />

            <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="-mt-48 flex flex-col gap-8 md:-mt-64 md:flex-row">
                    <div className="flex-shrink-0">
                        <SkeletonPoster className="w-48 shadow-2xl md:w-64" />
                    </div>

                    <div className="flex flex-1 flex-col pt-4">
                        <Skeleton className="mb-4 h-12 w-3/4 rounded-lg" />

                        <div className="mb-4 flex gap-4">
                            <Skeleton className="h-6 w-16 rounded" />
                            <Skeleton className="h-6 w-24 rounded" />
                        </div>

                        <div className="mb-6 flex gap-2">
                            <SkeletonBadge />
                            <SkeletonBadge className="w-24" />
                            <SkeletonBadge className="w-16" />
                        </div>

                        <SkeletonText lines={3} className="max-w-3xl" />
                    </div>
                </div>

                <div className="mt-12 pb-16">
                    <Skeleton className="mb-6 h-8 w-64 rounded-lg" />
                    <div className="overflow-hidden rounded-xl border border-gray-700 bg-gray-800/50">
                        <SkeletonSeasonItem />
                        <SkeletonSeasonItem />
                        <SkeletonSeasonItem />
                    </div>
                </div>
            </div>
        </>
    );
}
