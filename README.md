# Smart Attendance System

A modern web application for teachers to manage student attendance with authentication, built with React, TypeScript, and Supabase.

## Features

- **Teacher Authentication**: Secure sign-up and login system
- **Student Management**: Add, edit, and delete student records
- **Attendance Tracking**: Mark students as present or absent by date
- **Cross-Device Sync**: Access data from any device
- **Responsive Design**: Works on desktop, tablet, and mobile

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth)
- **Build Tool**: Vite

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account (free tier available)

## Supabase Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up
2. Create a new project
3. Wait for the database to be provisioned

### 2. Create Database Tables

Go to the SQL Editor in your Supabase dashboard and run the following SQL:

```sql
-- Create students table
CREATE TABLE students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  roll_number TEXT NOT NULL,
  email TEXT NOT NULL,
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(teacher_id, roll_number)
);

-- Create attendance table
CREATE TABLE attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent')),
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(student_id, date)
);

-- Enable Row Level Security
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Create policies for students table
CREATE POLICY "Teachers can view their own students"
  ON students FOR SELECT
  USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can insert their own students"
  ON students FOR INSERT
  WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update their own students"
  ON students FOR UPDATE
  USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete their own students"
  ON students FOR DELETE
  USING (auth.uid() = teacher_id);

-- Create policies for attendance table
CREATE POLICY "Teachers can view their own attendance records"
  ON attendance FOR SELECT
  USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can insert their own attendance records"
  ON attendance FOR INSERT
  WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update their own attendance records"
  ON attendance FOR UPDATE
  USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete their own attendance records"
  ON attendance FOR DELETE
  USING (auth.uid() = teacher_id);

-- Create indexes for better performance
CREATE INDEX idx_students_teacher_id ON students(teacher_id);
CREATE INDEX idx_students_roll_number ON students(roll_number);
CREATE INDEX idx_attendance_student_id ON attendance(student_id);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_attendance_teacher_id ON attendance(teacher_id);
```

### 3. Get Your API Credentials

1. Go to Project Settings > API
2. Copy your project URL and anon/public key
3. Create a `.env` file in the project root (see Installation step 3)

## Installation

1. **Clone the repository**
   ```bash
   cd c:\Users\DELL\Documents\GitHub\smart-attendemce-system-2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:5173`

## Usage

### For Teachers

1. **Sign Up / Sign In**
   - Create a new account with your email and password (min 6 characters)
   - Or sign in if you already have an account

2. **Add Students**
   - Click "Add Student" button
   - Fill in student name, roll number, and email
   - Click "Add Student" to save

3. **Manage Students**
   - Edit student information by clicking "Edit"
   - Delete students by clicking "Delete"

4. **Take Attendance**
   - Click "Take Attendance" button
   - Select the date
   - Mark each student as Present or Absent
   - Click "Save Attendance"

## Project Structure

```
smart-attendance-system/
├── src/
│   ├── components/
│   │   ├── Auth.tsx              # Login/Signup component
│   │   ├── Dashboard.tsx         # Main dashboard
│   │   ├── StudentForm.tsx       # Add/Edit student form
│   │   └── AttendanceView.tsx    # Attendance marking interface
│   ├── contexts/
│   │   └── AuthContext.tsx       # Authentication context
│   ├── lib/
│   │   └── supabase.ts           # Supabase client configuration
│   ├── App.tsx                   # Main app component
│   ├── main.tsx                  # App entry point
│   └── index.css                 # Global styles
├── .env                          # Environment variables (create this)
├── .env.example                  # Environment variables template
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## Building for Production

```bash
npm run build
```

The build output will be in the `dist` folder.

## Deployment

You can deploy this application to:
- **Vercel**: Connect your GitHub repo and deploy
- **Netlify**: Drag and drop the `dist` folder
- **Supabase Hosting**: Use Supabase's hosting feature

Make sure to set the environment variables in your hosting platform.

## Database Schema

### Students Table
- `id`: UUID (Primary Key)
- `name`: Text
- `roll_number`: Text (Unique per teacher)
- `email`: Text
- `teacher_id`: UUID (Foreign Key to auth.users)
- `created_at`: Timestamp

### Attendance Table
- `id`: UUID (Primary Key)
- `student_id`: UUID (Foreign Key to students)
- `date`: Date
- `status`: Text (present/absent)
- `teacher_id`: UUID (Foreign Key to auth.users)
- `created_at`: Timestamp

## Security

- Row Level Security (RLS) enabled on all tables
- Teachers can only access their own students and attendance records
- Authentication required for all operations
- Email confirmation for new accounts (configurable in Supabase)

## Troubleshooting

### Can't connect to Supabase
- Check if your `.env` file has the correct credentials
- Verify your Supabase project is active
- Check browser console for error messages

### Students not showing up
- Verify RLS policies are set up correctly
- Check if you're logged in with the correct account
- Look for errors in the browser console

### Attendance not saving
- Ensure the `attendance` table exists
- Check RLS policies on the attendance table
- Verify you've marked at least one student

## License

MIT

## Support

For issues and questions, please create an issue in the GitHub repository.
