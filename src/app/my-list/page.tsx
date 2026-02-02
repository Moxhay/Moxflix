'use client';

import { useEffect } from 'react';
import MediaCard from '@/components/media/MediaCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useFavoritesFeed } from '@/hooks/useFeed';
import { useAuth } from '@/providers/AuthProvider';

export default function MyListPage() {
    const { user, loading: authLoading } = useAuth();
    const { items, isLoading, refetch } = useFavoritesFeed(!authLoading && !!user);

    useEffect(() => {
        if (user) {
            refetch();
        }
    }, [user, refetch]);

    if (authLoading || isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-black pt-20">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black pt-20">
            <div className="px-4 py-8 md:px-8">
                <h2 className="mb-6 text-2xl font-bold text-white">My List</h2>

                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <p className="mb-2 text-lg text-gray-400">Your list is empty</p>
                        <p className="text-sm text-gray-500">Add movies and series to your list by clicking the heart icon</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                        {items.map((item, index) => (
                            <MediaCard key={`${item.mediaType}-${item.id}-${index}`} item={item} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
