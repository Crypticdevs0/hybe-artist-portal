import { SupabaseClient } from '@supabase/supabase-js'

export type FeedSortOption = 'latest' | 'trending' | 'most-commented' | 'following'

const PAGE_SIZE = 20

interface FetchFeedOptions {
  userId: string
  sortBy?: FeedSortOption
  page?: number
  pageSize?: number
}

interface FetchFeedResult {
  posts: any[]
  hasNextPage: boolean
  hasPreviousPage: boolean
  page: number
}

export async function fetchFeed(
  supabase: SupabaseClient,
  options: FetchFeedOptions
): Promise<FetchFeedResult> {
  const { userId, sortBy = 'latest', page = 1, pageSize = PAGE_SIZE } = options
  const offset = (page - 1) * pageSize

  let query = supabase.from('posts').select(`
    *,
    artist:artists!inner (
      id,
      stage_name,
      profile:profiles!artists_profile_id_fkey (
        avatar_url
      )
    ),
    likes (id),
    comments (id)
  `)

  // Apply sorting
  switch (sortBy) {
    case 'trending': {
      // Trending: sort by likes count descending, with recent posts first
      query = query.order('created_at', { ascending: false })
      break
    }
    case 'most-commented': {
      // Most commented: requires counting comments per post
      // This is a limitation of Supabase - we'll fetch and sort client-side
      query = query.order('created_at', { ascending: false })
      break
    }
    case 'following': {
      // Following: only show posts from followed artists (would require a follows table)
      query = query.order('created_at', { ascending: false })
      break
    }
    case 'latest':
    default: {
      query = query.order('created_at', { ascending: false })
    }
  }

  // Apply pagination with +1 to check if there's a next page
  const { data: posts, error } = await query.range(offset, offset + pageSize)

  if (error) {
    throw new Error(`Failed to fetch feed: ${error.message}`)
  }

  // Get user's likes to mark posts
  const { data: userLikes } = await supabase
    .from('likes')
    .select('post_id')
    .eq('user_id', userId)

  const userLikedPosts = new Set(userLikes?.map((like) => like.post_id) || [])

  // Sort by comment count if needed (client-side sorting)
  let sortedPosts = posts || []
  if (sortBy === 'most-commented') {
    sortedPosts = sortedPosts.sort(
      (a, b) => (b.comments?.length || 0) - (a.comments?.length || 0)
    )
  } else if (sortBy === 'trending') {
    // Trending: prioritize likes and recent posts
    sortedPosts = sortedPosts.sort((a, b) => {
      const aScore = (a.likes?.length || 0) * 2 + (b.comments?.length || 0)
      const bScore = (b.likes?.length || 0) * 2 + (a.comments?.length || 0)
      return bScore - aScore
    })
  }

  // Take only pageSize items for this page
  const paginatedPosts = sortedPosts.slice(0, pageSize)

  // Check if there are more posts
  const hasNextPage = (posts?.length || 0) > pageSize

  const postsWithLikeStatus = paginatedPosts.map((post) => ({
    ...post,
    user_liked: userLikedPosts.has(post.id),
  }))

  return {
    posts: postsWithLikeStatus,
    hasNextPage,
    hasPreviousPage: page > 1,
    page,
  }
}

interface FetchRecentPostsOptions {
  limit?: number
  hours?: number
}

export async function fetchRecentPosts(
  supabase: SupabaseClient,
  userId: string,
  options: FetchRecentPostsOptions = {}
) {
  const { limit = 5, hours = 24 } = options

  const sinceDate = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()

  const { data: posts, error } = await supabase
    .from('posts')
    .select(`
      id,
      title,
      created_at,
      artist:artists!inner (
        id,
        stage_name,
        profile:profiles!artists_profile_id_fkey (
          avatar_url
        )
      ),
      likes (id),
      comments (id)
    `)
    .gte('created_at', sinceDate)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(`Failed to fetch recent posts: ${error.message}`)
  }

  const { data: userLikes } = await supabase
    .from('likes')
    .select('post_id')
    .eq('user_id', userId)

  const userLikedPosts = new Set(userLikes?.map((like) => like.post_id) || [])

  return (posts || []).map((post) => ({
    ...post,
    user_liked: userLikedPosts.has(post.id),
  }))
}

interface FetchTrendingPostsOptions {
  limit?: number
  hoursBack?: number
}

export async function fetchTrendingPosts(
  supabase: SupabaseClient,
  userId: string,
  options: FetchTrendingPostsOptions = {}
) {
  const { limit = 10, hoursBack = 72 } = options

  const sinceDate = new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString()

  const { data: posts, error } = await supabase
    .from('posts')
    .select(`
      *,
      artist:artists!inner (
        id,
        stage_name,
        profile:profiles!artists_profile_id_fkey (
          avatar_url
        )
      ),
      likes (id),
      comments (id)
    `)
    .gte('created_at', sinceDate)
    .order('created_at', { ascending: false })
    .limit(limit * 2) // Fetch extra to sort by engagement

  if (error) {
    throw new Error(`Failed to fetch trending posts: ${error.message}`)
  }

  const { data: userLikes } = await supabase
    .from('likes')
    .select('post_id')
    .eq('user_id', userId)

  const userLikedPosts = new Set(userLikes?.map((like) => like.post_id) || [])

  // Sort by engagement (likes + comments)
  const trendingPosts = (posts || [])
    .map((post) => ({
      ...post,
      user_liked: userLikedPosts.has(post.id),
      engagement: (post.likes?.length || 0) + (post.comments?.length || 0),
    }))
    .sort((a, b) => b.engagement - a.engagement)
    .slice(0, limit)
    .map(({ engagement, ...post }) => post)

  return trendingPosts
}
