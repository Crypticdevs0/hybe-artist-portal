import { z } from "zod";

const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),

  // Vercel Blob
  VERCEL_BLOB_TOKEN: z.string().optional(),
  VERCEL_BLOB_HOST: z.string().optional(),

  // Sentry
  SENTRY_DSN: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  SENTRY_TRACES_SAMPLE_RATE: z.string().optional(),

  // Upstash
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // Other
  NODE_ENV: z.enum(["development", "test", "production"]),
  ANALYZE: z.string().optional(),
  NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL: z.string().url().optional(),
  NEXT_PUBLIC_BASE_URL: z.string().url(),
});

export const env = envSchema.parse(process.env);
