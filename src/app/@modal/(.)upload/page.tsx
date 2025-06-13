'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import NextImage from 'next/image'
import { useUploadImage } from '@/lib/api'
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader } from '@/components/ui/dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Upload, AlertCircle, Images, SquarePlus } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function UploadModal() {
    const router = useRouter()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [customName, setCustomName] = useState('')
    const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null)
    const [validationError, setValidationError] = useState<string | null>(null)
    const uploadMutation = useUploadImage()

    // Cleanup preview URL on unmount
    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl)
            }
        }
    }, [previewUrl])

    // Extract dimensions when file is selected
    useEffect(() => {
        if (!selectedFile) return

        // Create preview URL
        const url = URL.createObjectURL(selectedFile)
        setPreviewUrl(url)

        // Extract dimensions using Image API
        const img = new Image()
        img.src = url
        img.onload = () => {
            setDimensions({ width: img.naturalWidth, height: img.naturalHeight })
        }

        // Cleanup
        return () => {
            img.src = ''
        }
    }, [selectedFile])

    const handleFileSelect = (file: File) => {
        // Clear any previous validation errors
        setValidationError(null)

        // Debug logging
        console.log('File selected:', file.name, 'Size:', file.size, 'bytes', (file.size / 1024 / 1024).toFixed(2), 'MB')

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setValidationError('Please select an image file.')
            return
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024 // 5MB
        console.log('Max size:', maxSize, 'File size:', file.size, 'Over limit:', file.size > maxSize)
        if (file.size > maxSize) {
            setValidationError(`File size must be less than 5MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`)
            return
        }

        // Validate specific image formats
        const allowedTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/svg+xml'
        ]

        if (!allowedTypes.includes(file.type)) {
            setValidationError('Unsupported file format. Please use JPEG, JPG, PNG, or SVG.')
            return
        }

        setSelectedFile(file)
        setCustomName(file.name.replace(/\.[^/.]+$/, '')) // Remove extension
        setDimensions(null) // Reset dimensions
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
            const uploadData = {
                file: selectedFile,
                name: customName || selectedFile.name,
                ...(dimensions && {
                    width: dimensions.width,
                    height: dimensions.height
                })
            }

            await uploadMutation.mutateAsync(uploadData)
            router.back()
        } catch (error) {
            console.error('Upload failed:', error)
        }
    }

    const isUploading = uploadMutation.isPending

    return (
        <Dialog open onOpenChange={(open) => !open && router.back()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader >
                    <VisuallyHidden>
                        <DialogTitle>
                            Upload Image
                        </DialogTitle>
                        <DialogDescription>
                            Drag and drop an image file here, or click to select one.
                        </DialogDescription>
                    </VisuallyHidden>
                </DialogHeader>

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
                    onClick={() => fileInputRef.current?.click()}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            fileInputRef.current?.click()
                        }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label="Upload image file. Click or drag and drop an image here."
                    aria-describedby="upload-constraints"
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
                            <div className="relative w-full max-w-xs mx-auto h-48">
                                {previewUrl && (
                                    <NextImage
                                        src={previewUrl}
                                        alt="Preview"
                                        fill
                                        className="object-cover rounded-lg border"
                                        unoptimized // Since it's a blob URL
                                    />
                                )}
                            </div>

                            {/* Badges */}
                            <div className="flex flex-wrap gap-2 justify-center">
                                <Badge variant="secondary" className="text-xs">
                                    {selectedFile.name}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                </Badge>
                                {dimensions && (
                                    <Badge variant="outline" className="text-xs">
                                        {dimensions.width} × {dimensions.height}
                                    </Badge>
                                )}
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
                                        Upload a File
                                    </Button>

                                    {/* Upload Constraints */}
                                    <div id="upload-constraints" className="mt-3 flex flex-wrap gap-2 justify-center">
                                        <Badge variant="outline" className="text-xs">
                                            Max 5MB
                                        </Badge>
                                        <Badge variant="outline" className="text-xs">
                                            JPEG, JPG, PNG, SVG
                                        </Badge>
                                        <Badge variant="outline" className="text-xs">
                                            Images only
                                        </Badge>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Custom Name Input */}
                {selectedFile && (
                    <div className="mt-4 space-y-2">
                        <label htmlFor="custom-name" className="text-sm font-medium">
                            Custom Name (Optional)
                        </label>
                        <Input
                            id="custom-name"
                            type="text"
                            value={customName}
                            onChange={(e) => setCustomName(e.target.value)}
                            placeholder="Enter custom name..."
                            disabled={isUploading}
                            aria-describedby="custom-name-help"
                        />
                        <p id="custom-name-help" className="text-xs text-muted-foreground">
                            Leave empty to use the original filename
                        </p>
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

                {/* Validation Error Message */}
                {validationError && (
                    <Alert variant="destructive" className="mt-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            {validationError}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Upload Error Message */}
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
            </DialogContent>
        </Dialog>
    )
}