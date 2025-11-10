# Deployment Guide - HYBE Artist Portal

This guide walks through deploying the HYBE Artist Portal to production.

## Prerequisites

- GitHub account
- Vercel account
- Supabase account with project created
- All environment variables ready

## Step 1: Prepare Supabase

### 1.1 Create Production Database

1. Go to your Supabase dashboard
2. Create a new project (or use existing)
3. Wait for database initialization

### 1.2 Run Database Migrations

In the Supabase SQL Editor, execute these scripts **in order**:

**Script 1: Create Tables**
\`\`\`sql
-- Copy and paste contents of scripts/001_create_tables.sql
\`\`\`

**Script 2: Create Functions**
\`\`\`sql
-- Copy and paste contents of scripts/002_create_functions.sql
\`\`\`

**Script 3: Seed Data (Optional)**
\`\`\`sql
-- Copy and paste contents of scripts/003_seed_data.sql
-- Only run this for testing/development
\`\`\`

### 1.3 Configure Authentication

1. Go to Authentication → Providers
2. Enable Email provider
3. Configure email templates (optional)
4. Add production URL to "Redirect URLs":
   - `https://yourdomain.com/**`
   - `https://*.vercel.app/**`

### 1.4 Get Environment Variables

From Supabase Settings → API:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (Settings → API → service_role key)

## Step 2: Prepare GitHub Repository

### 2.1 Push Code to GitHub

If not already done:

\`\`\`bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
\`\`\`

## Step 3: Deploy to Vercel

### 3.1 Import Project

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Vercel will detect Next.js automatically

### 3.2 Configure Environment Variables

Add these in Vercel project settings:

**Production Environment:**
\`\`\`
NEXT_PUBLIC_SUPABASE_URL=<from-supabase>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from-supabase>
SUPABASE_SERVICE_ROLE_KEY=<from-supabase>
\`\`\`

**Preview/Development:**
\`\`\`
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
\`\`\`

### 3.3 Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Get your production URL: `https://your-project.vercel.app`

## Step 4: Post-Deployment Verification

### 4.1 Test Critical Flows

- [ ] Visit the homepage
- [ ] Sign up with a new account
- [ ] Check email for confirmation
- [ ] Confirm email and log in
- [ ] Navigate to dashboard
- [ ] Send a test message
- [ ] Create a test post (if artist)
- [ ] Test mobile view on real device

### 4.2 Check Performance

1. Run Lighthouse audit
2. Check Vercel Analytics
3. Monitor Supabase dashboard for queries

### 4.3 Set Up Monitoring

**Vercel:**
- Enable Vercel Analytics (already included)
- Set up deployment notifications
- Configure error alerts

**Supabase:**
- Review daily email reports
- Set up database alerts for high load
- Monitor connection pool usage

## Step 5: Database Optimization

### 5.1 Add Performance Indexes

Run these in Supabase SQL Editor:

\`\`\`sql
-- Improve message query performance
CREATE INDEX IF NOT EXISTS idx_messages_recipient 
ON messages(recipient_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_sender 
ON messages(sender_id, created_at DESC);

-- Improve posts query performance
CREATE INDEX IF NOT EXISTS idx_posts_artist 
ON posts(artist_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_posts_visibility 
ON posts(visibility, created_at DESC);

-- Improve notifications query performance
CREATE INDEX IF NOT EXISTS idx_notifications_user 
ON notifications(user_id, is_read, created_at DESC);

-- Improve likes query performance
CREATE INDEX IF NOT EXISTS idx_likes_post 
ON likes(post_id);

CREATE INDEX IF NOT EXISTS idx_likes_user 
ON likes(user_id);

-- Improve comments query performance
CREATE INDEX IF NOT EXISTS idx_comments_post 
ON comments(post_id, created_at DESC);
\`\`\`

### 5.2 Verify RLS Policies

\`\`\`sql
-- Check all tables have RLS enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
-- All rows should have rowsecurity = true
\`\`\`

## Step 6: Configure Custom Domain (Optional)

### 6.1 Add Domain in Vercel

1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

### 6.2 Update Supabase Redirect URLs

Add your custom domain to allowed redirect URLs in Supabase:
- `https://yourdomain.com/**`

## Troubleshooting

### Build Failures

**Error: Missing environment variables**
- Double-check all env vars are set in Vercel
- Ensure `NEXT_PUBLIC_` prefix for client-side vars

**Error: Type errors**
\`\`\`bash
npm run build
\`\`\`
Fix any TypeScript errors locally first

### Runtime Errors

**Authentication not working**
- Verify Supabase URL and keys
- Check redirect URLs are configured
- Test email confirmation flow

**Database errors**
- Verify migrations ran successfully
- Check RLS policies are active
- Review Supabase logs

**Real-time not working**
- Check Supabase Realtime is enabled
- Verify RLS policies allow subscriptions
- Check browser console for errors

### Performance Issues

**Slow page loads**
- Check Supabase connection pooling
- Add database indexes (see Step 5)
- Review Vercel Analytics for bottlenecks

**High database load**
- Check for N+1 queries
- Add appropriate indexes
- Consider upgrading Supabase tier

## Rollback Procedure

If critical issues occur:

1. Go to Vercel dashboard
2. Find previous working deployment
3. Click "..." → "Promote to Production"
4. Investigate issue in preview environment
5. Deploy fix when ready

## Maintenance

### Regular Tasks

**Daily:**
- Check error rates in Vercel
- Review Supabase dashboard

**Weekly:**
- Review performance metrics
- Check database size growth
- Test critical user flows

**Monthly:**
- Update dependencies
- Review security advisories
- Test backup restore procedure

## Support Contacts

- Vercel Support: vercel.com/help
- Supabase Support: supabase.com/support
- v0 Issues: github.com/vercel/v0-feedback

---

**Deployment Checklist:**
- [ ] Supabase project created
- [ ] Database migrations executed
- [ ] Authentication configured
- [ ] Environment variables set
- [ ] GitHub repository connected
- [ ] Vercel project deployed
- [ ] Critical flows tested
- [ ] Performance indexes added
- [ ] Monitoring configured
- [ ] Custom domain added (optional)

**Status:** Ready for Production ✅
