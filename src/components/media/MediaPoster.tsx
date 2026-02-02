import Image from 'next/image';

interface MediaPosterProps {
    src: string;
    alt: string;
}

export default function MediaPoster({ src, alt }: MediaPosterProps) {
    return (
        <div className="flex-shrink-0">
            <div className="relative aspect-[2/3] w-48 overflow-hidden rounded-xl shadow-2xl md:w-64">
                <Image src={src} alt={alt} fill className="object-cover" sizes="(max-width: 768px) 192px, 256px" />
            </div>
        </div>
    );
}
