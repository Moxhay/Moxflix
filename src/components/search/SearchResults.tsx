'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import MediaCard from '@/components/media/MediaCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useSearch, SearchContext } from '@/hooks/useSearch';

interface SearchResultsProps {
    context: SearchContext;
    title: string;
    emptyMessage: string;
}

function SearchResultsContent({ context, title, emptyMessage }: SearchResultsProps) {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';
    const { searchTerm, setSearchTerm, results, isLoading } = useSearch(context);

    useEffect(() => {
        if (query) {
            setSearchTerm(query);
        }
    }, [query, setSearchTerm]);

    return (
        <div className="min-h-screen bg-black pt-24">
            <div className="px-4 md:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white">{searchTerm ? `Results for "${searchTerm}"` : title}</h1>
                    {searchTerm && !isLoading && (
                        <p className="mt-2 text-gray-400">
                            {results.length} result{results.length !== 1 ? 's' : ''} found
                        </p>
                    )}
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <LoadingSpinner />
                    </div>
                ) : !searchTerm ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <p className="text-lg text-gray-400">{emptyMessage}</p>
                    </div>
                ) : results.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <p className="text-lg text-gray-400">No results found for &#34;{searchTerm}&#34;</p>
                        <p className="mt-2 text-sm text-gray-500">Try different keywords</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                        {results.map((item, index) => (
                            <MediaCard key={`${item.mediaType}-${item.id}-${index}`} item={item} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function SearchResults(props: SearchResultsProps) {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen items-center justify-center bg-black pt-24">
                    <LoadingSpinner />
                </div>
            }
        >
            <SearchResultsContent {...props} />
        </Suspense>
    );
}
