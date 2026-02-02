'use client';

import { Suspense } from 'react';
import SeriesDetail from '@/components/media/SeriesDetail';
import SeriesDetailSkeleton from '@/components/media/SeriesDetailSkeleton';

export default function SeriesDetailPage() {
    return (
        <div className="min-h-screen bg-black">
            <Suspense fallback={<SeriesDetailSkeleton />}>
                <SeriesDetail />
            </Suspense>
        </div>
    );
}
