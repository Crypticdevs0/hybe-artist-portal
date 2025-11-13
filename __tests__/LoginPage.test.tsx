import { render, screen, fireEvent, act } from '@testing-library/react';
import LoginPage from '../app/auth/login/page';
import useSupabaseBrowserClient from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

jest.mock('@/lib/supabase/client', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  redirect: jest.fn(),
  usePathname: jest.fn().mockReturnValue('/auth/login'),
}));

const mockPush = jest.fn();
(useRouter as jest.Mock).mockReturnValue({ push: mockPush });

const mockSupabase = {
  auth: {
    signInWithPassword: jest.fn().mockResolvedValue({ error: null }),
  },
};
(useSupabaseBrowserClient as jest.Mock).mockReturnValue(mockSupabase);

describe('LoginPage', () => {
  it('renders the login form and allows a user to log in', async () => {
    render(<LoginPage />);

    // Check that the form elements are present
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();

    // Fill out the form
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password' } });

    // Submit the form
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));
    });

    // Check that the signInWithPassword function was called with the correct credentials
    expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password',
    });

    // Check that the user is redirected to the dashboard
    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });
});
