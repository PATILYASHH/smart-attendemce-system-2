# Netlify Deployment Guide

## Prerequisites
- GitHub account
- Netlify account (free tier works)
- Supabase project set up

## Step 1: Prepare Your Repository

1. **Commit all changes to GitHub:**
   ```bash
   git add .
   git commit -m "Prepare for Netlify deployment"
   git push origin main
   ```

## Step 2: Deploy to Netlify

### Option A: Deploy via Netlify Dashboard (Recommended)

1. **Go to Netlify:**
   - Visit https://app.netlify.com/
   - Click "Add new site" → "Import an existing project"

2. **Connect to GitHub:**
   - Choose "Deploy with GitHub"
   - Authorize Netlify to access your repositories
   - Select your `smart-attendemce-system-2` repository

3. **Configure Build Settings:**
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Branch to deploy:** `main` (or your default branch)

4. **Add Environment Variables:**
   - Click "Show advanced" → "New variable"
   - Add the following variables:
     - `VITE_SUPABASE_URL` = Your Supabase project URL
     - `VITE_SUPABASE_ANON_KEY` = Your Supabase anon/public key

5. **Deploy:**
   - Click "Deploy site"
   - Wait for the build to complete (2-3 minutes)

### Option B: Deploy via Netlify CLI

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify:**
   ```bash
   netlify login
   ```

3. **Initialize and Deploy:**
   ```bash
   netlify init
   netlify deploy --prod
   ```

## Step 3: Configure Supabase

1. **Update Supabase URL Settings:**
   - Go to your Supabase project dashboard
   - Navigate to Authentication → URL Configuration
   - Add your Netlify site URL to "Site URL"
   - Add `https://YOUR_SITE.netlify.app/**` to "Redirect URLs"

2. **Update CORS Settings (if needed):**
   - Go to Project Settings → API
   - Ensure your Netlify domain is allowed

## Step 4: Get Your Environment Variables

### Finding Supabase Credentials:

1. Go to your Supabase project: https://app.supabase.com/
2. Click on your project
3. Go to Settings → API
4. Copy:
   - **Project URL** → Use as `VITE_SUPABASE_URL`
   - **anon/public key** → Use as `VITE_SUPABASE_ANON_KEY`

### Adding to Netlify:

1. Go to your Netlify site dashboard
2. Site settings → Environment variables
3. Click "Add a variable"
4. Add both variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Click "Save"
6. Trigger a new deploy (Deploys → Trigger deploy → Deploy site)

## Step 5: Run Database Migration

Before using the app, run this SQL in your Supabase SQL Editor:

```sql
ALTER TABLE attendance 
ADD COLUMN IF NOT EXISTS penalty DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_excused BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS excuse_reason TEXT;
```

## Step 6: Verify Deployment

1. Visit your Netlify URL (e.g., `https://YOUR_SITE.netlify.app`)
2. Test login/signup functionality
3. Verify dashboard loads with statistics
4. Test adding students and marking attendance

## Troubleshooting

### Build Fails
- Check build logs in Netlify dashboard
- Ensure all dependencies are in `package.json`
- Verify Node version (use Node 18+)

### Supabase Connection Issues
- Verify environment variables are set correctly
- Check Supabase URL configuration includes Netlify domain
- Ensure database tables exist (run setup SQL)

### 404 Errors on Refresh
- Verify `_redirects` file exists in `public/` folder
- Check `netlify.toml` has correct redirect configuration

### Authentication Not Working
- Add Netlify URL to Supabase redirect URLs
- Clear browser cache and cookies
- Check browser console for errors

## Custom Domain (Optional)

1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Follow instructions to update DNS records
4. Update Supabase URL configuration with your custom domain

## Continuous Deployment

Netlify automatically redeploys when you push to your connected branch:

```bash
git add .
git commit -m "Update features"
git push origin main
```

Your site will rebuild automatically within 2-3 minutes.

## Important Files Created

- `netlify.toml` - Build configuration and redirect rules
- `public/_redirects` - SPA routing fallback
- `.env.example` - Template for environment variables (don't commit actual .env)

## Security Notes

- ✅ `.env` is in `.gitignore` - local env vars won't be committed
- ✅ Use environment variables in Netlify dashboard for production
- ✅ Never commit API keys to GitHub
- ✅ Supabase RLS policies protect your data

## Performance Optimization

Your app is already optimized with:
- Vite production builds (code splitting, tree shaking)
- Tailwind CSS purging (minimal CSS bundle)
- React lazy loading ready
- Netlify CDN (global edge network)

---

**Your app is now live! 🚀**

Share your Netlify URL with users to access the Smart Attendance System.
