/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import DashboardPage from '../app/dashboard/page';
import { createClient } from '@/lib/supabase/server';

jest.mock('@/lib/supabase/server', () => ({
    createClient: jest.fn(),
}));

jest.mock('next/navigation', () => ({
    redirect: jest.fn(),
}));

describe('DashboardPage', () => {
    it('should throw an error if Supabase client fails to create', async () => {
        (createClient as jest.Mock).mockRejectedValue(new Error('Test error'));

        await expect(DashboardPage()).rejects.toThrow(
            'Failed to initialize Supabase client. Please check your environment variables.'
        );
    });
});
