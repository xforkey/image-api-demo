import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
    return (
        <div className="min-h-screen p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <Skeleton className="h-9 w-64" />
                    <Skeleton className="h-6 w-20" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <Card key={i} className="overflow-hidden">
                            <CardContent className="p-0">
                                <Skeleton className="aspect-square w-full" />
                            </CardContent>
                            <CardFooter className="p-4">
                                <div className="w-full space-y-2">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-3 w-20" />
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}