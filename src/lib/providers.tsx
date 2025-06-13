'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { ImagesResponse } from './api'

interface ProvidersProps {
    children: React.ReactNode
    initialImagesData?: ImagesResponse
}

export function Providers({ children, initialImagesData }: ProvidersProps) {
    const [queryClient] = useState(() => {
        const client = new QueryClient({
            defaultOptions: {
                queries: {
                    // With SSR, we usually want to set some default staleTime
                    // above 0 to avoid refetching immediately on the client
                    staleTime: 60 * 1000, // 1 minute
                    retry: 1,
                },
            },
        })

        // Hydrate the cache with server-side data
        if (initialImagesData) {
            client.setQueryData(['images'], initialImagesData)
        }

        return client
    })

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}