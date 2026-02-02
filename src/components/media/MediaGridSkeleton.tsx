export default function MediaGridSkeleton() {
    return (
        <div className="px-4 py-8 md:px-8">
            <div className="mb-6 h-8 w-48 animate-pulse rounded bg-gray-700" />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {Array.from({ length: 12 }).map((_, index) => (
                    <div key={index} className="aspect-[2/3] animate-pulse rounded-lg bg-gray-700" />
                ))}
            </div>
        </div>
    );
}
