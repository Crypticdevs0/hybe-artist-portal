
import { render, screen } from '@testing-library/react';
import PostPage from '../app/posts/[postId]/page';
import { createClient } from '@/lib/supabase/server';

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
  usePathname: jest.fn().mockReturnValue('/'),
  useRouter: jest.fn().mockReturnValue({
    push: jest.fn(),
  }),
}));

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
};

(createClient as jest.Mock).mockResolvedValue(mockSupabase);

describe('PostPage', () => {
  it('renders the post card and comment section', async () => {
    const params = { postId: 'post-id' };
    render(await PostPage({ params }));

    expect(screen.getByText('Test Post')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
    expect(screen.getByText('Comments')).toBeInTheDocument();
  });
});
