import { useFetchImages, type ImagesResponse } from '@/lib/api'
import useDebounce from './useDebounce'

export function useOptimizedSearch(searchTerm: string) {
    // Debounce search term to avoid excessive API calls
    const debouncedSearch = useDebounce(searchTerm, 300)

    // Use React Query's built-in features for smooth UX
    const query = useFetchImages(debouncedSearch, 50, {
        keepPreviousData: true,  // Show previous results while loading new ones
        staleTime: 5 * 60 * 1000, // 5 minutes - good for demo with mostly static images
        placeholderData: (previousData: ImagesResponse | undefined) => {
            // If we have previous data and we're searching, filter it client-side for instant feedback
            if (previousData && searchTerm && !debouncedSearch) {
                const filtered = previousData.images.filter(image =>
                    image.name.toLowerCase().includes(searchTerm.toLowerCase())
                )
                return {
                    ...previousData,
                    images: filtered,
                    total: filtered.length
                }
            }
            return previousData
        }
    })

    return {
        data: query.data as ImagesResponse | undefined,
        isLoading: query.isLoading,
        isSearching: query.isFetching && !!debouncedSearch,
        error: query.error
    }
}