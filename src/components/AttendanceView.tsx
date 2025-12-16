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
    } catch (error: any) {
      alert('Error saving attendance: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Take Attendance</h1>
          <button
            onClick={onBack}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition"
          >
            Back to Dashboard
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
        </div>

        {students.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg">No students available. Please add students first.</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Roll Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attendance
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
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex justify-center gap-4">
                          <button
                            onClick={() => handleAttendanceChange(student.id, 'present')}
                            className={`px-6 py-2 rounded-md font-semibold transition ${
                              attendance[student.id] === 'present'
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            onClick={() => handleAttendanceChange(student.id, 'absent')}
                            className={`px-6 py-2 rounded-md font-semibold transition ${
                              attendance[student.id] === 'absent'
                                ? 'bg-red-500 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            Absent
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={loading || Object.keys(attendance).length === 0}
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-md transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save Attendance'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
