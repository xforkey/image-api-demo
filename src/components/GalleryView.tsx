'use client'

import { useFetchImages } from '@/lib/api'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface GalleryViewProps {
    searchQuery?: string
}

export default function GalleryView({ searchQuery }: GalleryViewProps) {
    const { data, isLoading, error } = useFetchImages(searchQuery)

    // With server-side hydration, isLoading should be false immediately
    // But we keep this for client-side navigation scenarios
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
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
                <Badge variant="secondary" className="text-sm">
                    {data?.total || 0} images
                </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data?.images.map((image) => (
                    <Card key={image.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                        <CardContent className="p-0">
                            <div className="aspect-square bg-muted overflow-hidden">
                                <img
                                    src={`/api/v1/images/${image.id}/file`}
                                    alt={image.name}
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                    loading="lazy"
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="p-4">
                            <div className="w-full">
                                <h3 className="font-medium text-sm truncate mb-2" title={image.name}>
                                    {image.name}
                                </h3>
                                <Badge variant="outline" className="text-xs">
                                    {image.id}
                                </Badge>
                            </div>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {data?.images.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">No images found</p>
                </div>
            )}
        </div>
    )
}