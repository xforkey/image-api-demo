'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Upload } from 'lucide-react'
import GalleryView from '@/components/GalleryView'

export default function Home() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  const handleUploadClick = () => {
    router.push('/upload')
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Input
            type="text"
            placeholder="Search images..."
            className="max-w-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button onClick={handleUploadClick} className="gap-2">
            <Upload className="h-4 w-4" />
            UPLOAD
          </Button>
        </div>

        <GalleryView searchQuery={searchQuery} />
      </div>
    </div>
  )
}
