import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Student {
  id: string
  name: string
  roll_number: string
  email: string
  created_at: string
  teacher_id: string
}

export interface AttendanceRecord {
  id: string
  student_id: string
  date: string
  status: 'present' | 'absent'
  teacher_id: string
  created_at: string
}
