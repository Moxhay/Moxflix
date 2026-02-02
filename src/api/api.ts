export interface ApiResponse<T = unknown> {
    success: boolean;
    error: string | null;
    data: T | null;
}

export interface CacheConfig {
    cache?: boolean;
    revalidate?: number;
}

export interface RequestConfig {
    url: string;
    params?: Record<string, string | number | undefined>;
    payload?: Record<string, unknown>;
    authType?: 'TMDBAPI' | 'LOCAL';
    cacheConfig?: CacheConfig;
}

const getBaseUrl = (authType: RequestConfig['authType']): string => {
    switch (authType) {
        case 'TMDBAPI':
            return 'https://api.themoviedb.org/3';
        case 'LOCAL':
            return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        default:
            return '';
    }
};

const getHeaders = (authType: RequestConfig['authType']): HeadersInit => {
    const defaultHeaders: HeadersInit = { 'Content-Type': 'application/json' };

    if (authType === 'TMDBAPI') {
        return { ...defaultHeaders, Authorization: `Bearer ${process.env.BEARER_TMDB_API_KEY}` };
    }

    return defaultHeaders;
};

const buildUrl = (baseUrl: string, url: string, params?: RequestConfig['params']): string => {
    const fullUrl = `${baseUrl}${url}`;
    if (!params) return fullUrl;

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
            searchParams.append(key, String(value));
        }
    });

    const queryString = searchParams.toString();
    return queryString ? `${fullUrl}?${queryString}` : fullUrl;
};

const getFetchOptions = (authType: RequestConfig['authType'], cacheConfig?: CacheConfig): RequestInit => {
    const options: RequestInit & { next?: { revalidate: number } } = {
        method: 'GET',
        headers: getHeaders(authType)
    };

    if (cacheConfig?.cache === false) {
        options.cache = 'no-store';
    } else if (cacheConfig?.revalidate !== undefined) {
        options.next = { revalidate: cacheConfig.revalidate };
    }

    return options;
};

const apiGet = async <T>({ url, params, authType, cacheConfig }: RequestConfig): Promise<ApiResponse<T>> => {
    try {
        const response = await fetch(buildUrl(getBaseUrl(authType), url, params), getFetchOptions(authType, cacheConfig));

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return { success: false, error: errorData.error || response.statusText, data: null };
        }

        const data = await response.json();
        return { success: true, error: null, data };
    } catch (error) {
        return { success: false, error: (error as Error).message, data: null };
    }
};

const apiPost = async <T>({ url, payload, authType }: RequestConfig): Promise<ApiResponse<T>> => {
    try {
        const response = await fetch(`${getBaseUrl(authType)}${url}`, {
            method: 'POST',
            headers: getHeaders(authType),
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return { success: false, error: errorData.error || response.statusText, data: null };
        }

        const data = await response.json();
        return { success: true, error: null, data };
    } catch (error) {
        return { success: false, error: (error as Error).message, data: null };
    }
};

export const apiTMDB = {
    getMoviesGenres: (params?: RequestConfig['params'], cacheConfig?: CacheConfig) =>
        apiGet({ url: '/genre/movie/list', params, authType: 'TMDBAPI', cacheConfig }),

    getSeriesGenres: (params?: RequestConfig['params'], cacheConfig?: CacheConfig) =>
        apiGet({ url: '/genre/tv/list', params, authType: 'TMDBAPI', cacheConfig }),

    getMovies: (params?: RequestConfig['params'], cacheConfig?: CacheConfig) =>
        apiGet({ url: '/discover/movie', params, authType: 'TMDBAPI', cacheConfig }),

    getMovieTrailer: (movieId: number, params?: RequestConfig['params'], cacheConfig?: CacheConfig) =>
        apiGet({ url: `/movie/${movieId}/videos`, params, authType: 'TMDBAPI', cacheConfig }),

    getSeries: (params?: RequestConfig['params'], cacheConfig?: CacheConfig) =>
        apiGet({ url: '/discover/tv', params, authType: 'TMDBAPI', cacheConfig }),

    getSeriesSeasons: (seriesId: number, params?: RequestConfig['params'], cacheConfig?: CacheConfig) =>
        apiGet({ url: `/tv/${seriesId}`, params, authType: 'TMDBAPI', cacheConfig }),

    getSeriesSeason: (seriesId: number, seasonNumber: number, params?: RequestConfig['params'], cacheConfig?: CacheConfig) =>
        apiGet({ url: `/tv/${seriesId}/season/${seasonNumber}`, params, authType: 'TMDBAPI', cacheConfig }),

    getEpisodeVideos: (
        seriesId: number,
        seasonNumber: number,
        episodeNumber: number,
        params?: RequestConfig['params'],
        cacheConfig?: CacheConfig
    ) => apiGet({ url: `/tv/${seriesId}/season/${seasonNumber}/episode/${episodeNumber}/videos`, params, authType: 'TMDBAPI', cacheConfig })
};

export const apiAuth = {
    login: (payload: RequestConfig['payload']) => apiPost({ url: '/api/auth/login', payload, authType: 'LOCAL' }),

    signup: (payload: RequestConfig['payload']) => apiPost({ url: '/api/auth/signup', payload, authType: 'LOCAL' }),

    logout: () => apiPost({ url: '/api/auth/logout', payload: {}, authType: 'LOCAL' }),

    getSession: () => apiGet({ url: '/api/auth/session', authType: 'LOCAL', cacheConfig: { cache: false } })
};

export const apiMovies = {
    getAll: (params?: RequestConfig['params'], cacheConfig?: CacheConfig) =>
        apiGet({ url: '/api/movies', params, authType: 'LOCAL', cacheConfig }),

    getById: (id: number, cacheConfig?: CacheConfig) => apiGet({ url: `/api/movies/${id}`, authType: 'LOCAL', cacheConfig })
};

export const apiSeries = {
    getAll: (params?: RequestConfig['params'], cacheConfig?: CacheConfig) =>
        apiGet({ url: '/api/series', params, authType: 'LOCAL', cacheConfig }),

    getById: (id: number, cacheConfig?: CacheConfig) => apiGet({ url: `/api/series/${id}`, authType: 'LOCAL', cacheConfig }),

    getEpisode: (seriesId: number, episodeId: number, cacheConfig?: CacheConfig) =>
        apiGet({ url: `/api/series/${seriesId}/${episodeId}`, authType: 'LOCAL', cacheConfig })
};

export const apiGenres = {
    getAll: (params?: RequestConfig['params'], cacheConfig?: CacheConfig) =>
        apiGet({ url: '/api/genres', params, authType: 'LOCAL', cacheConfig })
};

export const apiFavorites = {
    toggle: (payload: { mediaType: 'movie' | 'series'; mediaId: number }) =>
        apiPost({ url: '/api/favorites', payload, authType: 'LOCAL' }),

    getAll: (cacheConfig?: CacheConfig) => apiGet({ url: '/api/favorites', authType: 'LOCAL', cacheConfig }),

    getAllDetailed: (cacheConfig?: CacheConfig) => apiGet({ url: '/api/favorites', params: { detailed: 'true' }, authType: 'LOCAL', cacheConfig })
};

export const apiProgress = {
    save: (payload: { mediaType: 'movie' | 'episode'; mediaId: number; timestamp: number; duration: number }) =>
        apiPost({ url: '/api/progress', payload, authType: 'LOCAL' }),

    getAll: (cacheConfig?: CacheConfig) => apiGet({ url: '/api/progress', authType: 'LOCAL', cacheConfig }),

    getAllRaw: (cacheConfig?: CacheConfig) => apiGet({ url: '/api/progress/all', authType: 'LOCAL', cacheConfig }),

    getForMedia: (mediaType: 'movie' | 'episode', mediaId: number, cacheConfig?: CacheConfig) =>
        apiGet({ url: `/api/progress/${mediaType}/${mediaId}`, authType: 'LOCAL', cacheConfig })
};
