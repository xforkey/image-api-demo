import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Validation schemas
const UpdateImageSchema = z.object({
    name: z.string().min(1, 'Name is required').optional(),
    description: z.string().optional()
})

const ParamsSchema = z.object({
    id: z.string().min(1, 'Image ID is required')
})

/**
 * PUT /api/v1/images/:id
 * Update image metadata (name, description)
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Await and validate route parameters
        const resolvedParams = await params
        const validatedParams = ParamsSchema.parse(resolvedParams)

        // Parse and validate request body
        const body = await request.json()
        const validatedData = UpdateImageSchema.parse(body)

        // Get database instance
        const { getDb } = await import('@/lib/db')
        const db = await getDb()

        // Find the image to update
        const imageIndex = db.data.images.findIndex(img => img.id === validatedParams.id)

        if (imageIndex === -1) {
            return NextResponse.json(
                { error: 'Image not found' },
                { status: 404 }
            )
        }

        // Update the image metadata
        const currentImage = db.data.images[imageIndex]
        const updatedImage = {
            ...currentImage,
            ...(validatedData.name && { name: validatedData.name })
        }

        db.data.images[imageIndex] = updatedImage
        await db.write()

        return NextResponse.json(updatedImage)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid data', details: error.errors },
                { status: 400 }
            )
        }

        console.error('PUT /api/v1/images/:id error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

/**
 * DELETE /api/v1/images/:id
 * Delete an image and its metadata
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Await and validate route parameters
        const resolvedParams = await params
        const validatedParams = ParamsSchema.parse(resolvedParams)

        // Get database instance
        const { getDb } = await import('@/lib/db')
        const db = await getDb()

        // Find the image to delete
        const imageIndex = db.data.images.findIndex(img => img.id === validatedParams.id)

        if (imageIndex === -1) {
            return NextResponse.json(
                { error: 'Image not found' },
                { status: 404 }
            )
        }

        const imageToDelete = db.data.images[imageIndex]

        // Delete file from storage
        const { deleteFile } = await import('@/lib/storage')
        await deleteFile(imageToDelete.filename)

        // Remove from database
        db.data.images.splice(imageIndex, 1)
        await db.write()

        return NextResponse.json({
            message: 'Image deleted successfully',
            id: validatedParams.id
        })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid image ID', details: error.errors },
                { status: 400 }
            )
        }

        console.error('DELETE /api/v1/images/:id error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

/**
 * GET /api/v1/images/:id
 * Get a specific image's metadata
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Await and validate route parameters
        const resolvedParams = await params
        const validatedParams = ParamsSchema.parse(resolvedParams)

        // Get database instance
        const { getDb } = await import('@/lib/db')
        const db = await getDb()

        // Find the image
        const image = db.data.images.find(img => img.id === validatedParams.id)

        if (!image) {
            return NextResponse.json(
                { error: 'Image not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(image)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid image ID', details: error.errors },
                { status: 400 }
            )
        }

        console.error('GET /api/v1/images/:id error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}