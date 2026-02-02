export interface Movie {
    id: number;
    title: string;
    description: string;
    posterUrl: string;
    genre_ids: number[];
    videoUrl: string;
    rating: number | null;
}

export interface ApiMovie {
    id: number;
    title: string;
    genre_ids: number[];
    overview: string;
    poster_path: string;
    vote_average: number;
}