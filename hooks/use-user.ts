import { useState, useEffect } from 'react';
import useSupabaseBrowserClient from '@/lib/supabase/client';
import { type User } from '@supabase/supabase-js';

export function useUser() {
  const supabase = useSupabaseBrowserClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function getUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (e) {
        setError(e as Error);
      } finally {
        setLoading(false);
      }
    }

    getUser();
  }, [supabase]);

  return { user, loading, error };
}
