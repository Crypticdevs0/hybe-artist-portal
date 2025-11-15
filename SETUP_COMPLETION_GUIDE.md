# Production Setup Completion Guide

## ✅ Completed Steps

### 1. Created Missing Admin Pages
- ✅ `/admin/subscriptions` - Subscription tier management with revenue tracking
- ✅ `/admin/comments` - Comment moderation interface
- ✅ `/admin/reports` - User reports and content flags management

All pages follow the established design patterns with:
- Authentication checks (admin-only access)
- Responsive design (mobile → desktop)
- Stats cards and data visualization
- Proper styling with gradient backgrounds

### 2. Error Tracking Infrastructure
- ✅ `lib/error-logger.ts` - Simple error logging utility
- ✅ `lib/sentry/init.ts` - Sentry integration (optional for production)
- ✅ `/api/logs/error` - Error logging endpoint

## 🔴 CRITICAL: Manual Steps Required

### Step 1: Set Environment Variables

Add these to your deployment platform (Vercel, etc.) or local `.env.local`:

```bash
# ✅ Already configured (client-side)
NEXT_PUBLIC_SUPABASE_URL=https://fpnwqamqypgllpnuhpte.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 🔴 REQUIRED - Set on your deployment platform (server-side)
SUPABASE_URL=https://fpnwqamqypgllpnuhpte.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

# 🟡 OPTIONAL - For file uploads
VERCEL_BLOB_TOKEN=<get-from-vercel-dashboard>

# 🟡 OPTIONAL - For error tracking
SENTRY_DSN=<get-from-sentry-dashboard>
SENTRY_TRACES_SAMPLE_RATE=0.1
```

**How to set in different platforms:**

**Vercel:**
1. Go to your project settings: https://vercel.com/dashboard
2. Navigate to "Settings" → "Environment Variables"
3. Add each variable (make sure to select the correct environment: Production, Preview, Development)

**Local Development:**
1. Create/update `.env.local` file
2. Add the variables
3. Restart dev server: `pnpm run dev`

### Step 2: Run Database Migrations in Supabase

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/projects)
2. Select your project: `fpnwqamqypgllpnuhpte`
3. Navigate to "SQL Editor"
4. Create a new query and run each migration script in order:

```sql
-- Step 1: Run scripts/001_create_tables.sql
-- (Copy entire contents from file and execute)

-- Step 2: Run scripts/002_create_functions.sql
-- (Copy entire contents from file and execute)

-- Step 3: Run scripts/004_create_message_attachments.sql
-- (Copy entire contents from file and execute)

-- Step 4: Verify RLS is enabled on all tables
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
-- All should show rowsecurity = true
```

## 🟡 OPTIONAL: Enhanced Configuration

### Setup Sentry for Error Tracking (Recommended for Production)

1. **Create Sentry Account:**
   - Go to https://sentry.io/
   - Sign up and create a new project
   - Select "Next.js" as the platform
   - Copy the DSN

2. **Set Environment Variable:**
   ```bash
   SENTRY_DSN=https://xxxxxxx@xxxxxxx.ingest.sentry.io/xxxxxx
   SENTRY_TRACES_SAMPLE_RATE=0.1
   ```

3. **Restart App:**
   - Errors will now be automatically sent to Sentry
   - Monitor errors at https://sentry.io/dashboard

### Setup File Uploads with Vercel Blob

1. **Get VERCEL_BLOB_TOKEN:**
   - Go to https://vercel.com/dashboard/settings/tokens
   - Create a new token or use existing Blob token

2. **Set Environment Variable:**
   ```bash
   VERCEL_BLOB_TOKEN=<your-token>
   ```

3. **Test Upload:**
   - Go to profile page and try uploading avatar
   - Should work without errors

## 📋 Verification Checklist

### Before Deploying to Production

- [ ] **Environment Variables Set**
  - [ ] `SUPABASE_URL` configured
  - [ ] `SUPABASE_ANON_KEY` configured
  - [ ] `SUPABASE_SERVICE_ROLE_KEY` configured
  - [ ] Verify with: `curl https://your-domain/api/health/env`

- [ ] **Database Migrations Completed**
  - [ ] All migration scripts executed in Supabase
  - [ ] All tables created (profiles, artists, posts, messages, comments, likes, notifications, message_attachments)
  - [ ] RLS policies enabled on all tables
  - [ ] Verify with: `curl https://your-domain/api/health/supabase`

- [ ] **Admin Pages Functional**
  - [ ] Visit `/admin` and verify accessible
  - [ ] Click "Subscription Management" - should show subscriptions page
  - [ ] Click "Moderate Comments" - should show comments page
  - [ ] Click "View Reports" - should show reports page
  - [ ] All pages load without errors

- [ ] **Authentication Flow**
  - [ ] Sign up at `/auth/sign-up`
  - [ ] Verify email received
  - [ ] Click email verification link
  - [ ] Redirected to `/dashboard`
  - [ ] Can access protected pages
  - [ ] Logout works correctly

- [ ] **Build Status**
  - [ ] Run: `pnpm run build`
  - [ ] Should complete with 0 errors
  - [ ] No TypeScript errors
  - [ ] No console warnings

- [ ] **Optional: Error Tracking**
  - [ ] If using Sentry: Create test error and verify in Sentry dashboard
  - [ ] Check `/api/logs/error` endpoint works

## 🚀 Deployment Steps

### 1. Test Locally
```bash
# Build locally
pnpm run build

# Run production build
pnpm run start

# Visit http://localhost:3000 and test all flows
```

### 2. Deploy to Vercel
```bash
# Push code to GitHub
git add .
git commit -m "Apply production recommendations"
git push origin main

# Vercel will auto-deploy on push
# Monitor deployment at https://vercel.com/dashboard
```

### 3. Verify Deployment
```bash
# After deployment, test:
curl https://your-domain/api/health/env
curl https://your-domain/api/health/supabase

# Both should return success responses
```

## 📊 What Each Admin Page Does

### `/admin/subscriptions`
- Shows subscription statistics (premium, VIP, total)
- Calculates estimated monthly revenue
- Lists all premium subscribers
- Allows managing individual subscriptions

### `/admin/comments`
- Shows total comments and recent activity
- Lists all comments with context
- Preview of comment content
- Approve/Delete buttons for moderation

### `/admin/reports`
- Shows pending and resolved reports
- Lists user flagged content/users
- Review button to investigate issues
- Resolve button to close reports

## 🆘 Troubleshooting

### Build Fails with "SUPABASE_URL not configured"
**Solution:** Make sure `SUPABASE_URL` is set as an environment variable (not just `NEXT_PUBLIC_SUPABASE_URL`)

### Middleware Not Protecting Routes
**Solution:** Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set as server-side env vars
- Check Vercel: Settings → Environment Variables
- Should NOT have NEXT_PUBLIC_ prefix for server vars

### Database Queries Failing
**Solution:** Verify all migration scripts were executed in Supabase SQL Editor
- Check: SELECT * FROM pg_tables WHERE schemaname = 'public';
- Should show all 8 tables

### File Upload Not Working
**Solution:** 
- If using Vercel Blob: Set `VERCEL_BLOB_TOKEN`
- Or use Supabase Storage (default fallback)

### Admin Pages Return 404
**Solution:** Verify user has `role = 'admin'` in profiles table
- Check Supabase: Tables → profiles
- Look for your user record and ensure role is 'admin'

## 📞 Support

For issues with:
- **Supabase:** https://supabase.com/docs/
- **Vercel:** https://vercel.com/docs/
- **Next.js:** https://nextjs.org/docs/
- **Sentry:** https://docs.sentry.io/

---

## Summary

**Status:** ✅ **Application Ready for Production Setup**

**Remaining Work:**
1. Set environment variables (15 min)
2. Run database migrations (10 min)
3. Verify build and test flows (30 min)
4. Deploy to production (5-10 min)

**Total Time:** ~1 hour

Once these steps are complete, your application will be fully production-ready!
