'use client';

import { useState, useRef, useEffect } from 'react';
import { UserIcon, ChevronDownIcon } from '@/components/icons';
import { useAuth } from '@/providers/AuthProvider';

export default function UserDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { user, logout } = useAuth();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!user) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-purple-700 px-3 py-2 text-sm font-medium text-white transition-all duration-300 hover:from-violet-500/80 hover:to-purple-700/80 md:px-4"
            >
                <UserIcon size={18} />
                <span className="hidden max-w-24 truncate md:inline">{user.name}</span>
                <ChevronDownIcon size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg border border-gray-700 bg-gray-900 py-2 shadow-xl">
                    <div className="border-b border-gray-700 px-4 py-2">
                        <p className="truncate text-sm font-medium text-white">{user.name}</p>
                        <p className="truncate text-xs text-gray-400">{user.email}</p>
                    </div>
                    <button
                        onClick={() => {
                            setIsOpen(false);
                            logout();
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
                    >
                        Log out
                    </button>
                </div>
            )}
        </div>
    );
}