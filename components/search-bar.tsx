"use client"

import { Search, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface SearchResult {
  posts: Array<{
    id: string
    title: string
    content: string
    artist: {
      stage_name: string
      profile: {
        avatar_url?: string
      }
    }
    created_at: string
  }>
  artists: Array<{
    id: string
    display_name: string
    avatar_url?: string
    subscription_tier?: string
    role: string
  }>
}

export function SearchBar() {
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [results, setResults] = useState<SearchResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (!query.trim()) {
      setResults(null)
      setIsOpen(false)
      return
    }

    const timer = setTimeout(async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        const data = await response.json()
        setResults(data)
        setIsOpen(true)
      } catch (error) {
        console.error("Search error:", error)
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const handlePostClick = (postId: string) => {
    router.push(`/posts/${postId}`)
    setIsOpen(false)
    setQuery("")
  }

  const handleArtistClick = (artistId: string) => {
    router.push(`/artist/${artistId}`)
    setIsOpen(false)
    setQuery("")
  }

  const handleSearchSubmit = () => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`)
      setIsOpen(false)
    }
  }

  return (
    <div className="relative flex-1 max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search posts, artists..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearchSubmit()
            }
          }}
          onFocus={() => query.trim() && setIsOpen(true)}
          className="pl-9 pr-8 h-9 text-sm"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("")
              setResults(null)
              inputRef.current?.focus()
            }}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && query.trim() && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 z-50 bg-popover border border-border rounded-lg shadow-lg"
        >
          {isLoading && (
            <div className="p-4 text-center">
              <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin inline-block" />
            </div>
          )}

          {!isLoading && results && (results.posts.length === 0 && results.artists.length === 0) && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No results found for "{query}"
            </div>
          )}

          {!isLoading && results && (
            <>
              {results.posts.length > 0 && (
                <div className="border-b border-border">
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground bg-muted/50">
                    Posts
                  </div>
                  <div className="max-h-[200px] overflow-y-auto">
                    {results.posts.map((post) => (
                      <button
                        key={post.id}
                        onClick={() => handlePostClick(post.id)}
                        className="w-full text-left px-3 py-2 hover:bg-muted transition-colors text-sm"
                      >
                        <p className="font-medium text-foreground truncate">{post.title}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          by {post.artist.stage_name}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {results.artists.length > 0 && (
                <div>
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground bg-muted/50">
                    Artists
                  </div>
                  <div className="max-h-[200px] overflow-y-auto">
                    {results.artists.map((artist) => (
                      <button
                        key={artist.id}
                        onClick={() => handleArtistClick(artist.id)}
                        className="w-full text-left px-3 py-2 hover:bg-muted transition-colors flex items-center gap-2"
                      >
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarImage src={artist.avatar_url || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                            {artist.display_name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {artist.display_name}
                          </p>
                          {artist.subscription_tier && (
                            <p className="text-xs text-muted-foreground capitalize">
                              {artist.subscription_tier}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {(results.posts.length > 0 || results.artists.length > 0) && (
                <button
                  onClick={handleSearchSubmit}
                  className="w-full text-center px-3 py-2 text-sm text-primary hover:bg-muted transition-colors border-t border-border font-medium"
                >
                  View all results for "{query}"
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
