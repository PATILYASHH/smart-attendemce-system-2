import { useState, useEffect } from 'react'
import { supabase, Student, AttendanceRecord } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import StudentForm from './StudentForm'

interface StudentWithStats extends Student {
  presentDays: number
  absentDays: number
  totalDays: number
  attendancePercentage: number
}

interface StudentsProps {
  onNavigate: (page: 'dashboard' | 'students') => void
}

export default function Students({ onNavigate }: StudentsProps) {
  const [students, setStudents] = useState<StudentWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const { user, signOut } = useAuth()

  useEffect(() => {
    fetchStudentsWithStats()
  }, [user])

  const fetchStudentsWithStats = async () => {
    if (!user) return

    try {
      // Fetch students
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .eq('teacher_id', user.id)
        .order('roll_number')

      if (studentsError) throw studentsError

      // Fetch attendance records
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select('*')
        .eq('teacher_id', user.id)

      if (attendanceError) throw attendanceError

      // Calculate stats for each student
      const studentsWithStats: StudentWithStats[] = (studentsData || []).map(student => {
        const studentAttendance = (attendanceData || []).filter(
          (record: AttendanceRecord) => record.student_id === student.id
        )

        const presentDays = studentAttendance.filter(
          (record: AttendanceRecord) => record.status === 'present'
        ).length

        const absentDays = studentAttendance.filter(
          (record: AttendanceRecord) => record.status === 'absent'
        ).length

        const totalDays = studentAttendance.length
        const attendancePercentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0

        return {
          ...student,
          presentDays,
          absentDays,
          totalDays,
          attendancePercentage,
        }
      })

      setStudents(studentsWithStats)
    } catch (error: any) {
      console.error('Error fetching students:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return

    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id)

      if (error) throw error
      setStudents(students.filter(s => s.id !== id))
    } catch (error: any) {
      alert('Error deleting student: ' + error.message)
    }
  }

  const handleEdit = (student: Student) => {
    setEditingStudent(student)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingStudent(null)
    fetchStudentsWithStats()
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error: any) {
      alert('Error signing out: ' + error.message)
    }
  }

  if (showForm) {
    return <StudentForm student={editingStudent} onClose={handleFormClose} />
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Attendance System</h1>
          <div className="flex gap-4 items-center">
            <button
              onClick={() => onNavigate('dashboard')}
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              Dashboard
            </button>
            <span className="text-gray-600">{user?.email}</span>
            <button
              onClick={handleSignOut}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">All Students</h2>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md transition font-semibold"
          >
            Add Student
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : students.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg">No students added yet. Click "Add Student" to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map((student) => (
              <div key={student.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                  <h3 className="text-xl font-bold text-white">{student.name}</h3>
                  <p className="text-blue-100">Roll: {student.roll_number}</p>
                </div>
                
                <div className="p-6">
                  <p className="text-gray-600 mb-4">{student.email}</p>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-semibold">Present Days:</span>
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-bold">
                        {student.presentDays}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-semibold">Absent Days:</span>
                      <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full font-bold">
                        {student.absentDays}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-semibold">Total Days:</span>
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold">
                        {student.totalDays}
                      </span>
                    </div>

                    {student.totalDays > 0 && (
                      <div className="pt-2">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-700 font-semibold">Attendance:</span>
                          <span className={`font-bold ${
                            student.attendancePercentage >= 75 ? 'text-green-600' :
                            student.attendancePercentage >= 50 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {student.attendancePercentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              student.attendancePercentage >= 75 ? 'bg-green-500' :
                              student.attendancePercentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${student.attendancePercentage}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(student)}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(student.id)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition font-semibold"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
