'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Logo from '@/components/logo/Logo';
import { SearchIcon, UserIcon } from '@/components/icons';
import SearchBar from './SearchBar';
import NavDropdown, { navLinks } from './NavDropdown';
import NavLink from './NavLink';
import UserDropdown from './UserDropdown';
import { useAuth } from '@/providers/AuthProvider';

export default function Nav() {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const { user, loading } = useAuth();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="fixed top-0 right-0 left-0 z-50">
            <nav
                className={`flex items-center justify-between px-4 py-4 transition-all duration-300 md:px-8 ${
                    isScrolled ? 'bg-black/80 backdrop-blur-md' : 'bg-gradient-to-b from-black/80 to-transparent'
                }`}
            >
                <div className="flex items-center gap-3">
                    <Link href="/" className="flex-shrink-0">
                        <Logo size="lg" />
                    </Link>
                    <NavDropdown />
                </div>

                <div className="hidden items-center gap-1 md:flex">
                    {navLinks.map((link) => (
                        <NavLink key={link.href} href={link.href} icon={link.icon}>
                            {link.label}
                        </NavLink>
                    ))}
                </div>

                <div className="flex items-center gap-2 md:gap-4">
                    <button
                        onClick={() => setIsSearchOpen(!isSearchOpen)}
                        className={`rounded-full p-2 transition-all duration-300 ${
                            isSearchOpen
                                ? 'bg-gradient-to-r from-violet-500 to-purple-700 text-white'
                                : 'text-gray-300 hover:bg-gradient-to-r hover:from-violet-500/50 hover:to-purple-700/50 hover:text-white'
                        }`}
                        aria-label="Search"
                    >
                        <SearchIcon size={20} />
                    </button>
                    {!loading && (
                        user ? (
                            <UserDropdown />
                        ) : (
                            <Link
                                href="/login"
                                className="flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-purple-700 px-3 py-2 text-sm font-medium text-white transition-all duration-300 hover:from-violet-500/80 hover:to-purple-700/80 md:px-4"
                            >
                                <UserIcon size={18} />
                                <span className="hidden md:inline">Sign In</span>
                            </Link>
                        )
                    )}
                </div>
            </nav>

            <SearchBar isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </div>
    );
}
