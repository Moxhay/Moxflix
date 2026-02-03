import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Nav from '@/components/nav/Nav';
import QueryProvider from '@/providers/QueryProvider';
import ToastProvider from '@/providers/ToastProvider';
import AuthProvider from '@/providers/AuthProvider';
import FavoritesProvider from '@/providers/FavoritesProvider';
import ProgressProvider from '@/providers/ProgressProvider';
import { Analytics } from '@vercel/analytics/next';
import React from 'react';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin']
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin']
});

export const metadata: Metadata = {
    title: 'Moxflix',
    description:
        'Streaming platform with thousands of movies and TV shows. Discover, save your favorites and continue watching where you left off.'
};

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}>
                <QueryProvider>
                    <AuthProvider>
                        <FavoritesProvider>
                            <ProgressProvider>
                                <ToastProvider>
                                    <Nav />
                                    <main>{children}</main>
                                </ToastProvider>
                            </ProgressProvider>
                        </FavoritesProvider>
                    </AuthProvider>
                </QueryProvider>
                <Analytics />
            </body>
        </html>
    );
}
