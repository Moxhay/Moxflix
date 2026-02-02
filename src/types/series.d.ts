export interface Series {
    id: number;
    title: string;
    description: string;
    posterUrl: string;
    genre_ids: number[];
    rating: number | null;
}

export interface Seasons {
    series_id: number;
    id: number;
    name: string;
    season_number: number;
}

export interface ApiSeries {
    id: number;
    name: string;
    genre_ids: number[];
    overview: string;
    poster_path: string;
    vote_average: number;
}

export interface Episode {
    id: number;
    title: string;
    episodeNumber: number;
    videoUrl: string;
    duration: number | null;
    seasonId: number;
}

export interface ApiEpisode {
    id: number;
    name: string;
    episode_number: number;
    runtime: number | null;
}
