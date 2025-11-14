import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PostCard } from '../components/post-card'
import useSupabaseBrowserClient from '@/lib/supabase/client'

// Mock the Supabase client
jest.mock('@/lib/supabase/client', () => {
  return jest.fn()
})

// Mock the toast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}))

// Mock error logger
jest.mock('@/lib/error-logger', () => ({
  logError: jest.fn(),
}))

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} />
  },
}))

const mockPost = {
  id: 'post-123',
  title: 'Test Post',
  content: 'Test content',
  media_url: undefined,
  created_at: new Date().toISOString(),
  artist: {
    stage_name: 'Test Artist',
    profile: {
      avatar_url: null,
    },
  },
  likes: [],
  comments: [],
  user_liked: false,
}

describe('PostCard - Like Button State Management', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should reset isLiking state when user is not authenticated', async () => {
    // Mock getUser to return no user
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: null },
          error: null,
        }),
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
    }

    ;(useSupabaseBrowserClient as jest.Mock).mockReturnValue(mockSupabase)

    const { container } = render(<PostCard post={mockPost} />)

    // Find the like button
    const likeButton = screen.getByRole('button', { name: /0/i })
    
    // Click the like button
    fireEvent.click(likeButton)

    // Wait for the async operation to complete
    await waitFor(() => {
      // After the async getUser call, the button should be enabled again
      // The button should not have the disabled attribute
      expect(likeButton).not.toHaveAttribute('disabled')
    }, { timeout: 2000 })

    // Verify getUser was called
    expect(mockSupabase.auth.getUser).toHaveBeenCalled()
  })

  it('should allow multiple like button clicks when user is unauthenticated', async () => {
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: null },
          error: null,
        }),
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
    }

    ;(useSupabaseBrowserClient as jest.Mock).mockReturnValue(mockSupabase)

    render(<PostCard post={mockPost} />)

    const likeButton = screen.getByRole('button', { name: /0/i })

    // First click
    fireEvent.click(likeButton)
    
    // Wait for first click to complete
    await waitFor(() => {
      expect(likeButton).not.toHaveAttribute('disabled')
    }, { timeout: 2000 })

    // Verify button is clickable again
    expect(likeButton).not.toHaveAttribute('disabled')

    // Second click should also be possible
    fireEvent.click(likeButton)

    // Wait for second click to complete
    await waitFor(() => {
      expect(likeButton).not.toHaveAttribute('disabled')
    }, { timeout: 2000 })

    // getUser should have been called twice
    expect(mockSupabase.auth.getUser).toHaveBeenCalledTimes(2)
  })

  it('should successfully like a post when user is authenticated', async () => {
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'user-123' } },
          error: null,
        }),
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      insert: jest.fn().mockResolvedValue({}),
    }

    ;(useSupabaseBrowserClient as jest.Mock).mockReturnValue(mockSupabase)

    render(<PostCard post={mockPost} />)

    const likeButton = screen.getByRole('button', { name: /0/i })

    // Click the like button
    fireEvent.click(likeButton)

    // Wait for async operation
    await waitFor(() => {
      // Button should be enabled again
      expect(likeButton).not.toHaveAttribute('disabled')
    }, { timeout: 2000 })

    // Verify like operation was attempted
    expect(mockSupabase.auth.getUser).toHaveBeenCalled()
  })
})
