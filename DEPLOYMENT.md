# Deployment Guide

This guide will help you deploy your Smart Attendance System to production.

## Option 1: Deploy to Vercel (Recommended)

### Prerequisites
- GitHub account
- Vercel account (free tier available)
- Code pushed to GitHub repository

### Steps

1. **Push to GitHub** (if not already done)
   ```bash
   git add .
   git commit -m "Initial commit - Smart Attendance System"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure:
     - Framework Preset: Vite
     - Build Command: `npm run build`
     - Output Directory: `dist`
   
3. **Add Environment Variables**
   - In Vercel project settings, go to "Environment Variables"
   - Add:
     - `VITE_SUPABASE_URL` = your_supabase_url
     - `VITE_SUPABASE_ANON_KEY` = your_supabase_anon_key
   
4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at: `your-project.vercel.app`

### Auto-Deploy
Every push to your main branch will automatically deploy to Vercel.

---

## Option 2: Deploy to Netlify

### Steps

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop the `dist` folder onto Netlify
   - OR connect your GitHub repository

3. **Configure Environment Variables**
   - Go to Site settings > Environment variables
   - Add the same environment variables as above

4. **Redeploy** if needed
   - Click "Trigger deploy" after adding environment variables

---

## Option 3: Deploy to Supabase (Static Hosting)

Supabase now offers static site hosting for front-end applications.

### Steps

1. **Install Supabase CLI**
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**
   ```bash
   supabase login
   ```

3. **Link your project**
   ```bash
   supabase link --project-ref your-project-ref
   ```

4. **Build and deploy**
   ```bash
   npm run build
   supabase functions deploy
   ```

---

## Environment Variables for Production

Make sure these are set in your hosting platform:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_actual_anon_key_here
```

⚠️ **Important**: Never commit the `.env` file to Git! It's already in `.gitignore`.

---

## Post-Deployment Checklist

### Supabase Configuration

1. **Update Allowed URLs**
   - Go to Supabase Dashboard > Authentication > URL Configuration
   - Add your production URL to "Site URL"
   - Add your production URL to "Redirect URLs"

2. **Email Templates** (Optional)
   - Customize email templates in Authentication > Email Templates
   - Update URLs to point to your production domain

3. **Rate Limiting**
   - Configure rate limiting in Project Settings > API
   - Recommended: 100 requests per second for free tier

### Security

1. **Enable Email Confirmation**
   - Go to Authentication > Settings
   - Enable "Confirm email" option
   - This prevents spam accounts

2. **Password Requirements**
   - Already set to minimum 6 characters in code
   - Consider increasing for production

3. **CORS Settings**
   - Supabase automatically handles CORS
   - Verify in Project Settings > API

---

## Testing Production Deployment

1. **Test Authentication**
   - Sign up with a new account
   - Verify email confirmation works
   - Sign in successfully

2. **Test Student Management**
   - Add students
   - Edit student information
   - Delete students

3. **Test Attendance**
   - Mark attendance
   - Verify it saves correctly
   - Check cross-device sync

4. **Performance**
   - Check page load times (should be < 3 seconds)
   - Test on mobile devices
   - Verify responsive design

---

## Monitoring & Maintenance

### Supabase Dashboard

Monitor your app in the Supabase dashboard:
- **Database**: Check table sizes and query performance
- **Auth**: Monitor user sign-ups and active users
- **Logs**: Check for errors and issues
- **Usage**: Track API calls and storage

### Set Up Alerts

1. **Database Backups**
   - Supabase automatically backs up your database
   - Verify in Database > Backups

2. **Usage Alerts**
   - Set up email alerts when approaching limits
   - Go to Project Settings > Billing

---

## Upgrading to Production Plan

If you need more capacity:

1. **Supabase Pro** ($25/month)
   - 8GB database
   - 100GB bandwidth
   - 7 day log retention
   - Daily backups

2. **What to upgrade for**:
   - More than 500 active users
   - Need priority support
   - Require advanced monitoring
   - Need custom domains for Supabase

---

## Custom Domain Setup

### Vercel
1. Go to Project Settings > Domains
2. Add your custom domain
3. Update DNS records as instructed

### Netlify
1. Go to Domain Management
2. Add custom domain
3. Configure DNS

### SSL Certificate
- Automatically provided by Vercel/Netlify
- Free Let's Encrypt certificate

---

## Troubleshooting Production Issues

### Issue: 404 on refresh
**Solution**: Configure rewrites in hosting platform
- Vercel: Automatically handled
- Netlify: Add `_redirects` file with `/* /index.html 200`

### Issue: Environment variables not working
**Solution**:
- Verify variables are set in hosting platform
- Redeploy after adding variables
- Check variable names match exactly (case-sensitive)

### Issue: CORS errors
**Solution**:
- Add production URL to Supabase allowed origins
- Verify Supabase URL is correct in env variables

---

## Backup Strategy

### Database Backups
- Supabase automatically backs up daily (free tier)
- Download manual backups: Database > Backups > Export

### Code Backups
- Keep code in GitHub (primary)
- Tag releases: `git tag v1.0.0`
- Push tags: `git push --tags`

---

## Support & Updates

### Getting Help
- Supabase Discord: https://discord.supabase.com
- Vercel Discord: https://discord.gg/vercel
- GitHub Issues: Create issues in your repo

### Updating Dependencies
```bash
npm update
npm audit fix
```

Run monthly to keep dependencies secure and up-to-date.

---

**Congratulations!** 🎉 Your Smart Attendance System is ready for production!

Next steps:
1. Complete the deployment using one of the options above
2. Test thoroughly in production
3. Share with teachers and get feedback
4. Monitor usage and performance
