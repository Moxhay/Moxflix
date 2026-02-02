import { PrismaClient } from '.prisma/client';

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

    console.log(`Processing ${series.length} series...`);

    for (const s of series) {
        // Collect all videos from this series' episodes
        const videos: string[] = [];

        for (const season of s.seasons) {
            for (const episode of season.episodes) {
                if (episode.videoUrl && episode.videoUrl.length > 0) {
                    videos.push(episode.videoUrl);
                }
            }
        }

        if (videos.length === 0) {
            console.log(`[SKIP] ${s.title} - no videos found`);
            continue;
        }

        console.log(`[FOUND] ${s.title} - ${videos.length} videos`);

        // Update episodes without videos
        let updated = 0;
        for (const season of s.seasons) {
            for (const episode of season.episodes) {
                if (!episode.videoUrl || episode.videoUrl.length === 0) {
                    const randomVideo = videos[Math.floor(Math.random() * videos.length)];
                    await prisma.episode.update({
                        where: { id: episode.id },
                        data: { videoUrl: randomVideo }
                    });
                    updated++;
                }
            }
        }

        console.log(`[UPDATED] ${s.title} - ${updated} episodes filled`);
    }
}

main()
    .catch((e) => console.error(e))
    .finally(async () => {
        console.log('Done filling videos');
        await prisma.$disconnect();
    });
