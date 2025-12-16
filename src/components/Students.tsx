import { useState, useEffect } from 'react'
import { supabase, Student, AttendanceRecord } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import StudentForm from './StudentForm'

interface StudentWithStats extends Student {
  presentDays: number
  absentDays: number
  totalDays: number
  attendancePercentage: number
  totalPenalty: number
  unpaidPenalty: number
}

interface StudentsProps {
  onNavigate: (page: 'dashboard' | 'students') => void
}

export default function Students({ onNavigate }: StudentsProps) {
  const [students, setStudents] = useState<StudentWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [showPenaltyModal, setShowPenaltyModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<StudentWithStats | null>(null)
  const [penaltyRecords, setPenaltyRecords] = useState<AttendanceRecord[]>([])
  const { user, signOut } = useAuth()

  useEffect(() => {
    fetchStudentsWithStats()
  }, [user])

  const fetchStudentsWithStats = async () => {
    if (!user) return

    try {
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .eq('teacher_id', user.id)
        .order('roll_number')

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

        const totalDays = studentAttendance.length
        const attendancePercentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0

        const totalPenalty = studentAttendance
          .filter((record: AttendanceRecord) => !record.is_excused)
          .reduce((sum: number, record: AttendanceRecord) => sum + (record.penalty || 0), 0)

        const unpaidPenalty = totalPenalty

        return {
          ...student,
          presentDays,
          absentDays,
          totalDays,
          attendancePercentage,
          totalPenalty,
          unpaidPenalty,
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

  const handleManagePenalty = async (student: StudentWithStats) => {
    setSelectedStudent(student)
    
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('student_id', student.id)
        .eq('status', 'absent')
        .order('date', { ascending: false })

      if (error) throw error
      setPenaltyRecords(data || [])
      setShowPenaltyModal(true)
    } catch (error: any) {
      alert('Error fetching penalty records: ' + error.message)
    }
  }

  const handleExcuseAbsence = async (recordId: string, reason: string) => {
    try {
      const { error } = await supabase
        .from('attendance')
        .update({
          is_excused: true,
          excuse_reason: reason,
          penalty: 0,
        })
        .eq('id', recordId)

      if (error) throw error

      alert('Absence excused and penalty removed successfully!')
      setShowPenaltyModal(false)
      fetchStudentsWithStats()
    } catch (error: any) {
      alert('Error excusing absence: ' + error.message)
    }
  }

  const handleRemoveExcuse = async (recordId: string) => {
    try {
      const { error } = await supabase
        .from('attendance')
        .update({
          is_excused: false,
          excuse_reason: null,
          penalty: 100,
        })
        .eq('id', recordId)

      if (error) throw error

      alert('Excuse removed and penalty reinstated!')
      setShowPenaltyModal(false)
      fetchStudentsWithStats()
    } catch (error: any) {
      alert('Error removing excuse: ' + error.message)
    }
  }

  if (showForm) {
    return <StudentForm student={editingStudent} onClose={handleFormClose} />
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <nav className="glass shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 animate-slideInLeft">
              <div className="bg-white rounded-full p-2 shadow-lg">
                <i className="bi bi-people-fill text-3xl gradient-primary" style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}></i>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Smart Attendance</h1>
                <p className="text-sm text-gray-600">Student Management</p>
              </div>
            </div>
            <div className="flex gap-4 items-center animate-slideInRight">
              <button
                onClick={() => onNavigate('dashboard')}
                className="text-purple-700 hover:text-purple-900 font-semibold flex items-center gap-2 transition-all hover:scale-105"
              >
                <i className="bi bi-speedometer2"></i>
                Dashboard
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
        <div className="flex justify-between items-center mb-8 animate-fadeIn">
          <div>
            <h2 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <i className="bi bi-person-lines-fill"></i>
              All Students
            </h2>
            <p className="text-purple-100">Manage your student records</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-white text-blue-600 px-6 py-3 rounded-full transition-all shadow-lg hover:shadow-2xl hover:scale-105 font-bold flex items-center gap-2 btn-modern"
          >
            <i className="bi bi-person-plus-fill text-xl"></i>
            Add Student
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-white border-t-purple-300"></div>
            <p className="text-white mt-4 font-semibold">Loading students...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-16 text-center animate-scaleIn">
            <i className="bi bi-person-x text-7xl text-gray-300"></i>
            <p className="text-gray-500 text-xl mt-4 font-semibold">No students added yet</p>
            <p className="text-gray-400 mt-2">Click "Add Student" to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map((student, index) => (
              <div 
                key={student.id} 
                className={`rounded-2xl shadow-xl overflow-hidden card-hover animate-fadeIn ${
                  student.unpaidPenalty > 0 ? 'bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-300' : 'bg-white'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`px-6 py-5 ${
                  student.unpaidPenalty > 0 
                    ? 'bg-gradient-to-r from-red-500 to-red-600' 
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                        <i className="bi bi-person-badge"></i>
                        {student.name}
                      </h3>
                      <p className={`text-sm ${student.unpaidPenalty > 0 ? 'text-red-100' : 'text-blue-100'}`}>
                        <i className="bi bi-hash"></i> Roll: {student.roll_number}
                      </p>
                    </div>
                    {student.unpaidPenalty > 0 && (
                      <div className="bg-white bg-opacity-30 px-3 py-1 rounded-full backdrop-blur-sm">
                        <i className="bi bi-exclamation-triangle-fill text-white text-sm"></i>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center gap-2 text-gray-600 mb-5">
                    <i className="bi bi-envelope-fill"></i>
                    <p className="text-sm">{student.email}</p>
                  </div>
                  
                  {student.unpaidPenalty > 0 && (
                    <div className="mb-5 p-4 bg-gradient-to-r from-red-100 to-pink-100 border-l-4 border-red-500 rounded-lg shadow-md animate-pulse-slow">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-red-800 font-bold flex items-center gap-2">
                          <i className="bi bi-exclamation-circle-fill"></i>
                          Penalty Amount
                        </span>
                        <span className="text-red-900 text-2xl font-bold">?{student.unpaidPenalty}</span>
                      </div>
                      <button
                        onClick={() => handleManagePenalty(student)}
                        className="mt-2 w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2"
                      >
                        <i className="bi bi-gear-fill"></i>
                        Manage Penalties
                      </button>
                    </div>
                  )}
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                      <span className="text-gray-700 font-semibold flex items-center gap-2">
                        <i className="bi bi-check-circle-fill text-green-600"></i>
                        Present
                      </span>
                      <span className="bg-green-500 text-white px-4 py-1 rounded-full font-bold text-lg shadow-md">
                        {student.presentDays}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
                      <span className="text-gray-700 font-semibold flex items-center gap-2">
                        <i className="bi bi-x-circle-fill text-red-600"></i>
                        Absent
                      </span>
                      <span className="bg-red-500 text-white px-4 py-1 rounded-full font-bold text-lg shadow-md">
                        {student.absentDays}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <span className="text-gray-700 font-semibold flex items-center gap-2">
                        <i className="bi bi-calendar-check-fill text-blue-600"></i>
                        Total Days
                      </span>
                      <span className="bg-blue-500 text-white px-4 py-1 rounded-full font-bold text-lg shadow-md">
                        {student.totalDays}
                      </span>
                    </div>

                    {student.totalDays > 0 && (
                      <div className="pt-3 px-3 py-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-gray-700 font-semibold flex items-center gap-2">
                            <i className="bi bi-graph-up text-purple-600"></i>
                            Attendance Rate
                          </span>
                          <span className={`font-bold text-xl ${
                            student.attendancePercentage >= 75 ? 'text-green-600' :
                            student.attendancePercentage >= 50 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {student.attendancePercentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                          <div
                            className={`h-3 rounded-full shadow-md ${
                              student.attendancePercentage >= 75 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                              student.attendancePercentage >= 50 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' : 
                              'bg-gradient-to-r from-red-400 to-red-600'
                            }`}
                            style={{ width: `${student.attendancePercentage}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEdit(student)}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-3 rounded-lg transition-all font-semibold shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      <i className="bi bi-pencil-fill"></i>
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(student.id)}
                      className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-3 rounded-lg transition-all font-semibold shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      <i className="bi bi-trash-fill"></i>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showPenaltyModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 animate-fadeIn backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto animate-scaleIn">
            <div className="gradient-danger px-6 py-5 sticky top-0">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                    <i className="bi bi-cash-stack"></i>
                    {selectedStudent.name}
                  </h3>
                  <p className="text-red-100 flex items-center gap-2 mt-1">
                    <i className="bi bi-gear"></i>
                    Penalty Management
                  </p>
                </div>
                <button
                  onClick={() => setShowPenaltyModal(false)}
                  className="text-white hover:text-red-100 bg-white bg-opacity-20 rounded-full p-2 hover:bg-opacity-30 transition-all"
                >
                  <i className="bi bi-x-lg text-xl"></i>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6 p-5 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 rounded-lg shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 font-semibold flex items-center gap-2">
                    <i className="bi bi-exclamation-triangle-fill text-red-600 text-xl"></i>
                    Total Outstanding Penalty
                  </span>
                  <span className="text-red-600 text-3xl font-bold">?{selectedStudent.unpaidPenalty}</span>
                </div>
              </div>

              <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <i className="bi bi-list-ul"></i>
                Absence Records
              </h4>
              
              {penaltyRecords.length === 0 ? (
                <div className="text-center py-12">
                  <i className="bi bi-inbox text-6xl text-gray-300"></i>
                  <p className="text-gray-400 mt-3 text-lg">No absence records found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {penaltyRecords.map((record) => (
                    <div
                      key={record.id}
                      className={`p-5 rounded-xl border-2 shadow-md transition-all hover:shadow-lg ${
                        record.is_excused
                          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300'
                          : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-bold text-gray-800 text-lg flex items-center gap-2">
                            <i className="bi bi-calendar-event"></i>
                            {new Date(record.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                          <p className={`text-sm font-semibold mt-1 flex items-center gap-2 ${
                            record.is_excused ? 'text-green-600' : 'text-red-600'
                          }`}>
                            <i className={`bi ${record.is_excused ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}`}></i>
                            {record.is_excused ? 'Excused Absence' : 'Absent with Penalty'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-3xl font-bold ${record.is_excused ? 'text-green-600' : 'text-red-600'}`}>
                            ?{record.penalty || 0}
                          </p>
                          {record.is_excused && (
                            <p className="text-xs text-green-600 font-semibold mt-1 flex items-center gap-1">
                              <i className="bi bi-shield-fill-check"></i>
                              Waived
                            </p>
                          )}
                        </div>
                      </div>

                      {record.is_excused && record.excuse_reason && (
                        <div className="mt-3 p-3 bg-white rounded-lg border border-green-200">
                          <p className="text-sm text-gray-700 flex items-start gap-2">
                            <i className="bi bi-chat-left-text-fill text-green-600 mt-1"></i>
                            <span><span className="font-semibold">Reason:</span> {record.excuse_reason}</span>
                          </p>
                        </div>
                      )}

                      <div className="mt-4 flex gap-3">
                        {!record.is_excused ? (
                          <button
                            onClick={() => {
                              const reason = prompt('Enter reason for excusing this absence (e.g., sick leave, medical emergency):')
                              if (reason && reason.trim()) {
                                handleExcuseAbsence(record.id, reason.trim())
                              }
                            }}
                            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-lg transition-all text-sm font-bold shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                          >
                            <i className="bi bi-shield-fill-check"></i>
                            Excuse & Remove Penalty
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              if (confirm('Are you sure you want to remove the excuse and reinstate the penalty?')) {
                                handleRemoveExcuse(record.id)
                              }
                            }}
                            className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-lg transition-all text-sm font-bold shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                          >
                            <i className="bi bi-x-circle-fill"></i>
                            Remove Excuse
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => setShowPenaltyModal(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-3 rounded-lg transition-all font-bold shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  <i className="bi bi-x-circle"></i>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
