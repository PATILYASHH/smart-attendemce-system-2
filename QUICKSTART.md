# Quick Start Guide

Follow these steps to get your Smart Attendance System up and running:

## Step 1: Install Dependencies (Already Done ✓)

Dependencies have been installed. If you need to reinstall:
```bash
npm install
```

## Step 2: Set Up Supabase

### A. Create Supabase Account
1. Go to https://supabase.com
2. Sign up for a free account
3. Click "New Project"
4. Fill in project details:
   - Name: smart-attendance-system
   - Database Password: (choose a strong password)
   - Region: (select closest to you)
5. Click "Create new project" and wait 2-3 minutes

### B. Create Database Tables
1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire content from `supabase-setup.sql` file
4. Paste it into the SQL editor
5. Click "Run" or press Ctrl+Enter
6. You should see "Success. No rows returned"

### C. Get Your API Keys
1. Go to **Project Settings** (gear icon in sidebar)
2. Click on **API** section
3. Copy these two values:
   - **Project URL** (looks like: https://xxxxx.supabase.co)
   - **anon public** key (long string starting with "eyJ...")

## Step 3: Configure Environment Variables

1. Create a file named `.env` in the project root folder
2. Copy this template and fill in your values:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxxxxxxxxxxxxxxxxx
```

Replace the values with your actual Supabase URL and anon key.

## Step 4: Start the Development Server

```bash
npm run dev
```

The app will open at: http://localhost:5173

## Step 5: Create Your Teacher Account

1. Open http://localhost:5173 in your browser
2. Click "Don't have an account? Sign Up"
3. Enter your email and password (minimum 6 characters)
4. Click "Sign Up"
5. Check your email for confirmation (optional, depending on Supabase settings)
6. You can now sign in!

## Step 6: Start Using the App

### Add Students
1. Click "Add Student" button
2. Fill in:
   - Student Name
   - Roll Number
   - Email Address
3. Click "Add Student"

### Take Attendance
1. Click "Take Attendance" button
2. Select the date (defaults to today)
3. Mark each student as Present or Absent
4. Click "Save Attendance"

### Manage Students
- **Edit**: Click "Edit" next to any student to update their info
- **Delete**: Click "Delete" to remove a student (confirmation required)

## Troubleshooting

### "Failed to fetch" or connection errors
- Make sure your `.env` file exists and has the correct values
- Restart the dev server after creating/editing `.env`
- Check that your Supabase project is active

### Students not appearing
- Verify you ran the SQL setup script
- Make sure you're logged in
- Check browser console for errors

### Need help?
Check the full [README.md](README.md) file for detailed documentation.

## Next Steps

- **Email Confirmation**: In Supabase dashboard, go to Authentication > Settings to configure email confirmation requirements
- **Production Deployment**: When ready, run `npm run build` and deploy to Vercel, Netlify, or Supabase
- **Customize**: Modify colors, styles, or add new features as needed

Happy teaching! 📚
