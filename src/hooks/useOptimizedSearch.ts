import { useMemo } from 'react'
import { useFetchLatestImages, useFetchImages, type ImagesResponse } from '@/lib/api'
import useDebounce from './useDebounce'

export function useOptimizedSearch(searchTerm: string) {
    // Get latest images from cache (instant feedback)
    const latestImagesQuery = useFetchLatestImages(50)

    // Client-side filter for instant results
    const clientFiltered = useMemo(() => {
        if (!searchTerm || !latestImagesQuery.data) return latestImagesQuery.data

        const filtered = latestImagesQuery.data.images.filter(image =>
            image.name.toLowerCase().includes(searchTerm.toLowerCase())
        )

        return {
            ...latestImagesQuery.data,
            images: filtered,
            total: filtered.length,
            search: searchTerm
        }
    }, [searchTerm, latestImagesQuery.data])

    // Debounced server search (300ms delay)
    const debouncedSearch = useDebounce(searchTerm, 300)
    const serverSearchQuery = useFetchImages(debouncedSearch, 50, {
        enabled: !!debouncedSearch && debouncedSearch.length >= 2
    })

    // Return server results if available, otherwise client-filtered
    return {
        data: (serverSearchQuery.data || clientFiltered) as ImagesResponse | undefined,
        isLoading: latestImagesQuery.isLoading,
        isSearching: serverSearchQuery.isFetching,
        error: serverSearchQuery.error || latestImagesQuery.error
    }
}