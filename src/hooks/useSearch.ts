'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiMovies, apiSeries, apiFavorites } from '@/api/api';
import { MediaItem, PaginatedResponse } from '@/types/media';

export type SearchContext = 'all' | 'movies' | 'series' | 'favorites';

export function useSearch(context: SearchContext = 'all') {
    const [searchTerm, setSearchTerm] = useState('');

    const { data, isLoading, error } = useQuery({
        queryKey: ['search', searchTerm, context],
        queryFn: async (): Promise<MediaItem[]> => {
            switch (context) {
                case 'favorites': {
                    const res = await apiFavorites.getAllDetailed({ cache: false });
                    if (!res.success || !res.data) return [];
                    const favorites = (res.data as { data: MediaItem[] }).data;
                    const term = searchTerm.toLowerCase();
                    return favorites.filter((item) => item.title.toLowerCase().includes(term));
                }
                case 'movies': {
                    const res = await apiMovies.getAll({ search: searchTerm, limit: 50 }, { cache: false });
                    if (!res.success || !res.data) return [];
                    return (res.data as PaginatedResponse<MediaItem>).data.map((m) => ({ ...m, mediaType: 'movie' as const }));
                }
                case 'series': {
                    const res = await apiSeries.getAll({ search: searchTerm, limit: 50 }, { cache: false });
                    if (!res.success || !res.data) return [];
                    return (res.data as PaginatedResponse<MediaItem>).data.map((s) => ({ ...s, mediaType: 'series' as const }));
                }
                case 'all':
                default: {
                    const [moviesRes, seriesRes] = await Promise.all([
                        apiMovies.getAll({ search: searchTerm, limit: 50 }, { cache: false }),
                        apiSeries.getAll({ search: searchTerm, limit: 50 }, { cache: false })
                    ]);

                    const movies: MediaItem[] =
                        moviesRes.success && moviesRes.data
                            ? (moviesRes.data as PaginatedResponse<MediaItem>).data.map((m) => ({ ...m, mediaType: 'movie' as const }))
                            : [];

                    const series: MediaItem[] =
                        seriesRes.success && seriesRes.data
                            ? (seriesRes.data as PaginatedResponse<MediaItem>).data.map((s) => ({ ...s, mediaType: 'series' as const }))
                            : [];

                    return [...movies, ...series];
                }
            }
        },
        enabled: searchTerm.length > 0,
        staleTime: 30 * 1000
    });

    return {
        searchTerm,
        setSearchTerm,
        results: data ?? [],
        isLoading: isLoading && searchTerm.length > 0,
        error
    };
}
