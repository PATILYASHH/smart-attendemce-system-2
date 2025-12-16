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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {student ? 'Edit Student' : 'Add New Student'}
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Student Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Roll Number *
            </label>
            <input
              type="text"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Email Address *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              required
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition duration-200 disabled:opacity-50"
            >
              {loading ? 'Saving...' : (student ? 'Update Student' : 'Add Student')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md transition duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
