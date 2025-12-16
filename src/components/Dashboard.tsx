import { useState, useEffect } from 'react'
import { supabase, Student, AttendanceRecord } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import StudentForm from './StudentForm'
import AttendanceView from './AttendanceView'

interface StudentWithStats extends Student {
  presentDays: number
  absentDays: number
  totalPenalty: number
}

interface DashboardProps {
  onNavigate: (page: 'dashboard' | 'students') => void
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [students, setStudents] = useState<Student[]>([])
  const [studentsWithStats, setStudentsWithStats] = useState<StudentWithStats[]>([])
  const [todayPresent, setTodayPresent] = useState(0)
  const [todayAbsent, setTodayAbsent] = useState(0)
  const [totalPenalties, setTotalPenalties] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [showAttendance, setShowAttendance] = useState(false)
  const { user, signOut } = useAuth()

  useEffect(() => {
    fetchStudents()
    fetchTodayAttendance()
    fetchStudentsWithStats()
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

  const fetchTodayAttendance = async () => {
    if (!user) return

    try {
      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('teacher_id', user.id)
        .eq('date', today)

      if (error) throw error

      const present = (data || []).filter((record: AttendanceRecord) => record.status === 'present').length
      const absent = (data || []).filter((record: AttendanceRecord) => record.status === 'absent').length

      setTodayPresent(present)
      setTodayAbsent(absent)
    } catch (error: any) {
      console.error('Error fetching today attendance:', error.message)
    }
  }

  const fetchStudentsWithStats = async () => {
    if (!user) return

    try {
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .eq('teacher_id', user.id)

      if (studentsError) throw studentsError

      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select('*')
        .eq('teacher_id', user.id)

      if (attendanceError) throw attendanceError

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

        // Calculate total penalty (only from non-excused absences)
        const totalPenalty = studentAttendance
          .filter((record: AttendanceRecord) => !record.is_excused)
          .reduce((sum: number, record: AttendanceRecord) => sum + (record.penalty || 0), 0)

        return {
          ...student,
          presentDays,
          absentDays,
          totalPenalty,
        }
      })

      setStudentsWithStats(studentsWithStats)

      // Calculate total penalties across all students
      const allPenalties = studentsWithStats.reduce((sum, student) => sum + student.totalPenalty, 0)
      setTotalPenalties(allPenalties)
    } catch (error: any) {
      console.error('Error fetching students with stats:', error.message)
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
    fetchTodayAttendance()
    fetchStudentsWithStats()
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
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Modern Navbar */}
      <nav className="glass shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 animate-slideInLeft">
              <div className="bg-white rounded-full p-2 shadow-lg">
                <i className="bi bi-clipboard-check-fill text-3xl gradient-primary" style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}></i>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Smart Attendance</h1>
                <p className="text-sm text-gray-600">Manage with ease</p>
              </div>
            </div>
            <div className="flex gap-4 items-center animate-slideInRight">
              <button
                onClick={() => onNavigate('students')}
                className="text-purple-700 hover:text-purple-900 font-semibold flex items-center gap-2 transition-all hover:scale-105"
              >
                <i className="bi bi-people-fill"></i>
                All Students
              </button>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md">
                <i className="bi bi-person-circle text-purple-600"></i>
                <span className="text-gray-700 font-medium">{user?.email}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2 btn-modern"
              >
                <i className="bi bi-box-arrow-right"></i>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8 animate-fadeIn">
          <div>
            <h2 className="text-4xl font-bold text-white mb-2">Dashboard</h2>
            <p className="text-purple-100 flex items-center gap-2">
              <i className="bi bi-calendar3"></i>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setShowAttendance(true)}
              className="bg-white text-green-600 px-6 py-3 rounded-full transition-all shadow-lg hover:shadow-2xl hover:scale-105 font-bold flex items-center gap-2 btn-modern"
            >
              <i className="bi bi-check-circle-fill text-xl"></i>
              Take Attendance
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="bg-white text-blue-600 px-6 py-3 rounded-full transition-all shadow-lg hover:shadow-2xl hover:scale-105 font-bold flex items-center gap-2 btn-modern"
            >
              <i className="bi bi-person-plus-fill text-xl"></i>
              Add Student
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-6 border-t-4 border-blue-500 card-hover animate-fadeIn" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Total Students</p>
                <p className="text-4xl font-bold text-gray-800 mt-2">{students.length}</p>
                <p className="text-xs text-gray-500 mt-1">Registered</p>
              </div>
              <div className="gradient-info rounded-full p-4 shadow-lg">
                <i className="bi bi-people-fill text-3xl text-white"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border-t-4 border-green-500 card-hover animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Today Present</p>
                <p className="text-4xl font-bold text-green-600 mt-2">{todayPresent}</p>
                <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                  <i className="bi bi-arrow-up"></i>Active
                </p>
              </div>
              <div className="gradient-success rounded-full p-4 shadow-lg">
                <i className="bi bi-check-circle-fill text-3xl text-white"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border-t-4 border-red-500 card-hover animate-fadeIn" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Today Absent</p>
                <p className="text-4xl font-bold text-red-600 mt-2">{todayAbsent}</p>
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <i className="bi bi-arrow-down"></i>Missing
                </p>
              </div>
              <div className="gradient-danger rounded-full p-4 shadow-lg">
                <i className="bi bi-x-circle-fill text-3xl text-white"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border-t-4 border-yellow-500 card-hover animate-fadeIn" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Not Marked</p>
                <p className="text-4xl font-bold text-yellow-600 mt-2">
                  {students.length - todayPresent - todayAbsent}
                </p>
                <p className="text-xs text-yellow-500 mt-1 flex items-center gap-1">
                  <i className="bi bi-clock-fill"></i>Pending
                </p>
              </div>
              <div className="gradient-warning rounded-full p-4 shadow-lg">
                <i className="bi bi-hourglass-split text-3xl text-white"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border-t-4 border-purple-500 card-hover animate-fadeIn" style={{ animationDelay: '0.5s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Total Penalties</p>
                <p className="text-4xl font-bold text-purple-600 mt-2">₹{totalPenalties}</p>
                <p className="text-xs text-purple-500 mt-1 flex items-center gap-1">
                  <i className="bi bi-cash-stack"></i>Outstanding
                </p>
              </div>
              <div className="gradient-purple rounded-full p-4 shadow-lg">
                <i className="bi bi-currency-rupee text-3xl text-white"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Most Present and Most Absent Students */}
        {studentsWithStats.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-xl p-6 card-hover animate-slideInLeft">
              <div className="flex items-center gap-3 mb-6">
                <div className="gradient-success rounded-full p-3 shadow-lg">
                  <i className="bi bi-trophy-fill text-2xl text-white"></i>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">Top Performers</h3>
                  <p className="text-sm text-gray-500">Most present students</p>
                </div>
              </div>
              <div className="space-y-3">
                {studentsWithStats
                  .filter(s => s.presentDays > 0)
                  .sort((a, b) => b.presentDays - a.presentDays)
                  .slice(0, 5)
                  .map((student, index) => (
                    <div key={student.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl hover:shadow-md transition-all border border-green-100">
                      <div className="flex items-center gap-3">
                        <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold shadow-md">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 flex items-center gap-2">
                            {student.name}
                            {index === 0 && <i className="bi bi-star-fill text-yellow-500"></i>}
                          </p>
                          <p className="text-sm text-gray-600">Roll: {student.roll_number}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-green-600">{student.presentDays}</p>
                        <p className="text-xs text-gray-600 font-semibold">days</p>
                      </div>
                    </div>
                  ))}
                {studentsWithStats.filter(s => s.presentDays > 0).length === 0 && (
                  <div className="text-center py-8">
                    <i className="bi bi-inbox text-5xl text-gray-300"></i>
                    <p className="text-gray-400 mt-2">No attendance data yet</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6 card-hover animate-slideInRight">
              <div className="flex items-center gap-3 mb-6">
                <div className="gradient-danger rounded-full p-3 shadow-lg">
                  <i className="bi bi-exclamation-triangle-fill text-2xl text-white"></i>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">Need Attention</h3>
                  <p className="text-sm text-gray-500">Most absent students</p>
                </div>
              </div>
              <div className="space-y-3">
                {studentsWithStats
                  .filter(s => s.absentDays > 0)
                  .sort((a, b) => b.absentDays - a.absentDays)
                  .slice(0, 5)
                  .map((student, index) => (
                    <div key={student.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl hover:shadow-md transition-all border border-red-100">
                      <div className="flex items-center gap-3">
                        <div className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold shadow-md">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 flex items-center gap-2">
                            {student.name}
                            {student.totalPenalty > 0 && <i className="bi bi-exclamation-circle-fill text-red-500"></i>}
                          </p>
                          <p className="text-sm text-gray-600">Roll: {student.roll_number}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-red-600">{student.absentDays}</p>
                        <p className="text-xs text-gray-600 font-semibold">days</p>
                      </div>
                    </div>
                  ))}
                {studentsWithStats.filter(s => s.absentDays > 0).length === 0 && (
                  <div className="text-center py-8">
                    <i className="bi bi-check-circle text-5xl text-gray-300"></i>
                    <p className="text-gray-400 mt-2">No absence data yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-white border-t-purple-300"></div>
            <p className="text-white mt-4 font-semibold">Loading data...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-16 text-center animate-scaleIn">
            <i className="bi bi-inbox text-7xl text-gray-300"></i>
            <p className="text-gray-500 text-xl mt-4 font-semibold">No students added yet</p>
            <p className="text-gray-400 mt-2">Click "Add Student" to get started</p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
