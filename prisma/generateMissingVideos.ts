import { PrismaClient } from '.prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function main() {
    const series = await prisma.series.findMany({
        include: {
            seasons: {
                include: {
                    episodes: true
                }
            }
        }
    });

    const missingVideos: { series: string; videos: string[] }[] = [];

    for (const s of series) {
        const hasEpisodeWithoutVideo = s.seasons.some(season =>
            season.episodes.some(ep => !ep.videoUrl || ep.videoUrl.length === 0)
        );

        if (hasEpisodeWithoutVideo) {
            missingVideos.push({
                series: s.title,
                videos: []
            });
        }
    }

    const outputPath = './prisma/missing-videos.json';
    fs.writeFileSync(outputPath, JSON.stringify(missingVideos, null, 4));
    console.log(`Generated ${outputPath} with ${missingVideos.length} series missing videos`);
}

main()
    .catch((e) => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
