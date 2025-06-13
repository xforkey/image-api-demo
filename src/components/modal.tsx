'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { Button } from './ui/button'

interface ModalProps {
    children: React.ReactNode
    onClose?: () => void
}

export default function Modal({ children, onClose }: ModalProps) {
    const router = useRouter()

    const handleClose = () => {
        if (onClose) {
            onClose()
        } else {
            router.back()
        }
    }

    // Handle Escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                handleClose()
            }
        }

        document.addEventListener('keydown', handleEscape)
        return () => document.removeEventListener('keydown', handleEscape)
    }, [])

    // Prevent body scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [])

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal Content */}
            <div className="relative z-10 w-full max-w-lg mx-4">
                <div className="bg-background rounded-lg shadow-lg border">
                    {/* Close Button */}
                    <div className="absolute right-4 top-4 z-10">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleClose}
                            className="h-8 w-8"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Modal Body */}
                    {children}
                </div>
            </div>
        </div>
    )
}