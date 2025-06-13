'use client'

import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface ErrorProps {
    error: Error & { digest?: string }
    reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
    return (
        <div className="min-h-screen flex items-center justify-center p-8">
            <div className="max-w-md w-full">
                <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Something went wrong!</AlertTitle>
                    <AlertDescription className="mt-2">
                        {error.message || 'Failed to load the image gallery. Please try again.'}
                    </AlertDescription>
                </Alert>

                <div className="text-center">
                    <Button onClick={reset} className="gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Try again
                    </Button>
                </div>
            </div>
        </div>
    )
}