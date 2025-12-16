# Penalty System - Database Migration

## Important: Database Update Required

The penalty system has been added to the Smart Attendance System. You need to update your Supabase database to include the new penalty-related columns.

## Migration Steps

### Option 1: For Existing Database (Recommended)

Run this SQL in your Supabase SQL Editor to add the new columns to the existing `attendance` table:

```sql
-- Add penalty columns to existing attendance table
ALTER TABLE attendance 
ADD COLUMN IF NOT EXISTS penalty DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_excused BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS excuse_reason TEXT;

-- Update existing records to have default values
UPDATE attendance 
SET penalty = 0, 
    is_excused = FALSE 
WHERE penalty IS NULL;
```

### Option 2: For New Database Setup

If you're setting up a fresh database, simply run the updated `supabase-setup.sql` file which already includes all penalty-related columns.

## Features Added

### 1. Automatic Penalty System
- **₹100 penalty** is automatically added when a student is marked absent
- Penalties are tracked per absence date
- Total penalties are calculated and displayed

### 2. Excuse/Sick Leave System
- Teachers can excuse absences (e.g., for sick leave, medical emergencies)
- Excusing an absence removes the penalty for that specific date
- Teachers can add a reason when excusing an absence
- Excuses can be removed to reinstate the penalty

### 3. Visual Indicators
- **Red cards** for students with unpaid penalties
- **Green/Blue cards** for students with no penalties
- Penalty badge displayed on student profile cards
- Total penalty amount shown prominently

### 4. Penalty Management Interface
- Click "Manage Penalties & Excuses" on any student card with penalties
- View all absence records with dates and penalty amounts
- Excuse individual absences with a reason
- Remove excuses if needed
- Color-coded records (red = penalty, green = excused)

### 5. Dashboard Statistics
- New "Total Penalties" card showing sum of all unpaid penalties across all students
- Purple color scheme for penalty statistics

## How It Works

1. **Taking Attendance**: When marking a student absent, ₹100 penalty is automatically added to that attendance record

2. **Excusing Absences**: 
   - Navigate to Students page
   - Find student with penalty (red card)
   - Click "Manage Penalties & Excuses"
   - Click "Excuse & Remove Penalty" on any absence
   - Enter reason (e.g., "Sick leave - flu")
   - Penalty is removed for that date

3. **Removing Excuses**:
   - Open penalty management for the student
   - Find the excused absence (green background)
   - Click "Remove Excuse"
   - Penalty is reinstated to ₹100

## Database Schema Changes

New columns in `attendance` table:
- `penalty` (DECIMAL): Amount of penalty in rupees (default: 0)
- `is_excused` (BOOLEAN): Whether the absence is excused (default: false)
- `excuse_reason` (TEXT): Reason for excusing the absence (nullable)

## Notes

- Penalties are only counted for non-excused absences
- Present students always have 0 penalty
- Excusing an absence sets penalty to 0 but keeps the absence record
- All existing absence records will default to ₹0 penalty until you re-mark them
