import { PrismaClient } from '.prisma/client';
import { apiTMDB } from '../src/api/api';

const prisma = new PrismaClient();

interface TMDBMovie {
    id: number;
    backdrop_path: string | null;
}

interface TMDBSeries {
    id: number;
    backdrop_path: string | null;
}

async function updateBackdrops() {
    console.log('Fetching movies from TMDB...');

    const movieParams = {
        include_adult: 'false',
        language: 'en-US',
        sort_by: 'popularity.desc',
        with_origin_country: 'US'
    };

    const [moviesPage1, moviesPage2] = await Promise.all([
        apiTMDB.getMovies({ ...movieParams, page: 1 }),
        apiTMDB.getMovies({ ...movieParams, page: 2 })
    ]);

    if (moviesPage1.success && moviesPage1.data && moviesPage2.success && moviesPage2.data) {
        const movies1 = (moviesPage1.data as { results: TMDBMovie[] }).results;
        const movies2 = (moviesPage2.data as { results: TMDBMovie[] }).results;
        const allMovies = [...movies1, ...movies2];

        console.log(`Updating ${allMovies.length} movies...`);

        for (const movie of allMovies) {
            if (movie.backdrop_path) {
                const backdropUrl = `https://image.tmdb.org/t/p/original${movie.backdrop_path}`;
                await prisma.movie.update({
                    where: { id: movie.id },
                    data: { backdropUrl }
                }).catch(() => {
                    // Movie might not exist in our DB
                });
            }
        }
        console.log('Movies updated!');
    }

    console.log('Fetching series from TMDB...');

    const seriesParams = {
        include_adult: 'false',
        language: 'en-US',
        sort_by: 'popularity.desc',
        with_origin_country: 'US'
    };

    const [seriesPage1, seriesPage2] = await Promise.all([
        apiTMDB.getSeries({ ...seriesParams, page: 1 }),
        apiTMDB.getSeries({ ...seriesParams, page: 2 })
    ]);

    if (seriesPage1.success && seriesPage1.data && seriesPage2.success && seriesPage2.data) {
        const series1 = (seriesPage1.data as { results: TMDBSeries[] }).results;
        const series2 = (seriesPage2.data as { results: TMDBSeries[] }).results;
        const allSeries = [...series1, ...series2];

        console.log(`Updating ${allSeries.length} series...`);

        for (const series of allSeries) {
            if (series.backdrop_path) {
                const backdropUrl = `https://image.tmdb.org/t/p/original${series.backdrop_path}`;
                await prisma.series.update({
                    where: { id: series.id },
                    data: { backdropUrl }
                }).catch(() => {
                    // Series might not exist in our DB
                });
            }
        }
        console.log('Series updated!');
    }

    console.log('Backdrop update complete!');
}

updateBackdrops()
    .catch((e) => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
