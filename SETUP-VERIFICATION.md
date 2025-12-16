# Setup Verification Checklist

Use this checklist to verify your Smart Attendance System is properly configured.

## ✓ Project Setup (COMPLETED)

- [x] Dependencies installed
- [x] Development server running at http://localhost:5173
- [x] All TypeScript files created
- [x] Tailwind CSS configured
- [x] Environment variables file exists

## Database Setup (TODO - Follow these steps)

### Step 1: Verify Supabase Tables

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Go to **Table Editor** in the left sidebar
4. You should see two tables:
   - ✅ `students` table
   - ✅ `attendance` table

If tables don't exist, go to **SQL Editor** and run the `supabase-setup.sql` file.

### Step 2: Test Authentication

1. Open http://localhost:5173 in your browser
2. You should see the login/signup page
3. Create a test account:
   - Email: your-email@example.com
   - Password: testpassword123 (min 6 chars)
4. Check your email for confirmation (if enabled)

### Step 3: Test Student Management

After logging in:

1. **Add a Student**:
   - Click "Add Student"
   - Name: John Doe
   - Roll Number: 001
   - Email: john@example.com
   - Click "Add Student"
   - Should see success and student appears in list

2. **Edit a Student**:
   - Click "Edit" on the student
   - Change name to: Jane Doe
   - Click "Update Student"
   - Verify name changed in the list

3. **Take Attendance**:
   - Click "Take Attendance"
   - Select today's date
   - Mark student as Present
   - Click "Save Attendance"
   - Should see success message

4. **Delete a Student**:
   - Click "Delete" on a student
   - Confirm deletion
   - Student should be removed

### Step 4: Test Cross-Device Sync

1. Open the app in a different browser or incognito window
2. Sign in with the same account
3. Verify you see the same students
4. Add a student in one window
5. Refresh the other window
6. Student should appear in both

## Common Issues & Solutions

### Issue: "Failed to fetch" error
**Solution**: 
- Check `.env` file has correct Supabase URL and key
- Restart development server: `npm run dev`
- Verify Supabase project is active

### Issue: Students not showing up
**Solution**:
- Run the SQL setup script in Supabase SQL Editor
- Check Row Level Security (RLS) policies are created
- Verify you're logged in
- Check browser console for errors

### Issue: Cannot sign in/up
**Solution**:
- Verify Supabase Auth is enabled
- Check email confirmation settings in Supabase
- Try a different email address
- Check browser console for errors

### Issue: Attendance not saving
**Solution**:
- Verify `attendance` table exists
- Check RLS policies on attendance table
- Ensure you marked at least one student
- Check browser console for errors

## Database Verification Queries

Run these in Supabase SQL Editor to verify setup:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('students', 'attendance');

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('students', 'attendance');

-- Check policies exist
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

Expected results:
- Both tables should exist
- Both should have `rowsecurity = true`
- Should see 8 policies total (4 for students, 4 for attendance)

## Performance Checklist

- [ ] Database indexes created (check `supabase-setup.sql`)
- [ ] RLS policies are efficient
- [ ] No console errors in browser
- [ ] App loads quickly (< 2 seconds)

## Security Checklist

- [ ] RLS enabled on all tables
- [ ] Teachers can only see their own data
- [ ] Password minimum 6 characters
- [ ] Environment variables not committed to git
- [ ] Email confirmation configured (optional but recommended)

## Ready for Production?

Before deploying:
- [ ] All tests pass
- [ ] No console errors
- [ ] Database properly configured
- [ ] Environment variables set in hosting platform
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] Backup strategy in place

---

**Current Status**: Development server is running! ✅
**Next Step**: Complete the Supabase database setup using `supabase-setup.sql`
**Access**: http://localhost:5173

For detailed instructions, see [QUICKSTART.md](QUICKSTART.md)
