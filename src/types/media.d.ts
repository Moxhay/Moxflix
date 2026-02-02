import { Genres } from './genre';

export interface MediaItem {
    id: number;
    title: string;
    description: string;
    posterUrl: string;
    backdropUrl: string | null;
    rating: number | null;
    genres: Genres[];
    mediaType: 'movie' | 'series';
    isFavorite?: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];
    nextCursor: string | null;
    hasMore: boolean;
}
