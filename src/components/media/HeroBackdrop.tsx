import Image from 'next/image';

interface HeroBackdropProps {
    imageUrl: string;
    alt: string;
}

export default function HeroBackdrop({ imageUrl, alt }: HeroBackdropProps) {
    return (
        <div className="relative h-[50vh] min-h-[400px] w-full md:h-[60vh]">
            <Image src={imageUrl} alt={alt} fill className="object-cover" sizes="100vw" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
        </div>
    );
}
