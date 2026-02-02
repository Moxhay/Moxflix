export default function HeroSliderSkeleton() {
    return (
        <div className="relative h-[60vh] w-full animate-pulse bg-gray-800">
            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
                <div className="max-w-2xl space-y-4">
                    <div className="h-6 w-20 rounded bg-gray-700" />
                    <div className="h-12 w-96 rounded bg-gray-700" />
                    <div className="h-4 w-64 rounded bg-gray-700" />
                    <div className="h-20 w-full rounded bg-gray-700" />
                    <div className="h-12 w-36 rounded-full bg-gray-700" />
                </div>
            </div>
        </div>
    );
}
