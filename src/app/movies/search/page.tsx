import SearchResults from '@/components/search/SearchResults';

export default function MoviesSearchPage() {
    return (
        <SearchResults
            context="movies"
            title="Search Movies"
            emptyMessage="Search for movies"
        />
    );
}
