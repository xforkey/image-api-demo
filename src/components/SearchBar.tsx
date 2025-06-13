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
            <label htmlFor="search-images" className="sr-only">
                Search images
            </label>
            <Input
                id="search-images"
                type="text"
                placeholder="Search images..."
                className="max-w-xs"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                aria-describedby={isSearching ? "search-status" : undefined}
            />
            {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div
                        className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"
                        aria-hidden="true"
                    />
                    <span id="search-status" className="sr-only">
                        Searching for images...
                    </span>
                </div>
            )}
        </div>
    )
}