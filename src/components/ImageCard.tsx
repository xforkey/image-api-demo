'use client'

import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ImageMetadata } from '@/lib/api'

interface ImageCardProps {
    image: ImageMetadata
    onDelete?: (id: string) => void
}

export default function ImageCard({ image, onDelete }: ImageCardProps) {
    const [isLoaded, setIsLoaded] = useState(false)
    const [isInView, setIsInView] = useState(false)
    const [isHovered, setIsHovered] = useState(false)
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
            className="relative aspect-square bg-muted overflow-hidden rounded-lg group cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {isInView && (
                <Image
                    src={`/api/v1/images/${image.id}/file`}
                    alt={image.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    unoptimized // since it's a dynamic endpoint
                    onLoadingComplete={() => setIsLoaded(true)}
                    className={cn(
                        'object-cover transition-all duration-300',
                        isLoaded ? 'opacity-100' : 'opacity-0',
                        'group-hover:scale-105'
                    )}
                />
            )}

            {!isLoaded && isInView && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-pulse bg-muted-foreground/20 w-8 h-8 rounded" />
                </div>
            )}

            {/* Hover overlay */}
            <div className={cn(
                'absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 transition-all duration-300',
                isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            )}>
                <div className="flex items-center justify-between text-white">
                    <h3 className="font-medium text-sm truncate flex-1 mr-2" title={image.name}>
                        {image.name}
                    </h3>
                    {onDelete && (
                        <Button
                            size="icon"
                            onClick={e => { e.stopPropagation(); onDelete(image.id) }}
                            className="hover:text-white hover:bg-red-600 transition-colors"
                        >
                            <Trash2 />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}
