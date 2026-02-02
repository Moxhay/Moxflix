'use client';

import HeroSlider from './HeroSlider';
import { useTopRated } from '@/hooks/useFeed';

export default function HeroSection() {
    const { data: topRatedItems } = useTopRated(6);

    return <HeroSlider items={topRatedItems} />;
}
