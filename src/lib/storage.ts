import fs from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'

// Storage configuration
const STORAGE_DIR = path.join(process.cwd(), 'downloads')

// Ensure storage directory exists
async function ensureStorageDir() {
    try {
        await fs.access(STORAGE_DIR)
    } catch {
        await fs.mkdir(STORAGE_DIR, { recursive: true })
    }
}

// Generate a unique filename based on unique ID
function generateFilename(originalName: string, id: string): string {
    const ext = path.extname(originalName)
    return `${id}${ext}`
}

/**
 * Save an uploaded file to the storage directory
 * @param file - The uploaded file
 * @returns Promise with id and filename
 */
export async function saveFile(file: File): Promise<{ id: string; filename: string }> {
    await ensureStorageDir()

    // Generate unique ID for this upload
    const id = randomUUID()

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Generate unique filename based on ID
    const filename = generateFilename(file.name, id)
    const filePath = path.join(STORAGE_DIR, filename)

    // Write file to storage (each upload gets its own file)
    await fs.writeFile(filePath, buffer)

    return { id, filename }
}

/**
 * Delete a file from the storage directory
 * @param filename - The filename to delete
 */
export async function deleteFile(filename: string): Promise<void> {
    const filePath = path.join(STORAGE_DIR, filename)

    try {
        await fs.unlink(filePath)
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            // File doesn't exist, which is fine for delete operation
            return
        }
        throw error
    }
}

/**
 * Check if a file exists in storage
 * @param filename - The filename to check
 * @returns Promise<boolean>
 */
export async function fileExists(filename: string): Promise<boolean> {
    const filePath = path.join(STORAGE_DIR, filename)

    try {
        await fs.access(filePath)
        return true
    } catch {
        return false
    }
}

/**
 * Get file stats
 * @param filename - The filename to get stats for
 * @returns Promise with file stats
 */
export async function getFileStats(filename: string): Promise<{ size: number; mtime: Date }> {
    const filePath = path.join(STORAGE_DIR, filename)
    const stats = await fs.stat(filePath)

    return {
        size: stats.size,
        mtime: stats.mtime
    }
}