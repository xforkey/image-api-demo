import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// Types
export interface ImageMetadata {
    id: string
    filename: string
    name: string
    uploadedAt?: string
    width?: number
    height?: number
}

export interface ImagesResponse {
    images: ImageMetadata[]
    total: number
    search: string | null
}

export interface UploadImageData {
    file: File
    name?: string
    width?: number
    height?: number
}

export interface UpdateImageData {
    name?: string
}

// API functions
const API_BASE = '/api/v1/images'

async function fetchImages(search?: string, limit = 50): Promise<ImagesResponse> {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    params.set('sort', 'uploadedAt')
    params.set('order', 'desc')
    params.set('limit', limit.toString())

    const url = `${API_BASE}?${params.toString()}`
    const response = await fetch(url)

    if (!response.ok) {
        throw new Error(`Failed to fetch images: ${response.statusText}`)
    }

    return response.json()
}

async function fetchImage(id: string): Promise<ImageMetadata> {
    const response = await fetch(`${API_BASE}/${id}`)

    if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`)
    }

    return response.json()
}

async function uploadImage(data: UploadImageData): Promise<ImageMetadata> {
    const formData = new FormData()
    formData.append('file', data.file)
    if (data.name) {
        formData.append('name', data.name)
    }
    if (data.width) {
        formData.append('width', data.width.toString())
    }
    if (data.height) {
        formData.append('height', data.height.toString())
    }

    const response = await fetch(API_BASE, {
        method: 'POST',
        body: formData,
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || `Failed to upload image: ${response.statusText}`)
    }

    return response.json()
}

async function updateImage(id: string, data: UpdateImageData): Promise<ImageMetadata> {
    const response = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || `Failed to update image: ${response.statusText}`)
    }

    return response.json()
}

async function deleteImage(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || `Failed to delete image: ${response.statusText}`)
    }
}

// React Query hooks
export function useFetchImages(search?: string, limit = 50, options?: Record<string, unknown>) {
    return useQuery({
        queryKey: ['images', search || 'latest', limit],
        queryFn: () => fetchImages(search, limit),
        staleTime: 1 * 60 * 1000, // 1 minute
        refetchOnWindowFocus: true,
        ...options
    })
}

export function useFetchLatestImages(limit = 50) {
    return useQuery({
        queryKey: ['images', 'latest', limit],
        queryFn: () => fetchImages(undefined, limit),
        staleTime: 1 * 60 * 1000,
        refetchOnWindowFocus: true,
    })
}

export function useFetchImage(id: string) {
    return useQuery({
        queryKey: ['images', id],
        queryFn: () => fetchImage(id),
        enabled: !!id,
    })
}

export function useUploadImage() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: uploadImage,
        onSuccess: (newImage) => {
            // Optimistic update - add new image to top of latest images
            queryClient.setQueryData(['images', 'latest', 50], (old: ImagesResponse | undefined) => {
                if (!old) return { images: [newImage], total: 1, search: null }
                return {
                    ...old,
                    images: [newImage, ...old.images].slice(0, 50),
                    total: old.total + 1
                }
            })

            // Also invalidate to ensure fresh data
            queryClient.invalidateQueries({ queryKey: ['images'] })
        },
    })
}

export function useUpdateImage() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateImageData }) =>
            updateImage(id, data),
        onSuccess: (updatedImage) => {
            // Update the specific image in cache
            queryClient.setQueryData(['images', updatedImage.id], updatedImage)
            // Invalidate images list to reflect changes
            queryClient.invalidateQueries({ queryKey: ['images'] })
        },
    })
}

export function useDeleteImage() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: deleteImage,
        onSuccess: (_, deletedId) => {
            // Remove the specific image from cache
            queryClient.removeQueries({ queryKey: ['images', deletedId] })
            // Invalidate images list to reflect changes
            queryClient.invalidateQueries({ queryKey: ['images'] })
        },
    })
}