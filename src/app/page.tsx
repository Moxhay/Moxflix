'use client';

import { Suspense } from 'react';
import HeroSection from '@/components/hero/HeroSection';
import HeroSliderSkeleton from '@/components/hero/HeroSliderSkeleton';
import ContinueWatching from '@/components/media/ContinueWatching';
import FeedSection from '@/components/media/FeedSection';
import MediaGridSkeleton from '@/components/media/MediaGridSkeleton';

export default function Home() {
    return (
        <div className="min-h-screen bg-black">
            <Suspense fallback={<HeroSliderSkeleton />}>
                <HeroSection />
            </Suspense>

            <div className="px-4 pt-8 md:px-8">
                <ContinueWatching />
            </div>

            <Suspense fallback={<MediaGridSkeleton />}>
                <FeedSection />
            </Suspense>
        </div>
    );
}
