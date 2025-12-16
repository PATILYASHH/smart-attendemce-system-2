import { useState, useEffect } from 'react'
import { supabase, Student } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import StudentForm from './StudentForm'
import AttendanceView from './AttendanceView'

export default function Dashboard() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [showAttendance, setShowAttendance] = useState(false)
  const { user, signOut } = useAuth()

  useEffect(() => {
    fetchStudents()
  }, [user])

  const fetchStudents = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('teacher_id', user.id)
        .order('roll_number')

      if (error) throw error
      setStudents(data || [])
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
    fetchStudents()
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error: any) {
      alert('Error signing out: ' + error.message)
    }
  }

  if (showAttendance) {
    return <AttendanceView students={students} onBack={() => setShowAttendance(false)} />
  }

  if (showForm) {
    return <StudentForm student={editingStudent} onClose={handleFormClose} />
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Attendance System</h1>
          <div className="flex gap-4">
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
          <h2 className="text-3xl font-bold text-gray-800">Students</h2>
          <div className="flex gap-4">
            <button
              onClick={() => setShowAttendance(true)}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md transition font-semibold"
            >
              Take Attendance
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md transition font-semibold"
            >
              Add Student
            </button>
          </div>
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
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Roll Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.roll_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(student)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(student.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
