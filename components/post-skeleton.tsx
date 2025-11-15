"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

export function PostSkeleton() {
  return (
    <Card className="border-primary/10 bg-card/80 backdrop-blur-sm animate-pulse">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-muted flex-shrink-0" />
          <div className="flex-1">
            <div className="h-4 bg-muted rounded w-32 mb-2" />
            <div className="h-3 bg-muted rounded w-24" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 pb-3">
        <div>
          <div className="h-5 bg-muted rounded w-2/3 mb-2" />
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-2/3" />
          </div>
        </div>
        <div className="rounded-xl w-full h-80 sm:h-96 bg-muted" />
      </CardContent>
      <CardFooter className="flex gap-2 sm:gap-4 border-t border-border/40 pt-3">
        <div className="h-9 bg-muted rounded flex-1 sm:flex-none" />
        <div className="h-9 bg-muted rounded flex-1 sm:flex-none" />
        <div className="h-9 bg-muted rounded flex-1 sm:flex-none" />
      </CardFooter>
    </Card>
  )
}

export function PostSkeletonLoader({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4 sm:space-y-6">
      {Array.from({ length: count }).map((_, i) => (
        <PostSkeleton key={i} />
      ))}
    </div>
  )
}
