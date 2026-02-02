'use client';

import { useCallback, useMemo } from 'react';
import { useSuspenseInfiniteQuery, useSuspenseQuery, useQuery } from '@tanstack/react-query';
import { apiMovies, apiSeries, apiFavorites, apiProgress } from '@/api/api';
import { MediaItem, PaginatedResponse } from '@/types/media';
import { Genres } from '@/types/genre';

interface ApiMediaItem {
    id: number;
    title: string;
    description: string;
    posterUrl: string;
    backdropUrl: string | null;
    rating: number | null;
    genres: Genres[];
}

interface MixedFeedCursors {
    movieCursor: string | null;
    seriesCursor: string | null;
}

const transformToMediaItem = (item: ApiMediaItem, mediaType: 'movie' | 'series'): MediaItem => ({
    ...item,
    mediaType
});

const interleaveArrays = <T>(arr1: T[], arr2: T[]): T[] => {
    const result: T[] = [];
    const maxLen = Math.max(arr1.length, arr2.length);
    for (let i = 0; i < maxLen; i++) {
        if (i < arr1.length) result.push(arr1[i]);
        if (i < arr2.length) result.push(arr2[i]);
    }
    return result;
};

export function useTopRated(limit = 6) {
    const fetchTopRated = useCallback(async (): Promise<MediaItem[]> => {
        const [moviesRes, seriesRes] = await Promise.all([
            apiMovies.getAll({ limit }, { cache: false }),
            apiSeries.getAll({ limit }, { cache: false })
        ]);

        const movies: MediaItem[] =
            moviesRes.success && moviesRes.data
                ? (moviesRes.data as PaginatedResponse<ApiMediaItem>).data.map((m) => transformToMediaItem(m, 'movie'))
                : [];

        const series: MediaItem[] =
            seriesRes.success && seriesRes.data
                ? (seriesRes.data as PaginatedResponse<ApiMediaItem>).data.map((s) => transformToMediaItem(s, 'series'))
                : [];

        return [...movies, ...series]
            .filter((item) => item.rating !== null && item.backdropUrl !== null)
            .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
            .slice(0, limit);
    }, [limit]);

    return useSuspenseQuery({
        queryKey: ['topRated', limit],
        queryFn: fetchTopRated,
        staleTime: 5 * 60 * 1000
    });
}

export function useMixedFeed(limit = 20) {
    const halfLimit = useMemo(() => Math.ceil(limit / 2), [limit]);

    const fetchMixedFeed = useCallback(
        async ({ pageParam }: { pageParam: MixedFeedCursors | undefined }) => {
            const cursors = pageParam || { movieCursor: null, seriesCursor: null };

            const [moviesRes, seriesRes] = await Promise.all([
                apiMovies.getAll({ cursor: cursors.movieCursor ?? undefined, limit: halfLimit }, { cache: false }),
                apiSeries.getAll({ cursor: cursors.seriesCursor ?? undefined, limit: halfLimit }, { cache: false })
            ]);

            const moviesData =
                moviesRes.success && moviesRes.data
                    ? (moviesRes.data as PaginatedResponse<ApiMediaItem>)
                    : { data: [], nextCursor: null, hasMore: false };

            const seriesData =
                seriesRes.success && seriesRes.data
                    ? (seriesRes.data as PaginatedResponse<ApiMediaItem>)
                    : { data: [], nextCursor: null, hasMore: false };

            const movies = moviesData.data.map((m) => transformToMediaItem(m, 'movie'));
            const series = seriesData.data.map((s) => transformToMediaItem(s, 'series'));

            return {
                data: interleaveArrays(movies, series),
                nextCursors: {
                    movieCursor: moviesData.nextCursor,
                    seriesCursor: seriesData.nextCursor
                },
                hasMore: moviesData.hasMore || seriesData.hasMore
            };
        },
        [halfLimit]
    );

    const query = useSuspenseInfiniteQuery({
        queryKey: ['mixedFeed', 'infinite'],
        queryFn: fetchMixedFeed,
        initialPageParam: undefined as MixedFeedCursors | undefined,
        getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursors : undefined)
    });

    const flattenedData = useMemo(() => {
        if (!query.data?.pages) return [];
        return query.data.pages.flatMap((page) => page.data);
    }, [query.data]);

    return {
        ...query,
        items: flattenedData
    };
}

export function useMoviesFeed(limit = 20) {
    const fetchMovies = useCallback(
        async ({ pageParam }: { pageParam: string | undefined }) => {
            const res = await apiMovies.getAll({ cursor: pageParam, limit }, { cache: false });

            const data =
                res.success && res.data
                    ? (res.data as PaginatedResponse<ApiMediaItem>)
                    : { data: [], nextCursor: null, hasMore: false };

            return {
                data: data.data.map((m) => transformToMediaItem(m, 'movie')),
                nextCursor: data.nextCursor,
                hasMore: data.hasMore
            };
        },
        [limit]
    );

    const query = useSuspenseInfiniteQuery({
        queryKey: ['moviesFeed', 'infinite'],
        queryFn: fetchMovies,
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined)
    });

    const flattenedData = useMemo(() => {
        if (!query.data?.pages) return [];
        return query.data.pages.flatMap((page) => page.data);
    }, [query.data]);

    return {
        ...query,
        items: flattenedData
    };
}

export function useSeriesFeed(limit = 20) {
    const fetchSeries = useCallback(
        async ({ pageParam }: { pageParam: string | undefined }) => {
            const res = await apiSeries.getAll({ cursor: pageParam, limit }, { cache: false });

            const data =
                res.success && res.data
                    ? (res.data as PaginatedResponse<ApiMediaItem>)
                    : { data: [], nextCursor: null, hasMore: false };

            return {
                data: data.data.map((s) => transformToMediaItem(s, 'series')),
                nextCursor: data.nextCursor,
                hasMore: data.hasMore
            };
        },
        [limit]
    );

    const query = useSuspenseInfiniteQuery({
        queryKey: ['seriesFeed', 'infinite'],
        queryFn: fetchSeries,
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined)
    });

    const flattenedData = useMemo(() => {
        if (!query.data?.pages) return [];
        return query.data.pages.flatMap((page) => page.data);
    }, [query.data]);

    return {
        ...query,
        items: flattenedData
    };
}

interface FavoriteMediaItem {
    id: number;
    title: string;
    description: string;
    posterUrl: string;
    backdropUrl: string | null;
    rating: number | null;
    genres: Array<{ id: number; name: string }>;
    mediaType: 'movie' | 'series';
}

export interface SeriesDetail {
    id: number;
    title: string;
    description: string;
    posterUrl: string;
    backdropUrl: string | null;
    rating: number | null;
    genres: { id: number; name: string }[];
    seasons: {
        id: number;
        number: number;
        name: string;
        episodes: {
            id: number;
            title: string;
            episodeNumber: number;
            duration: number | null;
        }[];
    }[];
}

export function useSeriesDetail(id: number) {
    return useSuspenseQuery({
        queryKey: ['series', id],
        queryFn: async (): Promise<SeriesDetail> => {
            const res = await apiSeries.getById(id, { cache: false });
            if (!res.success || !res.data) {
                throw new Error('Series not found');
            }
            return (res.data as { data: SeriesDetail }).data;
        },
        staleTime: 5 * 60 * 1000
    });
}

export interface MovieDetail {
    id: number;
    title: string;
    description: string;
    posterUrl: string;
    backdropUrl: string | null;
    videoUrl: string;
    rating: number | null;
    genres: { id: number; name: string }[];
}

export function useMovieDetail(id: number) {
    return useSuspenseQuery({
        queryKey: ['movie', id],
        queryFn: async (): Promise<MovieDetail> => {
            const res = await apiMovies.getById(id, { cache: false });
            if (!res.success || !res.data) {
                throw new Error('Movie not found');
            }
            return (res.data as { data: MovieDetail }).data;
        },
        staleTime: 5 * 60 * 1000
    });
}

export interface EpisodeData {
    series: { id: number; title: string };
    season: { number: number };
    episode: {
        id: number;
        title: string;
        episodeNumber: number;
        videoUrl: string;
        duration: number | null;
    };
    navigation: {
        previousId: number | null;
        previousLabel: string | null;
        nextId: number | null;
        nextLabel: string | null;
    };
}

export function useEpisode(seriesId: number, episodeId: number) {
    return useSuspenseQuery({
        queryKey: ['episode', seriesId, episodeId],
        queryFn: async (): Promise<EpisodeData> => {
            const res = await apiSeries.getEpisode(seriesId, episodeId, { cache: false });
            if (!res.success || !res.data) {
                throw new Error('Episode not found');
            }
            return (res.data as { data: EpisodeData }).data;
        },
        staleTime: 5 * 60 * 1000
    });
}

export function useFavoritesFeed(enabled = true) {
    const query = useQuery({
        queryKey: ['favoritesFeed'],
        queryFn: async (): Promise<MediaItem[]> => {
            const res = await apiFavorites.getAllDetailed({ cache: false });
            if (res.success && res.data) {
                return (res.data as { data: FavoriteMediaItem[] }).data.map((item) => ({
                    id: item.id,
                    title: item.title,
                    description: item.description,
                    posterUrl: item.posterUrl,
                    backdropUrl: item.backdropUrl,
                    rating: item.rating,
                    genres: item.genres,
                    mediaType: item.mediaType
                }));
            }
            return [];
        },
        staleTime: 0,
        enabled
    });

    return {
        items: query.data ?? [],
        isLoading: query.isLoading,
        refetch: query.refetch
    };
}

export interface ContinueWatchingItem {
    id: number;
    mediaType: 'movie' | 'episode';
    mediaId: number;
    seriesId?: number;
    title: string;
    subtitle?: string;
    posterUrl: string;
    backdropUrl: string | null;
    progress: number;
    timestamp: number;
    duration: number;
}

interface ProgressApiItem {
    id: number;
    mediaType: 'movie' | 'episode';
    mediaId: number;
    seriesId?: number;
    title: string;
    subtitle?: string;
    posterUrl: string;
    backdropUrl: string | null;
    timestamp: number;
    duration: number;
    progress: number;
    updatedAt: string;
}

export function useContinueWatching(enabled = true) {
    const query = useQuery({
        queryKey: ['continueWatching'],
        queryFn: async (): Promise<ContinueWatchingItem[]> => {
            const res = await apiProgress.getAll({ cache: false });
            if (res.success && res.data) {
                return (res.data as { data: ProgressApiItem[] }).data.map((item) => ({
                    id: item.id,
                    mediaType: item.mediaType,
                    mediaId: item.mediaId,
                    seriesId: item.seriesId,
                    title: item.title,
                    subtitle: item.subtitle,
                    posterUrl: item.posterUrl,
                    backdropUrl: item.backdropUrl,
                    progress: item.progress,
                    timestamp: item.timestamp,
                    duration: item.duration
                }));
            }
            return [];
        },
        staleTime: 0,
        enabled
    });

    return {
        items: query.data ?? [],
        isLoading: query.isLoading,
        refetch: query.refetch
    };
}
