interface IconProps {
    size?: number;
    className?: string;
}

export default function FilmIcon({ size = 20, className = '' }: IconProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            width={size}
            height={size}
            className={className}
        >
            <path
                fillRule="evenodd"
                d="M1.5 6a2.25 2.25 0 0 1 2.25-2.25h16.5A2.25 2.25 0 0 1 22.5 6v1.5H1.5V6Zm0 3v9a2.25 2.25 0 0 0 2.25 2.25h16.5A2.25 2.25 0 0 0 22.5 18V9H1.5ZM4.5 4.5 6 6h3L7.5 4.5h-3Zm6 0L12 6h3l-1.5-1.5h-3Zm6 0L18 6h3l-1.5-1.5h-3Z"
                clipRule="evenodd"
            />
        </svg>
    );
}
