'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

interface NavLinkProps {
    href: string;
    icon: ReactNode;
    children: ReactNode;
    variant?: 'desktop' | 'dropdown';
}

export default function NavLink({ href, icon, children, variant = 'desktop' }: NavLinkProps) {
    const pathname = usePathname();

    const isActive = () => {
        if (href === '/') return pathname === '/';
        return pathname.startsWith(href);
    };

    const styles = {
        desktop: {
            base: 'flex items-center gap-2 rounded-full px-4 py-2 transition-all duration-300',
            active: 'bg-gradient-to-r from-violet-500 to-purple-700 font-medium text-white',
            inactive: 'text-gray-300 hover:bg-gradient-to-r hover:from-violet-500/50 hover:to-purple-700/50 hover:text-white'
        },
        dropdown: {
            base: 'flex items-center gap-3 px-4 py-3 transition-all duration-300',
            active: 'bg-gradient-to-r from-violet-500 to-purple-700 text-white',
            inactive: 'text-gray-300 hover:bg-gradient-to-r hover:from-violet-500/50 hover:to-purple-700/50 hover:text-white'
        }
    };

    const currentStyles = styles[variant];

    return (
        <Link
            href={href}
            className={`${currentStyles.base} ${isActive() ? currentStyles.active : currentStyles.inactive}`}
        >
            {icon}
            <span className="text-sm">{children}</span>
        </Link>
    );
}
