'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function UploadPage() {
    const router = useRouter()

    useEffect(() => {
        // Redirect to home page when someone directly accesses /upload
        router.replace('/')
    }, [router])

    // Show nothing while redirecting
    return null
}