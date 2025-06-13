import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import path from 'path'

// Define the structure of our image metadata
export interface ImageMetadata {
    id: string
    filename: string
    originalName: string
    name?: string
    description?: string
    width: number
    height: number
    size: number
    mimeType: string
    uploadedAt: string
}

// Define the database schema
interface DatabaseSchema {
    images: ImageMetadata[]
}

// Create the database instance
const file = path.join(process.cwd(), 'metadata.json')
const adapter = new JSONFile<DatabaseSchema>(file)
const defaultData: DatabaseSchema = { images: [] }

export const db = new Low(adapter, defaultData)

// Initialize the database
export async function initDb() {
    await db.read()

    // If the file is empty or doesn't have the expected structure, set default data
    if (!db.data || !Array.isArray(db.data.images)) {
        db.data = defaultData
        await db.write()
    }
}

// Helper function to ensure db is initialized before operations
export async function getDb() {
    await initDb()
    return db
}