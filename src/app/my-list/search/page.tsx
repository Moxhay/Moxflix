import SearchResults from '@/components/search/SearchResults';

export default function MyListSearchPage() {
    return (
        <SearchResults
            context="favorites"
            title="Search My List"
            emptyMessage="Search in your favorites"
        />
    );
}
