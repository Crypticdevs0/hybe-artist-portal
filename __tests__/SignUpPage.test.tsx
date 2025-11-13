import { render, screen, fireEvent, act } from '@testing-library/react';
import SignUpPage from '../app/auth/sign-up/page';
import useSupabaseBrowserClient from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

jest.mock('@/lib/supabase/client', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  redirect: jest.fn(),
  usePathname: jest.fn().mockReturnValue('/auth/sign-up'),
}));

jest.mock('@/components/password-requirements', () => ({
  PasswordRequirements: ({ onValidityChange }: { onValidityChange: (isValid: boolean) => void }) => {
    useEffect(() => {
      onValidityChange(true);
    }, [onValidityChange]);
    return null;
  },
}));

const mockPush = jest.fn();
(useRouter as jest.Mock).mockReturnValue({ push: mockPush });

const mockSupabase = {
  auth: {
    signUp: jest.fn().mockResolvedValue({ error: null }),
  },
};
(useSupabaseBrowserClient as jest.Mock).mockReturnValue(mockSupabase);

describe('SignUpPage', () => {
  it('renders the sign-up form and allows a user to sign up', async () => {
    render(<SignUpPage />);

    // Check that the form elements are present
    expect(screen.getByLabelText('Display Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument();

    // Fill out the form
    fireEvent.change(screen.getByLabelText('Display Name'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password' } });

    // Submit the form
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));
    });

    // Check that the signUp function was called with the correct credentials
    expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password',
      options: {
        emailRedirectTo: 'http://localhost:3000/dashboard',
        data: {
          display_name: 'Test User',
        },
      },
    });

    // Check that the user is redirected to the sign-up success page
    expect(mockPush).toHaveBeenCalledWith('/auth/sign-up-success');
  });
});
