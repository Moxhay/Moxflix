'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFavorites } from '@/api/api';
import { useAuth } from './AuthProvider';

interface FavoriteItem {
    mediaType: 'movie' | 'series';
    mediaId: number;
}

interface FavoritesResponse {
    data: FavoriteItem[];
}

interface MediaItem {
    id: number;
    title: string;
    description: string;
    posterUrl: string;
    backdropUrl: string | null;
    rating: number | null;
    genres: Array<{ id: number; name: string }>;
    mediaType: 'movie' | 'series';
}

interface FavoritesContextType {
    favorites: FavoriteItem[];
    isLoading: boolean;
    isFavorite: (mediaType: 'movie' | 'series', mediaId: number) => boolean;
    toggleFavorite: (mediaType: 'movie' | 'series', mediaId: number) => void;
    removeFavoriteFromCache: (mediaType: 'movie' | 'series', mediaId: number) => void;
    isToggling: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | null>(null);

export function useFavorites() {
    const context = useContext(FavoritesContext);
    if (!context) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }
    return context;
}

interface FavoritesProviderProps {
    children: ReactNode;
}

export default function FavoritesProvider({ children }: FavoritesProviderProps) {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    const { data, isLoading } = useQuery({
        queryKey: ['favorites', user?.id],
        queryFn: async () => {
            if (!user) return [];
            const response = await apiFavorites.getAll({ cache: false });
            if (response.success && response.data) {
                return (response.data as FavoritesResponse).data;
            }
            return [];
        },
        enabled: !!user,
        staleTime: 5 * 60 * 1000
    });

    const toggleMutation = useMutation({
        mutationFn: async ({ mediaType, mediaId }: FavoriteItem) => {
            const response = await apiFavorites.toggle({ mediaType, mediaId });
            if (!response.success) {
                throw new Error(response.error || 'Error updating favorite');
            }
            return response.data as { isFavorite: boolean };
        },
        onMutate: async ({ mediaType, mediaId }) => {
            await queryClient.cancelQueries({ queryKey: ['favorites', user?.id] });
            await queryClient.cancelQueries({ queryKey: ['favoritesFeed'] });

            const previousFavorites = queryClient.getQueryData<FavoriteItem[]>(['favorites', user?.id]);
            const previousFavoritesFeed = queryClient.getQueryData<MediaItem[]>(['favoritesFeed']);

            queryClient.setQueryData<FavoriteItem[]>(['favorites', user?.id], (old = []) => {
                const exists = old.some((f) => f.mediaType === mediaType && f.mediaId === mediaId);
                if (exists) {
                    return old.filter((f) => !(f.mediaType === mediaType && f.mediaId === mediaId));
                }
                return [...old, { mediaType, mediaId }];
            });

            queryClient.setQueryData<MediaItem[]>(['favoritesFeed'], (old = []) => {
                return old.filter((item) => !(item.mediaType === mediaType && item.id === mediaId));
            });

            return { previousFavorites, previousFavoritesFeed };
        },
        onError: (_err, _variables, context) => {
            if (context?.previousFavorites) {
                queryClient.setQueryData(['favorites', user?.id], context.previousFavorites);
            }
            if (context?.previousFavoritesFeed) {
                queryClient.setQueryData(['favoritesFeed'], context.previousFavoritesFeed);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['favorites', user?.id] });
            queryClient.invalidateQueries({ queryKey: ['favoritesFeed'] });
        }
    });

    const isFavorite = (mediaType: 'movie' | 'series', mediaId: number): boolean => {
        return data?.some((f) => f.mediaType === mediaType && f.mediaId === mediaId) ?? false;
    };

    const toggleFavorite = (mediaType: 'movie' | 'series', mediaId: number) => {
        toggleMutation.mutate({ mediaType, mediaId });
    };

    const removeFavoriteFromCache = (mediaType: 'movie' | 'series', mediaId: number) => {
        queryClient.setQueryData<FavoriteItem[]>(['favorites', user?.id], (old = []) => {
            return old.filter((f) => !(f.mediaType === mediaType && f.mediaId === mediaId));
        });
        queryClient.setQueryData<MediaItem[]>(['favoritesFeed'], (old = []) => {
            return old.filter((item) => !(item.mediaType === mediaType && item.id === mediaId));
        });
    };

    return (
        <FavoritesContext.Provider
            value={{
                favorites: data ?? [],
                isLoading,
                isFavorite,
                toggleFavorite,
                removeFavoriteFromCache,
                isToggling: toggleMutation.isPending
            }}
        >
            {children}
        </FavoritesContext.Provider>
    );
}