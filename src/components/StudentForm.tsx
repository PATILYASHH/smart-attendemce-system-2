import { useState, FormEvent, useEffect } from 'react'
import { supabase, Student } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface StudentFormProps {
  student: Student | null
  onClose: () => void
}

export default function StudentForm({ student, onClose }: StudentFormProps) {
  const [name, setName] = useState('')
  const [rollNumber, setRollNumber] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    if (student) {
      setName(student.name)
      setRollNumber(student.roll_number)
      setEmail(student.email)
    }
  }, [student])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (student) {
        // Update existing student
        const { error } = await supabase
          .from('students')
          .update({
            name,
            roll_number: rollNumber,
            email,
          })
          .eq('id', student.id)

        if (error) throw error
      } else {
        // Create new student
        const { error } = await supabase
          .from('students')
          .insert([
            {
              name,
              roll_number: rollNumber,
              email,
              teacher_id: user?.id,
            },
          ])

        if (error) throw error
      }

      onClose()
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="glass p-10 rounded-3xl shadow-2xl w-full max-w-2xl animate-scaleIn">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-white rounded-full p-3 shadow-lg">
              <i className={`bi ${student ? 'bi-pencil-fill' : 'bi-person-plus-fill'} text-3xl gradient-primary`} style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}></i>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-800">
                {student ? 'Edit Student' : 'Add New Student'}
              </h2>
              <p className="text-gray-600 text-sm">
                {student ? 'Update student information' : 'Enter student details below'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all"
          >
            <i className="bi bi-x-lg text-2xl"></i>
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-lg mb-6 flex items-center gap-3 animate-slideInLeft shadow-md">
            <i className="bi bi-exclamation-triangle-fill text-2xl"></i>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="animate-fadeIn" style={{ animationDelay: '0.1s' }}>
            <label className="block text-gray-700 text-sm font-bold mb-3 flex items-center gap-2">
              <i className="bi bi-person-fill text-purple-600"></i>
              Student Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 shadow-sm transition-all"
              placeholder="Enter student's full name"
              required
            />
          </div>

          <div className="animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            <label className="block text-gray-700 text-sm font-bold mb-3 flex items-center gap-2">
              <i className="bi bi-hash text-purple-600"></i>
              Roll Number *
            </label>
            <input
              type="text"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 shadow-sm transition-all"
              placeholder="e.g., 101, A-25"
              required
            />
          </div>

          <div className="animate-fadeIn" style={{ animationDelay: '0.3s' }}>
            <label className="block text-gray-700 text-sm font-bold mb-3 flex items-center gap-2">
              <i className="bi bi-envelope-fill text-purple-600"></i>
              Email Address *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 shadow-sm transition-all"
              placeholder="student@school.com"
              required
            />
          </div>

          <div className="flex gap-4 pt-4 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <i className="bi bi-x-circle"></i>
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 gradient-primary text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] flex items-center justify-center gap-2 btn-modern"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Saving...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle-fill"></i>
                  {student ? 'Update Student' : 'Add Student'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
