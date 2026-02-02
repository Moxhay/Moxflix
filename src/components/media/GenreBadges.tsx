interface Genre {
    id: number;
    name: string;
}

interface GenreBadgesProps {
    genres: Genre[];
}

export default function GenreBadges({ genres }: GenreBadgesProps) {
    return (
        <div className="flex flex-wrap gap-2">
            {genres.map((genre) => (
                <span key={genre.id} className="rounded-full bg-violet-500/30 px-3 py-1 text-sm text-violet-200">
                    {genre.name}
                </span>
            ))}
        </div>
    );
}
