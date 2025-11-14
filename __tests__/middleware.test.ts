/**
 * @jest-environment jsdom
 */
import { updateSession } from '../lib/supabase/middleware';
import { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

jest.mock('@supabase/ssr', () => ({
    createServerClient: jest.fn(),
}));

describe('Authentication Middleware', () => {
    const mockGetUserAuthenticated = jest.fn().mockResolvedValue({ data: { user: { id: 'user-id' } } });
    const mockGetUserUnauthenticated = jest.fn().mockResolvedValue({ data: { user: null } });

    beforeEach(() => {
        mockGetUserAuthenticated.mockClear();
        mockGetUserUnauthenticated.mockClear();
        (createServerClient as jest.Mock).mockClear();
    });

    it('should allow authenticated users to access the sign-up-success page', async () => {
        const request = new NextRequest('http://localhost:3000/auth/sign-up-success');
        (createServerClient as jest.Mock).mockReturnValue({
            auth: { getUser: mockGetUserAuthenticated },
        });

        const response = await updateSession(request);

        expect(response.status).toBe(200);
        expect(response.headers.get('location')).toBeNull();
    });

    it('should redirect authenticated users from other auth pages to the dashboard', async () => {
        const request = new NextRequest('http://localhost:3000/auth/login');
        (createServerClient as jest.Mock).mockReturnValue({
            auth: { getUser: mockGetUserAuthenticated },
        });

        const response = await updateSession(request);
        const redirectedUrl = response.headers.get('location');

        expect(response.status).toBe(307);
        expect(new URL(redirectedUrl!).pathname).toBe('/dashboard');
    });

    it('should redirect unauthenticated users from a protected page to the login page', async () => {
        const request = new NextRequest('http://localhost:3000/dashboard');
        (createServerClient as jest.Mock).mockReturnValue({
            auth: { getUser: mockGetUserUnauthenticated },
        });

        const response = await updateSession(request);
        const redirectedUrl = response.headers.get('location');

        expect(response.status).toBe(307);
        expect(new URL(redirectedUrl!).pathname).toBe('/auth/login');
    });
});
