'use client';

import { Suspense } from 'react';
import MovieDetail from '@/components/media/MovieDetail';
import MovieDetailSkeleton from '@/components/media/MovieDetailSkeleton';

export default function MovieDetailPage() {
    return (
        <div className="min-h-screen bg-black">
            <Suspense fallback={<MovieDetailSkeleton />}>
                <MovieDetail />
            </Suspense>
        </div>
    );
}
