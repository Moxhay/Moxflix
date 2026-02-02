'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { HomeIcon, FilmIcon, TvIcon, PlusIcon, ChevronDownIcon } from '@/components/icons';
import NavLink from './NavLink';

interface NavLinkItem {
    href: string;
    label: string;
    icon: React.ReactNode;
}

const navLinks: NavLinkItem[] = [
    { href: '/', label: 'Home', icon: <HomeIcon size={18} /> },
    { href: '/movies', label: 'Movies', icon: <FilmIcon size={18} /> },
    { href: '/series', label: 'Series', icon: <TvIcon size={18} /> },
    { href: '/my-list', label: 'My List', icon: <PlusIcon size={18} /> }
];

export { navLinks };

export default function NavDropdown() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const isActive = (href: string) => {
        if (href === '/') return pathname === '/';
        return pathname.startsWith(href);
    };

    const getCurrentLabel = () => {
        const current = navLinks.find((link) => isActive(link.href));
        return current?.label || 'Home';
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    return (
        <div className="relative md:hidden" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex h-8 items-center gap-1 rounded-full border-2 border-violet-500/50 px-4 text-sm font-medium text-white transition-all duration-300 hover:border-violet-400 hover:bg-gradient-to-r hover:from-violet-500/50 hover:to-purple-700/50"
            >
                {getCurrentLabel()}
                <ChevronDownIcon size={16} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 min-w-[180px] overflow-hidden rounded-lg bg-black/95 py-2 shadow-xl backdrop-blur-md">
                    {navLinks.map((link) => (
                        <NavLink key={link.href} href={link.href} icon={link.icon} variant="dropdown">
                            {link.label}
                        </NavLink>
                    ))}
                </div>
            )}
        </div>
    );
}
