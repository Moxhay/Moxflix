import SearchResults from '@/components/search/SearchResults';

export default function SeriesSearchPage() {
    return (
        <SearchResults
            context="series"
            title="Search Series"
            emptyMessage="Search for series"
        />
    );
}
