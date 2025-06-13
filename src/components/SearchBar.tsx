'use client'

import { Input } from '@/components/ui/input'

interface SearchBarProps {
    value: string
    onChange: (value: string) => void
    isSearching?: boolean
}

export default function SearchBar({ value, onChange, isSearching }: SearchBarProps) {
    return (
        <div className="relative">
            <Input
                type="text"
                placeholder="Search images..."
                className="max-w-xs"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
            {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                </div>
            )}
        </div>
    )
}