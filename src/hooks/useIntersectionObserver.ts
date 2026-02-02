'use client';

import { useEffect, useRef } from 'react';

interface UseIntersectionObserverOptions {
    threshold?: number;
    rootMargin?: string;
    onIntersect?: () => void;
}

export function useIntersectionObserver<T extends HTMLElement>(options: UseIntersectionObserverOptions = {}) {
    const { threshold = 0, rootMargin = '100px', onIntersect } = options;
    const ref = useRef<T>(null);
    const onIntersectRef = useRef(onIntersect);

    useEffect(() => {
        onIntersectRef.current = onIntersect;
    });

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && onIntersectRef.current) {
                    onIntersectRef.current();
                }
            },
            { threshold, rootMargin }
        );

        observer.observe(element);
        return () => observer.disconnect();
    }, [threshold, rootMargin]);

    return ref;
}
