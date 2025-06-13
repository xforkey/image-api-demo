'use client'

import Image from 'next/image'
import { useState, useRef, useEffect, memo } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import type { ImageMetadata } from '@/lib/api'

interface ImageCardProps {
    image: ImageMetadata
    onDelete?: (id: string) => void
    priority?: boolean
}

function ImageCard({ image, onDelete, priority = false }: ImageCardProps) {
    const [isLoaded, setIsLoaded] = useState(false)
    const [isInView, setIsInView] = useState(false)
    const imgRef = useRef<HTMLDivElement>(null)

    // Lazy-load via Intersection Observer
    useEffect(() => {
        const obs = new IntersectionObserver(
            ([entry]) => setIsInView(entry.isIntersecting),
            { threshold: 0.1, rootMargin: '50px' }
        )
        if (imgRef.current) obs.observe(imgRef.current)
        return () => obs.disconnect()
    }, [])

    return (
        <div
            ref={imgRef}
            className="relative aspect-square bg-muted overflow-hidden rounded-lg group cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            tabIndex={0}
            role="img"
            aria-label={`Image: ${image.name}`}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    // Could trigger a view action here if needed
                }
            }}
        >
            {(isInView || priority) && (
                <Image
                    src={`/api/v1/images/${image.id}/file`}
                    alt={image.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    priority={priority}
                    unoptimized // since it's a dynamic endpoint
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                    onLoadingComplete={() => setIsLoaded(true)}
                    className="will-change-transform will-change-opacity object-cover transition-transform duration-300 group-hover:scale-105"
                />
            )}

            {!isLoaded && (isInView || priority) && (
                <div className="absolute inset-0 bg-muted animate-pulse">
                    <div className="absolute inset-0 bg-gradient-to-br from-muted-foreground/10 to-muted-foreground/5" />
                </div>
            )}

            {/* Hover overlay */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 transition-transform duration-300 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0">
                <div className="flex items-center justify-between text-white">
                    <h3 className="font-medium text-sm truncate flex-1 mr-2" title={image.name}>
                        {image.name}
                    </h3>
                    {onDelete && (
                        <Button
                            size="icon"
                            onClick={e => { e.stopPropagation(); onDelete(image.id) }}
                            className="hover:text-white hover:bg-red-600 transition-colors duration-200"
                            aria-label={`Delete image ${image.name}`}
                        >
                            <Trash2 aria-hidden="true" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default memo(ImageCard)
