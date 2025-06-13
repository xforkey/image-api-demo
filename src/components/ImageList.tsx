'use client'

import { useState } from 'react'
import { useOptimizedSearch } from '@/hooks/useOptimizedSearch'
import { useDeleteImage, type ImageMetadata } from '@/lib/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import ImageCard from './ImageCard'

interface ImageListProps {
    searchQuery: string
}

export default function ImageList({ searchQuery }: ImageListProps) {
    const { data, isLoading, isSearching, error } = useOptimizedSearch(searchQuery)
    const deleteImageMutation = useDeleteImage()
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [imageToDelete, setImageToDelete] = useState<string | null>(null)

    const handleDeleteClick = (id: string) => {
        setImageToDelete(id)
        setDeleteDialogOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (!imageToDelete) return

        try {
            await deleteImageMutation.mutateAsync(imageToDelete)
            setDeleteDialogOpen(false)
            setImageToDelete(null)
        } catch (error) {
            console.error('Delete failed:', error)
            // Keep dialog open and show error state
        }
    }

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false)
        setImageToDelete(null)
    }

    if (isLoading) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <div className="text-lg">Loading images...</div>
            </div>
        )
    }

    if (error) {
        throw error // Let error.tsx handle it
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">Image Gallery</h2>
                <div className="flex items-center gap-2">
                    {isSearching && (
                        <div className="text-sm text-muted-foreground">Searching...</div>
                    )}
                    <Badge variant="secondary" className="text-sm">
                        {data?.total || 0} images
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data?.images.map((image: ImageMetadata) => (
                    <ImageCard
                        key={image.id}
                        image={image}
                        onDelete={handleDeleteClick}
                    />
                ))}
            </div>

            {data?.images.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">
                        {searchQuery ? 'No images found matching your search' : 'No images found'}
                    </p>
                </div>
            )}

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Image</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this image? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={handleDeleteCancel}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            disabled={deleteImageMutation.isPending}
                            className="bg-destructive/80 text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleteImageMutation.isPending ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}