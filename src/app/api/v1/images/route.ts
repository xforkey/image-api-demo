import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import type { ImageMetadata } from '@/lib/api'

// Validation schemas
const SearchParamsSchema = z.object({
    search: z.string().optional(),
    sort: z.enum(['uploadedAt', 'name']).default('uploadedAt'),
    order: z.enum(['asc', 'desc']).default('desc'),
    limit: z.coerce.number().min(1).max(100).default(50)
})

const UploadSchema = z.object({
    name: z.string().optional(),
    width: z.coerce.number().positive().optional(),
    height: z.coerce.number().positive().optional()
})

/**
 * GET /api/v1/images
 * List all images with optional search filtering
 */
export async function GET(request: NextRequest) {
    try {
        // Parse and validate search parameters
        const { searchParams } = new URL(request.url)
        const params = SearchParamsSchema.parse({
            search: searchParams.get('search') || undefined,
            sort: searchParams.get('sort') || 'uploadedAt',
            order: searchParams.get('order') || 'desc',
            limit: searchParams.get('limit') || '50'
        })

        // Get database instance
        const { getDb } = await import('@/lib/db')
        const db = await getDb()

        // Get all images
        let images = db.data.images

        // Apply search filter if provided
        if (params.search) {
            const searchTerm = params.search.toLowerCase()
            images = images.filter(image =>
                image.name.toLowerCase().includes(searchTerm)
            )
        }

        // Apply sorting (newest first by default)
        if (params.sort === 'uploadedAt') {
            images = images.sort((a: ImageMetadata, b: ImageMetadata) => {
                const aTime = new Date(a.uploadedAt || 0).getTime()
                const bTime = new Date(b.uploadedAt || 0).getTime()
                return params.order === 'desc' ? bTime - aTime : aTime - bTime
            })
        } else if (params.sort === 'name') {
            images = images.sort((a: ImageMetadata, b: ImageMetadata) => {
                const comparison = a.name.localeCompare(b.name)
                return params.order === 'desc' ? -comparison : comparison
            })
        }

        // Apply limit
        images = images.slice(0, params.limit)

        return NextResponse.json({
            images,
            total: images.length,
            search: params.search || null
        })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid parameters', details: error.errors },
                { status: 400 }
            )
        }

        console.error('GET /api/v1/images error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

/**
 * POST /api/v1/images
 * Upload a new image
 */
export async function POST(request: NextRequest) {
    try {
        // Parse multipart form data
        const formData = await request.formData()
        const file = formData.get('file') as File | null
        const name = formData.get('name') as string | null
        const width = formData.get('width') as string | null
        const height = formData.get('height') as string | null

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            )
        }

        // Validate file type (images only)
        if (!file.type.startsWith('image/')) {
            return NextResponse.json(
                { error: 'File must be an image' },
                { status: 400 }
            )
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024 // 5MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: 'File size must be less than 5MB' },
                { status: 400 }
            )
        }

        // Validate specific image formats
        const allowedTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/svg+xml'
        ]

        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: `Unsupported image format: ${file.type}. Allowed formats: JPEG, JPG, PNG, SVG` },
                { status: 400 }
            )
        }

        // Validate optional fields
        const validatedData = UploadSchema.parse({
            name: name || undefined,
            width: width || undefined,
            height: height || undefined
        })

        // Save file to storage
        const { saveFile } = await import('@/lib/storage')
        const { id, filename } = await saveFile(file)

        // Create metadata record
        const imageMetadata = {
            id,
            filename,
            name: validatedData.name || file.name || filename,
            uploadedAt: new Date().toISOString(),
            ...(validatedData.width && { width: validatedData.width }),
            ...(validatedData.height && { height: validatedData.height })
        }

        // Save to database
        const { getDb } = await import('@/lib/db')
        const db = await getDb()
        db.data.images.push(imageMetadata)
        await db.write()

        return NextResponse.json(imageMetadata, { status: 201 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid data', details: error.errors },
                { status: 400 }
            )
        }

        console.error('POST /api/v1/images error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}