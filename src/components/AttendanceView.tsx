import { useState } from 'react'
import { supabase, Student } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface AttendanceViewProps {
  students: Student[]
  onBack: () => void
}

export default function AttendanceView({ students, onBack }: AttendanceViewProps) {
  const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent'>>({})
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  const handleAttendanceChange = (studentId: string, status: 'present' | 'absent') => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status,
    }))
  }

  const handleMarkAll = (status: 'present' | 'absent') => {
    const allStudents: Record<string, 'present' | 'absent'> = {}
    students.forEach(student => {
      allStudents[student.id] = status
    })
    setAttendance(allStudents)
  }

  const handleSubmit = async () => {
    if (Object.keys(attendance).length === 0) {
      alert('Please mark attendance for at least one student')
      return
    }

    setLoading(true)

    try {
      const records = Object.entries(attendance).map(([studentId, status]) => ({
        student_id: studentId,
        date: selectedDate,
        status,
        penalty: status === 'absent' ? 100 : 0,
        is_excused: false,
        excuse_reason: null,
        teacher_id: user?.id,
      }))

      // First, delete existing records for this date
      await supabase
        .from('attendance')
        .delete()
        .eq('date', selectedDate)
        .in('student_id', Object.keys(attendance))

      // Then insert new records
      const { error } = await supabase
        .from('attendance')
        .insert(records)

      if (error) throw error

      alert('Attendance saved successfully!')
      setAttendance({})
      // Go back to dashboard after successful submission
      setTimeout(() => onBack(), 500)
    } catch (error: any) {
      alert('Error saving attendance: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const presentCount = Object.values(attendance).filter(s => s === 'present').length
  const absentCount = Object.values(attendance).filter(s => s === 'absent').length
  const unmarkedCount = students.length - presentCount - absentCount

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <nav className="glass shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 animate-slideInLeft">
              <div className="bg-white rounded-full p-2 shadow-lg">
                <i className="bi bi-check2-square text-3xl gradient-primary" style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}></i>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Take Attendance</h1>
                <p className="text-sm text-gray-600">Mark students as present or absent</p>
              </div>
            </div>
            <button
              onClick={onBack}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-full transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2 btn-modern"
            >
              <i className="bi bi-arrow-left"></i>
              Back to Dashboard
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Date Selection Card */}
          <div className="lg:col-span-1 bg-white rounded-2xl shadow-xl p-6 card-hover animate-fadeIn">
            <label className="block text-gray-700 text-sm font-bold mb-3 flex items-center gap-2">
              <i className="bi bi-calendar-event text-purple-600 text-xl"></i>
              Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 font-semibold shadow-sm"
            />
            
            <div className="mt-6 space-y-3">
              <button
                onClick={() => handleMarkAll('present')}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-3 rounded-xl transition-all font-bold shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <i className="bi bi-check-all"></i>
                Mark All Present
              </button>
              <button
                onClick={() => handleMarkAll('absent')}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-3 rounded-xl transition-all font-bold shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <i className="bi bi-x-lg"></i>
                Mark All Absent
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-xl p-6 border-t-4 border-green-500 card-hover animate-fadeIn" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-semibold uppercase">Marked Present</p>
                  <p className="text-4xl font-bold text-green-600 mt-2">{presentCount}</p>
                </div>
                <div className="gradient-success rounded-full p-4 shadow-lg">
                  <i className="bi bi-check-circle-fill text-3xl text-white"></i>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6 border-t-4 border-red-500 card-hover animate-fadeIn" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-semibold uppercase">Marked Absent</p>
                  <p className="text-4xl font-bold text-red-600 mt-2">{absentCount}</p>
                </div>
                <div className="gradient-danger rounded-full p-4 shadow-lg">
                  <i className="bi bi-x-circle-fill text-3xl text-white"></i>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6 border-t-4 border-yellow-500 card-hover animate-fadeIn" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-semibold uppercase">Not Marked</p>
                  <p className="text-4xl font-bold text-yellow-600 mt-2">{unmarkedCount}</p>
                </div>
                <div className="gradient-warning rounded-full p-4 shadow-lg">
                  <i className="bi bi-hourglass-split text-3xl text-white"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {students.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-16 text-center animate-scaleIn">
            <i className="bi bi-inbox text-7xl text-gray-300"></i>
            <p className="text-gray-500 text-xl mt-4 font-semibold">No students available</p>
            <p className="text-gray-400 mt-2">Please add students first</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <i className="bi bi-people-fill"></i>
                  Students List ({students.length})
                </h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        <i className="bi bi-hash"></i> Roll No.
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        <i className="bi bi-person"></i> Name
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                        <i className="bi bi-clipboard-check"></i> Attendance
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((student, index) => (
                      <tr 
                        key={student.id} 
                        className={`hover:bg-gray-50 transition-colors animate-fadeIn ${
                          attendance[student.id] === 'present' ? 'bg-green-50' : 
                          attendance[student.id] === 'absent' ? 'bg-red-50' : ''
                        }`}
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-full">
                            {student.roll_number}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="bg-purple-100 rounded-full p-2">
                              <i className="bi bi-person-fill text-purple-600"></i>
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900">{student.name}</p>
                              <p className="text-xs text-gray-500">{student.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-3">
                            <button
                              onClick={() => handleAttendanceChange(student.id, 'present')}
                              className={`px-6 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2 ${
                                attendance[student.id] === 'present'
                                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white scale-110'
                                  : 'bg-gray-200 text-gray-600 hover:bg-green-100'
                              }`}
                            >
                              <i className="bi bi-check-circle-fill text-lg"></i>
                              Present
                            </button>
                            <button
                              onClick={() => handleAttendanceChange(student.id, 'absent')}
                              className={`px-6 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2 ${
                                attendance[student.id] === 'absent'
                                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white scale-110'
                                  : 'bg-gray-200 text-gray-600 hover:bg-red-100'
                              }`}
                            >
                              <i className="bi bi-x-circle-fill text-lg"></i>
                              Absent
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button
                onClick={onBack}
                className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-4 rounded-xl transition-all font-bold shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <i className="bi bi-x-circle"></i>
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || Object.keys(attendance).length === 0}
                className="gradient-primary text-white px-10 py-4 rounded-xl transition-all font-bold shadow-lg hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] flex items-center gap-2 btn-modern"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="bi bi-save-fill text-xl"></i>
                    Save Attendance
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
