"use client"

import { useState, useEffect, useCallback } from "react"
import { PostCard } from "@/components/post-card"
import { FeedFilters, FeedSortOption } from "@/components/feed-filters"
import { Pagination } from "@/components/pagination"
import { PostSkeletonLoader } from "@/components/post-skeleton"
import { Card } from "@/components/ui/card"
import Icon from "@/components/ui/icon"
import { useToast } from "@/hooks/use-toast"

interface Post {
  id: string
  title: string
  content: string
  media_url?: string
  created_at: string
  artist: {
    id: string
    stage_name: string
    profile: {
      avatar_url?: string
    }
  }
  likes: { id: string }[]
  comments: { id: string }[]
  user_liked: boolean
}

interface FeedDisplayProps {
  initialPosts: Post[]
  userId: string
}

export function FeedDisplay({ initialPosts, userId }: FeedDisplayProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [sortBy, setSortBy] = useState<FeedSortOption>("latest")
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Client-side sorting and pagination logic
  const handleSortChange = useCallback(
    (newSort: FeedSortOption) => {
      setSortBy(newSort)
      setCurrentPage(1)

      // Sort posts based on selected option
      let sorted = [...initialPosts]
      switch (newSort) {
        case "trending": {
          // Sort by engagement (likes + comments), then by recency
          sorted.sort((a, b) => {
            const aEngagement = a.likes.length + a.comments.length
            const bEngagement = b.likes.length + b.comments.length
            if (aEngagement !== bEngagement) {
              return bEngagement - aEngagement
            }
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          })
          break
        }
        case "most-commented": {
          // Sort by comment count
          sorted.sort((a, b) => b.comments.length - a.comments.length)
          break
        }
        case "following": {
          // This would require subscription data - for now just show latest
          sorted.sort(
            (a, b) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
          break
        }
        case "latest":
        default: {
          sorted.sort(
            (a, b) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
        }
      }

      setPosts(sorted)
    },
    [initialPosts]
  )

  const PAGE_SIZE = 20
  const startIdx = (currentPage - 1) * PAGE_SIZE
  const endIdx = startIdx + PAGE_SIZE
  const paginatedPosts = posts.slice(startIdx, endIdx)
  const hasNextPage = endIdx < posts.length
  const hasPreviousPage = currentPage > 1

  const handleNextPage = () => {
    if (hasNextPage) {
      setCurrentPage((prev) => prev + 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handlePreviousPage = () => {
    if (hasPreviousPage) {
      setCurrentPage((prev) => prev - 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  if (initialPosts.length === 0) {
    return (
      <Card className="p-8 sm:p-12 text-center border-primary/10 bg-card/50 backdrop-blur-sm">
        <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4 sm:mb-6">
          <Icon name="Sparkles" className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
        </div>
        <p className="text-sm sm:text-base text-muted-foreground">
          No posts yet. Check back soon for updates from artists!
        </p>
      </Card>
    )
  }

  return (
    <div>
      <FeedFilters
        currentSort={sortBy}
        onSortChange={handleSortChange}
        isLoading={isLoading}
      />

      <div className="space-y-4 sm:space-y-6">
        {isLoading ? (
          <PostSkeletonLoader count={3} />
        ) : paginatedPosts.length > 0 ? (
          paginatedPosts.map((post) => <PostCard key={post.id} post={post} />)
        ) : (
          <Card className="p-8 sm:p-12 text-center border-primary/10 bg-card/50 backdrop-blur-sm">
            <p className="text-sm sm:text-base text-muted-foreground">
              No posts found with the selected filters.
            </p>
          </Card>
        )}
      </div>

      {posts.length > PAGE_SIZE && (
        <Pagination
          hasNextPage={hasNextPage}
          hasPreviousPage={hasPreviousPage}
          onNextPage={handleNextPage}
          onPreviousPage={handlePreviousPage}
          isLoading={isLoading}
          currentPage={currentPage}
        />
      )}
    </div>
  )
}
