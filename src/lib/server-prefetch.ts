import { ImagesResponse } from './api'

export async function prefetchImages(): Promise<ImagesResponse> {
    // Internal server-side fetch to our own API
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    try {
        const response = await fetch(`${baseUrl}/api/v1/images`, {
            // Server-side fetch optimizations
            cache: 'force-cache',
            next: { revalidate: 300 }, // 5 minutes
            headers: {
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) {
            throw new Error(`Failed to prefetch images: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        return data
    } catch (error) {
        console.error('Server-side prefetch error:', error)
        throw new Error(`Failed to prefetch images: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
}