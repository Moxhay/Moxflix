'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { SearchIcon, CloseIcon } from '@/components/icons';

type SearchContext = 'all' | 'movies' | 'series' | 'favorites';

interface SearchBarProps {
    isOpen: boolean;
    onClose: () => void;
}

function getSearchContext(pathname: string): { context: SearchContext; basePath: string } {
    if (pathname.startsWith('/movies')) return { context: 'movies', basePath: '/movies' };
    if (pathname.startsWith('/series')) return { context: 'series', basePath: '/series' };
    if (pathname.startsWith('/my-list')) return { context: 'favorites', basePath: '/my-list' };
    return { context: 'all', basePath: '' };
}

function getPlaceholder(context: SearchContext): string {
    switch (context) {
        case 'movies': return 'Search movies...';
        case 'series': return 'Search series...';
        case 'favorites': return 'Search in my list...';
        default: return 'Search movies and series...';
    }
}

const MAX_SEARCH_LENGTH = 25;

function sanitizeSearch(query: string): string {
    return query.trim().slice(0, MAX_SEARCH_LENGTH);
}

function isValidSearch(query: string): boolean {
    const sanitized = sanitizeSearch(query);
    return sanitized.length >= 1 && sanitized.length <= MAX_SEARCH_LENGTH;
}

export default function SearchBar({ isOpen, onClose }: SearchBarProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const pathname = usePathname();
    const { context, basePath } = getSearchContext(pathname);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
        if (!isOpen) {
            setSearchQuery('');
        }
    }, [isOpen]);

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value.length <= MAX_SEARCH_LENGTH) {
            setSearchQuery(value);
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const sanitized = sanitizeSearch(searchQuery);
        if (isValidSearch(sanitized)) {
            router.push(`${basePath}/search?q=${encodeURIComponent(sanitized)}`);
            onClose();
        }
    };

    return (
        <div
            className={`flex justify-center overflow-hidden px-4 transition-all duration-300 ease-in-out md:px-8 ${
                isOpen ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'
            }`}
        >
            <form onSubmit={handleSubmit} className="flex w-4/5 items-center gap-3 rounded-full bg-gradient-to-r from-violet-500/80 to-purple-700/50 px-5 py-3 backdrop-blur-md">
                <SearchIcon size={20} className="flex-shrink-0 text-white" />
                <input
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onChange={handleChange}
                    maxLength={MAX_SEARCH_LENGTH}
                    placeholder={getPlaceholder(context)}
                    className="flex-1 bg-transparent text-white placeholder-white outline-none"
                />
                <button
                    onClick={onClose}
                    type="button"
                    className="flex-shrink-0 rounded-full p-1 text-white transition-all duration-200 hover:bg-white/20"
                    aria-label="Close search"
                >
                    <CloseIcon size={20} />
                </button>
            </form>
        </div>
    );
}
