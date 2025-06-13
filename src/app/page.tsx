'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Upload } from 'lucide-react'
import SearchBar from '@/components/SearchBar'
import ImageList from '@/components/ImageList'
import Link from 'next/link'

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-6">
          <h1 className="sr-only">Image Gallery</h1>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
          />
          <Button asChild>
            <Link href="/upload" className='font-medium'><Upload className="h-4 w-4" aria-hidden="true" />
              Upload</Link>
          </Button>
        </header>

        <main>
          <ImageList searchQuery={searchQuery} />
        </main>
      </div>
    </div>
  )
}
