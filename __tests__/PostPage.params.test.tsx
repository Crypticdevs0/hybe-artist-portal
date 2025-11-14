import { render, screen } from '@testing-library/react'
import PostPage from '../app/posts/[postId]/page'
import { createClient } from '@/lib/supabase/server'

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}))

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
  usePathname: jest.fn().mockReturnValue('/'),
  useRouter: jest.fn().mockReturnValue({
    push: jest.fn(),
  }),
}))

const mockSupabase = {
  auth: {
    getUser: jest.fn().mockResolvedValue({
      data: { user: { id: 'user-id' } },
      error: null,
    }),
  },
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn().mockResolvedValue({
    data: {
      id: 'post-id',
      title: 'Test Post',
      content: 'Test content',
      created_at: new Date().toISOString(),
      artist: {
        stage_name: 'Test Artist',
        profile: { avatar_url: '' },
      },
      likes: [],
      comments: [],
    },
  }),
}

(createClient as jest.Mock).mockResolvedValue(mockSupabase)

describe('PostPage - Params Promise Handling', () => {
  it('should handle params as a Promise and correctly extract postId', async () => {
    // Test with params as a Promise (Next.js 15+ pattern)
    const params = Promise.resolve({ postId: 'post-id' })
    
    // This test verifies that PostPage can be called with params as a Promise
    // and doesn't throw an error about trying to access properties on a Promise
    const result = await PostPage({ params })
    
    // Verify the component rendered without errors
    expect(result).toBeDefined()
  })

  it('should render post content when params Promise resolves with postId', async () => {
    const params = Promise.resolve({ postId: 'post-id' })
    render(await PostPage({ params }))

    expect(screen.getByText('Test Post')).toBeInTheDocument()
    expect(screen.getByText('Test content')).toBeInTheDocument()
    expect(screen.getByText('Comments')).toBeInTheDocument()
  })

  it('should use the correct postId from resolved Promise params', async () => {
    // Mock the supabase query builder to track what postId was used
    const selectSpy = jest.fn().mockReturnThis()
    const eqSpy = jest.fn().mockReturnThis()
    const singleSpy = jest.fn().mockResolvedValue({
      data: {
        id: 'specific-post-id',
        title: 'Specific Post',
        content: 'Content',
        created_at: new Date().toISOString(),
        artist: {
          stage_name: 'Artist',
          profile: { avatar_url: '' },
        },
        likes: [],
        comments: [],
      },
    })

    ;(createClient as jest.Mock).mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'user-id' } },
          error: null,
        }),
      },
      from: jest.fn().mockReturnValue({
        select: selectSpy,
      }),
    })

    selectSpy.mockReturnValue({
      eq: eqSpy,
    })

    eqSpy.mockReturnValue({
      single: singleSpy,
    })

    const params = Promise.resolve({ postId: 'specific-post-id' })
    await PostPage({ params })

    // Verify that the postId from the Promise was correctly used
    expect(eqSpy).toHaveBeenCalledWith('id', 'specific-post-id')
  })
})
