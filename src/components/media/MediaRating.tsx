import { StarIcon } from '@/components/icons';

interface MediaRatingProps {
    rating: number;
}

export default function MediaRating({ rating }: MediaRatingProps) {
    return (
        <div className="flex items-center gap-1 text-yellow-400">
            <StarIcon size={20} />
            <span className="text-lg font-semibold">{rating.toFixed(1)}</span>
        </div>
    );
}
