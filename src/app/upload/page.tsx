'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUploadImage } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Upload, AlertCircle, Images, SquarePlus } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function UploadPage() {
    const router = useRouter()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [isHovering, setIsHovering] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [customName, setCustomName] = useState('')
    const uploadMutation = useUploadImage()

    // Cleanup preview URL on unmount
    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl)
            }
        }
    }, [previewUrl])

    const handleFileSelect = (file: File) => {
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file')
            return
        }
        setSelectedFile(file)
        setCustomName(file.name.replace(/\.[^/.]+$/, '')) // Remove extension

        // Create preview URL
        const url = URL.createObjectURL(file)
        setPreviewUrl(url)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)

        const files = e.dataTransfer.files
        if (files.length > 0) {
            handleFileSelect(files[0])
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (files && files.length > 0) {
            handleFileSelect(files[0])
        }
    }

    const handleUpload = async () => {
        if (!selectedFile) return

        try {
            await uploadMutation.mutateAsync({
                file: selectedFile,
                name: customName || selectedFile.name
            })

            // Navigate back to gallery
            router.push('/')
        } catch (error) {
            console.error('Upload failed:', error)
        }
    }

    const isUploading = uploadMutation.isPending

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-md mx-auto">
                <h1 className="text-2xl font-bold mb-6">Upload Image</h1>

                <div className="w-full">
                    {/* Dropzone */}
                    <div
                        className={cn(
                            "border-2 border-dashed rounded-lg p-12 text-center transition-all cursor-pointer min-h-[200px] flex flex-col items-center justify-center border-slate-300 hover:border-slate-400 hover:bg-slate-50",
                            isDragging && "bg-sky-100 border-sky-300",
                            selectedFile && "border-green-500 bg-green-50"
                        )}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onMouseEnter={() => setIsHovering(true)}
                        onMouseLeave={() => setIsHovering(false)}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileInputChange}
                            className="hidden"
                            disabled={isUploading}
                        />

                        {selectedFile ? (
                            <div className="space-y-4 w-full">
                                {/* Image Preview */}
                                <div className="relative w-full max-w-xs mx-auto">
                                    <img
                                        src={previewUrl || ''}
                                        alt="Preview"
                                        className="w-full h-48 object-cover rounded-lg border"
                                    />
                                </div>

                                {/* Badges */}
                                <div className="flex flex-wrap gap-2 justify-center">
                                    <Badge variant="secondary" className="text-xs">
                                        {selectedFile.name}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                    </Badge>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center gap-4">
                                {isDragging ? (
                                    <SquarePlus className="size-18 m-6 text-sky-400" />
                                ) : (
                                    <div className="flex flex-col items-center gap-2">
                                        <Images className="size-12 text-muted-foreground" />

                                        <span className={cn(
                                            "font-medium transition-colors",
                                            isDragging ? "text-white" : "text-slate-700"
                                        )}>
                                            Drag an image here or
                                        </span>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                fileInputRef.current?.click()
                                            }}
                                        >
                                            upload a file
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Custom Name Input */}
                    {selectedFile && (
                        <div className="mt-4 space-y-2">
                            <label className="text-sm font-medium">Custom Name (Optional)</label>
                            <Input
                                type="text"
                                value={customName}
                                onChange={(e) => setCustomName(e.target.value)}
                                placeholder="Enter custom name..."
                                disabled={isUploading}
                            />
                        </div>
                    )}

                    {/* Upload Button */}
                    {selectedFile && (
                        <Button
                            onClick={handleUpload}
                            className="w-full mt-4"
                            disabled={isUploading}
                        >
                            {isUploading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload Image
                                </>
                            )}
                        </Button>
                    )}

                    {/* Error Message */}
                    {uploadMutation.isError && (
                        <Alert variant="destructive" className="mt-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                {uploadMutation.error instanceof Error
                                    ? uploadMutation.error.message
                                    : 'Failed to upload image. Please try again.'}
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
            </div>
        </div>
    )
}