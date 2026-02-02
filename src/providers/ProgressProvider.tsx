'use client';

import { createContext, useContext, ReactNode, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiProgress } from '@/api/api';
import { useAuth } from './AuthProvider';

interface RawProgressItem {
    movieId: number | null;
    episodeId: number | null;
    progress: number;
}

interface RawProgressResponse {
    data: RawProgressItem[];
}

interface ProgressContextType {
    isLoading: boolean;
    getMovieProgress: (movieId: number) => number | undefined;
    getEpisodeProgress: (episodeId: number) => number | undefined;
}

const ProgressContext = createContext<ProgressContextType | null>(null);

export function useProgress() {
    const context = useContext(ProgressContext);
    if (!context) {
        throw new Error('useProgress must be used within a ProgressProvider');
    }
    return context;
}

interface ProgressProviderProps {
    children: ReactNode;
}

export default function ProgressProvider({ children }: ProgressProviderProps) {
    const { user } = useAuth();

    const { data, isLoading } = useQuery({
        queryKey: ['allProgressRaw', user?.id],
        queryFn: async () => {
            if (!user) return [];
            const response = await apiProgress.getAllRaw({ cache: false });
            if (response.success && response.data) {
                return (response.data as RawProgressResponse).data;
            }
            return [];
        },
        enabled: !!user,
        staleTime: Infinity
    });

    const progressMaps = useMemo(() => {
        const movieMap = new Map<number, number>();
        const episodeMap = new Map<number, number>();

        if (data) {
            for (const item of data) {
                if (item.movieId) {
                    movieMap.set(item.movieId, item.progress);
                }
                if (item.episodeId) {
                    episodeMap.set(item.episodeId, item.progress);
                }
            }
        }

        return { movieMap, episodeMap };
    }, [data]);

    const getMovieProgress = (movieId: number): number | undefined => {
        return progressMaps.movieMap.get(movieId);
    };

    const getEpisodeProgress = (episodeId: number): number | undefined => {
        return progressMaps.episodeMap.get(episodeId);
    };

    return (
        <ProgressContext.Provider
            value={{
                isLoading,
                getMovieProgress,
                getEpisodeProgress
            }}
        >
            {children}
        </ProgressContext.Provider>
    );
}
