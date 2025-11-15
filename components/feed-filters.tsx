"use client"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import dynamic from "next/dynamic"

const TrendingUp = dynamic(() => import("lucide-react").then((m) => m.TrendingUp), { ssr: false })
const Clock = dynamic(() => import("lucide-react").then((m) => m.Clock), { ssr: false })
const MessageCircle = dynamic(() => import("lucide-react").then((m) => m.MessageCircle), { ssr: false })
const Users = dynamic(() => import("lucide-react").then((m) => m.Users), { ssr: false })

export type FeedSortOption = 'latest' | 'trending' | 'most-commented' | 'following'

interface FeedFiltersProps {
  currentSort: FeedSortOption
  onSortChange: (sort: FeedSortOption) => void
  isLoading?: boolean
}

const sortOptions: Array<{ value: FeedSortOption; label: string; icon: React.ReactNode }> = [
  { value: 'latest', label: 'Latest Posts', icon: <Clock className="h-4 w-4" /> },
  { value: 'trending', label: 'Trending', icon: <TrendingUp className="h-4 w-4" /> },
  { value: 'most-commented', label: 'Most Commented', icon: <MessageCircle className="h-4 w-4" /> },
  { value: 'following', label: 'Following', icon: <Users className="h-4 w-4" /> },
]

export function FeedFilters({ currentSort, onSortChange, isLoading }: FeedFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-6">
      <span className="text-sm font-medium text-muted-foreground">Sort by:</span>
      <div className="flex flex-wrap gap-2">
        {sortOptions.map((option) => (
          <Button
            key={option.value}
            variant={currentSort === option.value ? "default" : "outline"}
            size="sm"
            onClick={() => onSortChange(option.value)}
            disabled={isLoading}
            className="gap-2"
          >
            {option.icon}
            <span className="hidden sm:inline">{option.label}</span>
            <span className="sm:hidden text-xs">{option.label.split(' ')[0]}</span>
          </Button>
        ))}
      </div>
    </div>
  )
}
