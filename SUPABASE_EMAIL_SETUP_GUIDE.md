# Supabase Email Configuration Guide

This guide walks you through setting up email confirmation for your HYBE Artist Communication Portal.

## Table of Contents

1. [Pre-requisites](#pre-requisites)
2. [Configure Email Provider](#configure-email-provider)
3. [Set Server Environment Variables](#set-server-environment-variables)
4. [Verify Redirect URLs](#verify-redirect-urls)
5. [Test the Flow](#test-the-flow)
6. [Troubleshooting](#troubleshooting)

---

## Pre-requisites

You need:
- Access to your Supabase Dashboard
- Access to your deployment platform (Vercel, Netlify, etc.)
- Email templates configured (you already have these)

---

## Configure Email Provider

### Step 1: Access Supabase Email Settings

1. Go to your **Supabase Dashboard**
2. Navigate: **Settings → Auth Providers → Email**

You'll see a section for **Email Provider Configuration**

### Step 2: Choose an Email Provider

#### Option A: Built-in Email (Development Only) ⚠️

- **Status**: May already be enabled
- **Best for**: Local development and testing
- **Limitations**:
  - Max 2 emails/second
  - Max 50 emails/day
  - Rate limited
  - **Not suitable for production**

**How to use**:
- No additional setup needed
- Works out of the box
- Good for testing signup flow

#### Option B: SendGrid (Recommended for Production) ✅

**Best for**: Production applications
**Cost**: Free tier available (100 emails/day)

**Steps**:

1. Create a SendGrid account at https://sendgrid.com
2. Get your SendGrid API key:
   - Login to SendGrid
   - Navigate: **Settings → API Keys**
   - Create new API Key (Full Access)
   - Copy the API key

3. In Supabase Dashboard:
   - Go: **Settings → Auth Providers → Email**
   - Select **SendGrid** from dropdown
   - Paste your SendGrid API key
   - Click **Save**

4. **Important**: Configure SendGrid Sender Email
   - In SendGrid: Go to **Settings → Sender Authentication**
   - Verify your sender domain or email address
   - This is the "from" address for all emails

#### Option C: SMTP (Custom Mail Server)

**Best for**: Self-hosted solutions or using existing mail server

**Steps**:

1. Get your SMTP credentials:
   - SMTP Host (e.g., `smtp.gmail.com`)
   - SMTP Port (usually 587 or 465)
   - Username (your email)
   - Password (or app-specific password)

2. In Supabase Dashboard:
   - Go: **Settings → Auth Providers → Email**
   - Select **SMTP** from dropdown
   - Enter your SMTP details
   - Click **Save**

#### Option D: Netlify (If Hosted on Netlify)

- Netlify provides built-in email service
- No additional configuration needed
- Emails sent automatically through Netlify

---

## Set Server Environment Variables

These variables must be set on your deployment platform (NOT in code).

### Which Variables You Need

```
SUPABASE_URL=https://fpnwqamqypgllpnuhpte.supabase.co
SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY_HERE
```

### Get Your Keys from Supabase

1. Go to your **Supabase Dashboard**
2. Navigate: **Settings → API**
3. You'll see:
   - **URL**: Your Supabase URL
   - **Project API keys**: 
     - `anon` key (public, safe for client)
     - `service_role` key (private, only for server)

### Set Variables on Your Deployment Platform

#### If deploying to Vercel

1. Go to your Vercel project
2. **Settings → Environment Variables**
3. Add three variables:
   - `SUPABASE_URL` = your URL
   - `SUPABASE_ANON_KEY` = your anon key
   - `SUPABASE_SERVICE_ROLE_KEY` = your service role key
4. Click **Save and Redeploy**

#### If deploying to Netlify

1. Go to your Netlify site
2. **Build & deploy → Environment**
3. Edit environment variables
4. Add three variables:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. Redeploy your site

#### If hosting elsewhere

Follow your platform's documentation for setting environment variables.

---

## Verify Redirect URLs

The auth callback needs to be whitelisted in Supabase.

### Step 1: Get Your App URL

- **Local development**: `http://localhost:3000`
- **Production**: Your deployed URL (e.g., `https://hybe.example.com`)

### Step 2: Add to Supabase Whitelist

1. Go to **Supabase Dashboard**
2. Navigate: **Settings → Auth → Redirect URLs**
3. Add your URLs:
   - `http://localhost:3000/auth/callback` (development)
   - `https://your-domain.com/auth/callback` (production)
4. Click **Add**
5. Click **Save**

### Important

Your redirect URL must match your app's actual URL. If they don't match, auth will fail.

---

## Test the Flow

### Test Locally

1. Start your development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

2. Go to `http://localhost:3000/auth/sign-up`

3. Create test account:
   - Email: `test@example.com`
   - Password: Must meet requirements

4. Check your email (or Supabase logs if using built-in)

5. Click confirmation link in email

6. You should be redirected to dashboard

### Test on Production

1. Deploy your code
2. Wait for deployment to complete
3. Go to `https://your-domain.com/auth/sign-up`
4. Create test account
5. Check email and confirm

---

## Troubleshooting

### Issue: "Error sending confirmation email"

**Possible Causes**:

1. **Email provider not configured**
   - **Fix**: Complete steps in "Configure Email Provider" section above

2. **Server env vars not set**
   - **Fix**: Set SUPABASE_URL and SUPABASE_ANON_KEY on deployment platform
   - **Check**: There's a debug page at `/auth/debug` to verify configuration

3. **Redirect URL not whitelisted**
   - **Fix**: Add your domain to "Redirect URLs" in Supabase Settings → Auth

4. **Email templates misconfigured**
   - **Fix**: Check that templates use `{{ .ConfirmationURL }}`
   - Your templates look correct based on provided templates

5. **Rate limit exceeded**
   - **Fix**: 
     - Using built-in email? You're limited to 50 emails/day
     - Switch to SendGrid for production
     - Wait before trying again

### Issue: Email not received

**Check these**:

1. **Spam folder**: Check email spam/promotions folder

2. **Check Supabase logs**:
   - Go: Supabase Dashboard → **Logs**
   - Filter by "email" or "auth"
   - Look for error messages

3. **Verify sender email**:
   - If using SendGrid: Is sender domain verified?
   - If using SMTP: Is from email correct?

4. **Rate limiting**:
   - Using built-in email with 50+users? Hit daily limit
   - Solution: Switch to SendGrid

### Issue: Confirmation link doesn't work

**Check these**:

1. **URL in email is correct**:
   - Link should be: `http://localhost:3000/auth/callback?code=...`
   - Or: `https://your-domain.com/auth/callback?code=...`

2. **Redirect URL whitelisted**:
   - Did you add your domain to Supabase redirect URLs?

3. **Auth code expired**:
   - Supabase codes expire after 24 hours
   - User needs to sign up again

4. **Check Supabase logs**:
   - Look for errors when exchanging code for session

### Issue: Users stuck on sign-up-success page

**This is normal**:
- User is redirected to sign-up-success after signup
- Instructions say to check email
- Once they confirm email, they can sign in

**But if they can't proceed**:
- Ensure email was received
- Check confirmation link works
- Check Supabase user shows as confirmed in dashboard

---

## Production Checklist

Before going live, ensure:

- [ ] Email provider configured (SendGrid recommended)
- [ ] SUPABASE_URL set in production
- [ ] SUPABASE_ANON_KEY set in production
- [ ] SUPABASE_SERVICE_ROLE_KEY set in production
- [ ] Redirect URL added to Supabase Auth settings
- [ ] Tested full signup → email → confirmation flow
- [ ] Email templates verified correct
- [ ] Spam filtering checked (especially for testing)
- [ ] Error logging enabled (optional but recommended)
- [ ] Monitoring set up for email failures (optional)

---

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase Email Configuration](https://supabase.com/docs/guides/auth/auth-email)
- [SendGrid Setup Guide](https://sendgrid.com/docs/)
- [SMTP Configuration](https://supabase.com/docs/guides/auth/auth-email#smtp)

---

## Need Help?

If you're still having issues:

1. Check the debug page: `http://localhost:3000/auth/debug` (development only)
2. Review Supabase logs for detailed error messages
3. Verify all environment variables are set correctly
4. Ensure email provider is configured in Supabase dashboard
5. Check that redirect URLs include your domain

