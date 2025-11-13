
import { render, screen, act } from '@testing-library/react';
import PostPage from '../app/posts/[postId]/page';
import { getUser } from '@/lib/get-user';
import { createClient } from '@/lib/supabase/server';

jest.mock('@/lib/get-user', () => ({
  getUser: jest.fn(),
}));

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

const mockPost = {
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
};

const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockImplementation((column, value) => {
    if (column === 'id' && value === 'user-id') {
      return {
        single: jest.fn().mockResolvedValue({ data: { role: 'user' } }),
      };
    }
    if (column === 'id' && value === 'post-id') {
      return {
        single: jest.fn().mockResolvedValue({ data: mockPost }),
      };
    }
    if (column === 'user_id' && value === 'user-id') {
        return {
            data: [],
        }
    }
    return mockSupabase;
  }),
  single: jest.fn().mockResolvedValue({ data: {} }),
};

(getUser as jest.Mock).mockResolvedValue({ id: 'user-id' });
(createClient as jest.Mock).mockResolvedValue(mockSupabase);

describe('PostPage', () => {
  it('renders the post card and comment section', async () => {
    const params = { postId: 'post-id' };

    await act(async () => {
      render(await PostPage({ params }));
    });

    expect(screen.getByText('Test Post')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
    expect(screen.getByText('Comments')).toBeInTheDocument();
  });
});
