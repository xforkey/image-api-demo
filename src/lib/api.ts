import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// Types
export interface ImageMetadata {
    id: string
    filename: string
    name: string
}

export interface ImagesResponse {
    images: ImageMetadata[]
    total: number
    search: string | null
}

export interface UploadImageData {
    file: File
    name?: string
}

export interface UpdateImageData {
    name?: string
}

// API functions
const API_BASE = '/api/v1/images'

async function fetchImages(search?: string): Promise<ImagesResponse> {
    const url = search ? `${API_BASE}?search=${encodeURIComponent(search)}` : API_BASE
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
export function useFetchImages(search?: string) {
    return useQuery({
        queryKey: ['images', search],
        queryFn: () => fetchImages(search),
        staleTime: 5 * 60 * 1000, // 5 minutes
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
        onSuccess: () => {
            // Invalidate and refetch images list
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