import SearchResults from '@/components/search/SearchResults';

export default function SearchPage() {
    return (
        <SearchResults
            context="all"
            title="Search"
            emptyMessage="Search for movies and series"
        />
    );
}
