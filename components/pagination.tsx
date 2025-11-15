"use client"

import { Button } from "@/components/ui/button"
import dynamic from "next/dynamic"

const ChevronLeft = dynamic(() => import("lucide-react").then((m) => m.ChevronLeft), { ssr: false })
const ChevronRight = dynamic(() => import("lucide-react").then((m) => m.ChevronRight), { ssr: false })

interface PaginationProps {
  hasNextPage: boolean
  hasPreviousPage: boolean
  onNextPage: () => void
  onPreviousPage: () => void
  isLoading?: boolean
  currentPage?: number
}

export function Pagination({
  hasNextPage,
  hasPreviousPage,
  onNextPage,
  onPreviousPage,
  isLoading,
  currentPage = 1,
}: PaginationProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-6 border-t border-border/40">
      <Button
        variant="outline"
        size="sm"
        onClick={onPreviousPage}
        disabled={!hasPreviousPage || isLoading}
        className="gap-2"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Previous</span>
      </Button>

      <span className="text-sm text-muted-foreground">
        Page {currentPage}
      </span>

      <Button
        variant="outline"
        size="sm"
        onClick={onNextPage}
        disabled={!hasNextPage || isLoading}
        className="gap-2"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
