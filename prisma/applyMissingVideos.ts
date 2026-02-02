import { PrismaClient } from '.prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

interface MissingVideo {
    series: string;
    videos: string[];
}

async function main() {
    const jsonPath = './prisma/missing-videos.json';

    if (!fs.existsSync(jsonPath)) {
        console.error('missing-videos.json not found. Run generateMissingVideos.ts first.');
        return;
    }

    const missingVideos: MissingVideo[] = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

    for (const entry of missingVideos) {
        if (entry.videos.length === 0) {
            console.log(`[SKIP] ${entry.series} - no videos provided`);
            continue;
        }

        const series = await prisma.series.findFirst({
            where: { title: entry.series },
            include: {
                seasons: {
                    include: {
                        episodes: true
                    }
                }
            }
        });

        if (!series) {
            console.log(`[NOT FOUND] ${entry.series}`);
            continue;
        }

        let updated = 0;
        for (const season of series.seasons) {
            for (const episode of season.episodes) {
                if (!episode.videoUrl || episode.videoUrl.length === 0) {
                    const randomVideo = entry.videos[Math.floor(Math.random() * entry.videos.length)];
                    await prisma.episode.update({
                        where: { id: episode.id },
                        data: { videoUrl: randomVideo }
                    });
                    updated++;
                }
            }
        }

        console.log(`[UPDATED] ${entry.series} - ${updated} episodes`);
    }
}

main()
    .catch((e) => console.error(e))
    .finally(async () => {
        console.log('Done applying missing videos');
        await prisma.$disconnect();
    });
