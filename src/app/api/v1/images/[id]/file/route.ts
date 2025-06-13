import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'
import { getDb } from '@/lib/db'

const STORAGE_DIR = path.join(process.cwd(), 'downloads')

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        // Get image metadata from database
        const db = await getDb()
        const image = db.data.images.find(img => img.id === id)

        if (!image) {
            return NextResponse.json(
                { error: 'Image not found' },
                { status: 404 }
            )
        }

        // Read the file from storage
        const filePath = path.join(STORAGE_DIR, image.filename)

        try {
            const fileBuffer = await readFile(filePath)

            // Determine content type based on file extension
            const ext = path.extname(image.filename).toLowerCase()
            let contentType = 'image/jpeg' // default

            switch (ext) {
                case '.png':
                    contentType = 'image/png'
                    break
                case '.gif':
                    contentType = 'image/gif'
                    break
                case '.webp':
                    contentType = 'image/webp'
                    break
                case '.jpg':
                case '.jpeg':
                    contentType = 'image/jpeg'
                    break
            }

            // Return the image file with proper headers
            return new NextResponse(fileBuffer, {
                headers: {
                    'Content-Type': contentType,
                    'Cache-Control': 'public, max-age=31536000, immutable',
                },
            })
        } catch (fileError) {
            console.error('Error reading file:', fileError)
            return NextResponse.json(
                { error: 'File not found on disk' },
                { status: 404 }
            )
        }
    } catch (error) {
        console.error('Error serving image:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}