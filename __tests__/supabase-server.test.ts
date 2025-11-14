import { createClient, createServiceRoleClient } from '../lib/supabase/server';
import { cookies } from 'next/headers';

jest.mock('next/headers', () => ({
    cookies: jest.fn(),
}));

describe('Supabase Server-side Clients', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...originalEnv };
        (cookies as jest.Mock).mockReturnValue({
            getAll: jest.fn().mockReturnValue([]),
            set: jest.fn(),
        });
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    describe('createClient', () => {
        it('should throw an error if server-side env vars are not set, even if client-side vars are', async () => {
            delete process.env.SUPABASE_URL;
            delete process.env.SUPABASE_ANON_KEY;
            process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://client-side.supabase.co';
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'client-side-anon-key';

            const serverModule = await import('../lib/supabase/server');
            await expect(serverModule.createClient()).rejects.toThrow(
                'Supabase URL or Anon key is not configured on the server (SUPABASE_URL / SUPABASE_ANON_KEY)'
            );
        });
    });

    describe('createServiceRoleClient', () => {
        it('should throw an error if server-side env vars are not set, even if client-side vars are', () => {
            delete process.env.SUPABASE_URL;
            delete process.env.SUPABASE_SERVICE_ROLE_KEY;
            process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://client-side.supabase.co';

            const serverModule = require('../lib/supabase/server');
            expect(() => serverModule.createServiceRoleClient()).toThrow(
                'Supabase URL or SERVICE ROLE key is not configured (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)'
            );
        });
    });
});
