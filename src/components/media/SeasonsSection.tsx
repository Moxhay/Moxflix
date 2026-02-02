import SeasonDropdown from '@/components/media/SeasonDropdown';

interface Episode {
    id: number;
    title: string;
    episodeNumber: number;
    duration: number | null;
}

interface Season {
    id: number;
    number: number;
    name: string;
    episodes: Episode[];
}

interface SeasonsSectionProps {
    seasons: Season[];
    seriesId: number;
}

export default function SeasonsSection({ seasons, seriesId }: SeasonsSectionProps) {
    return (
        <div className="mt-12 pb-16">
            <h2 className="mb-6 text-2xl font-bold text-white">Seasons & Episodes</h2>
            <div className="overflow-hidden rounded-xl border border-gray-700 bg-gray-800/50">
                {seasons.length > 0 ? (
                    seasons.map((season) => <SeasonDropdown key={season.id} season={season} seriesId={seriesId} />)
                ) : (
                    <div className="px-4 py-8 text-center text-gray-400">No seasons available</div>
                )}
            </div>
        </div>
    );
}
