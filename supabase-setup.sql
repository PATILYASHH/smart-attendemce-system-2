-- Smart Attendance System - Supabase Database Setup
-- Run this SQL in your Supabase SQL Editor

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
  penalty DECIMAL(10, 2) DEFAULT 0,
  is_excused BOOLEAN DEFAULT FALSE,
  excuse_reason TEXT,
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
