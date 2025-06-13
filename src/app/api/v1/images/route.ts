import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Validation schemas
const SearchParamsSchema = z.object({
    search: z.string().optional()
})

const UploadSchema = z.object({
    name: z.string().optional()
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
            search: searchParams.get('search') || undefined
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

        // Validate optional fields
        const validatedData = UploadSchema.parse({
            name: name || undefined
        })

        // TODO: Implement image upload
        return NextResponse.json({
            message: 'POST /api/v1/images - not implemented yet',
            file: { name: file.name, type: file.type, size: file.size },
            data: validatedData
        })
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