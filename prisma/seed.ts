import { PrismaClient } from '.prisma/client';
import { apiTMDB } from '../src/api/api';
import { ApiMovie, Movie } from '@/types/movie';
import { Genres } from '@/types/genre';
import { ApiEpisode, ApiSeries, Seasons, Series } from '@/types/series';

const prisma = new PrismaClient();

async function main() {
    const moviesGenre = async () => {
        const { success, data, error } = await apiTMDB.getMoviesGenres({ language: 'en-US' });

        if (!success || !data || error) return console.error('Error getting movies genres.');

        const genresData = data as { genres: Genres[] };
        const genres = genresData.genres.map((g: Genres) => ({
            id: g.id,
            name: g.name,
            type: 'movies'
        }));

        await prisma.genre.createMany({
            data: genres,
            skipDuplicates: true
        });
    };
    const seriesGenre = async () => {
        const { success, data, error } = await apiTMDB.getSeriesGenres({ language: 'en-US' });

        if (!success || !data || error) return console.error('Error getting series genres.');

        const genresData = data as { genres: Genres[] };
        const genres = genresData.genres.map((g: Genres) => ({
            id: g.id,
            name: g.name,
            type: 'series'
        }));

        await prisma.genre.createMany({
            data: genres,
            skipDuplicates: true
        });
    };
    const seedMovies = async () => {
        const movieParams = {
            include_adult: 'false',
            include_null_first_air_dates: 'false',
            language: 'en-US',
            sort_by: 'popularity.desc',
            with_origin_country: 'US'
        };
        const [page1, page2] = await Promise.all([
            apiTMDB.getMovies({ ...movieParams, page: 1 }),
            apiTMDB.getMovies({ ...movieParams, page: 2 })
        ]);

        if (!page1.success || !page1.data || page1.error) return console.error('Error getting movies page 1.');
        if (!page2.success || !page2.data || page2.error) return console.error('Error getting movies page 2.');

        const page1Data = page1.data as { results: ApiMovie[] };
        const page2Data = page2.data as { results: ApiMovie[] };
        const data = { results: [...page1Data.results, ...page2Data.results] };

        const movies: Movie[] = await Promise.all(
            data.results.map(async (movie: ApiMovie): Promise<Movie> => {
                const { data: movieTrailer } = await apiTMDB.getMovieTrailer(movie.id, { language: 'en-US' });
                const trailerData = movieTrailer as { results?: Array<Record<string, string>> } | null;

                const trailer = trailerData?.results?.find(
                    (vid: Record<string, string>) => vid.type === 'Trailer' && vid.site === 'YouTube'
                );

                const videoUrl = trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : '';

                return {
                    id: movie.id,
                    title: movie.title,
                    description: movie.overview,
                    posterUrl: `https://image.tmdb.org/t/p/original${movie.poster_path}`,
                    genre_ids: movie.genre_ids,
                    videoUrl,
                    rating: movie.vote_average || null
                };
            })
        );

        try {
            for (const m of movies) {
                await prisma.movie.create({
                    data: {
                        id: m.id,
                        title: m.title,
                        description: m.description,
                        posterUrl: m.posterUrl,
                        videoUrl: m.videoUrl,
                        rating: m.rating,
                        genres: {
                            connect: m.genre_ids.map((id: Genres['id']) => ({ id }))
                        }
                    }
                });
            }
        } catch (error) {
            console.log(error);
        }
    };

    const seedSeries = async () => {
        const seriesParams = {
            include_adult: 'false',
            include_null_first_air_dates: 'false',
            language: 'en-US',
            sort_by: 'popularity.desc',
            with_origin_country: 'US'
        };
        const [page1, page2] = await Promise.all([
            apiTMDB.getSeries({ ...seriesParams, page: 1 }),
            apiTMDB.getSeries({ ...seriesParams, page: 2 })
        ]);

        if (!page1.success || !page1.data || page1.error) return console.error('Error getting series page 1.');
        if (!page2.success || !page2.data || page2.error) return console.error('Error getting series page 2.');

        const page1Data = page1.data as { results: ApiSeries[] };
        const page2Data = page2.data as { results: ApiSeries[] };
        const data = { results: [...page1Data.results, ...page2Data.results] };

        const series: Series[] = data.results.map((tv: ApiSeries) => ({
            id: tv.id,
            title: tv.name,
            description: tv.overview,
            posterUrl: `https://image.tmdb.org/t/p/original${tv.poster_path}`,
            genre_ids: tv.genre_ids,
            rating: tv.vote_average || null
        }));

        try {
            for (const s of series) {
                await prisma.series.create({
                    data: {
                        id: s.id,
                        title: s.title,
                        description: s.description,
                        posterUrl: s.posterUrl,
                        rating: s.rating,
                        genres: {
                            connect: s.genre_ids.map((id: Genres['id']) => ({ id }))
                        }
                    }
                });
            }
        } catch (error) {
            console.log(error);
        }
    };

    const seedSeasons = async () => {
        const series = await prisma.series.findMany();

        const seasons = await Promise.all(
            series.map(async (tv) => {
                const { data } = await apiTMDB.getSeriesSeasons(tv.id, { language: 'en-US' });
                const seriesData = data as { seasons?: Seasons[] } | null;

                if (!seriesData || !seriesData.seasons) return console.error('Error getting series Id.', tv.id);

                return seriesData.seasons.map(
                    (s: Seasons): Seasons => ({
                        id: s.id,
                        name: s.name,
                        season_number: s.season_number,
                        series_id: tv.id
                    })
                );
            })
        );
        const flat_seasons: Seasons[] = seasons.flat().filter((s): s is Seasons => s !== undefined);
        for (const season of flat_seasons) {
            await prisma.season.create({
                data: {
                    season_id: season.id,
                    number: season.season_number,
                    name: season.name,
                    series: { connect: { id: season.series_id } }
                }
            });
        }
    };

    const seedEpisodes = async () => {
        const seasons = await prisma.season.findMany();

        for (const season of seasons) {
            const { data, error } = await apiTMDB.getSeriesSeason(season.seriesId, season.number, { language: 'en-US' });
            const seasonData = data as { episodes?: ApiEpisode[] } | null;

            if (!seasonData || !seasonData.episodes || error) {
                console.error('Error getting episodes for series:', season.seriesId, 'season:', season.number);
                continue;
            }

            for (const episode of seasonData.episodes) {
                let videoUrl = '';

                const { data: videoData } = await apiTMDB.getEpisodeVideos(
                    season.seriesId,
                    season.number,
                    episode.episode_number,
                    { language: 'en-US' }
                );
                const videoResults = videoData as { results?: Array<Record<string, string>> } | null;

                if (videoResults?.results) {
                    const video = videoResults.results.find((vid: Record<string, string>) => vid.site === 'YouTube');
                    if (video) {
                        videoUrl = `https://www.youtube.com/watch?v=${video.key}`;
                    }
                }

                await prisma.episode.create({
                    data: {
                        title: episode.name,
                        episodeNumber: episode.episode_number,
                        videoUrl,
                        duration: episode.runtime || null,
                        season: { connect: { id: season.id } }
                    }
                });
            }

            console.log(`Seeded episodes for series ${season.seriesId}, season ${season.number}`);
        }
    };

    await prisma.series.deleteMany();
    await prisma.movie.deleteMany();
    await prisma.genre.deleteMany();

    await moviesGenre();
    await seriesGenre();
    await seedMovies();
    await seedSeries();
    await seedSeasons();
    await seedEpisodes();
}

main()
    .catch((e) => console.error(e))
    .finally(async () => {
        console.log('Successfully data base seed');
        await prisma.$disconnect();
    });
