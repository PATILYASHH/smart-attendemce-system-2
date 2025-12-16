import { useState, FormEvent } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuth()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        await signIn(email, password)
      } else {
        await signUp(email, password)
        alert('Check your email to confirm your account!')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="glass p-10 rounded-3xl shadow-2xl w-full max-w-md animate-scaleIn">
        <div className="text-center mb-8">
          <div className="bg-white rounded-full p-4 w-20 h-20 mx-auto mb-4 shadow-lg">
            <i className="bi bi-person-circle text-5xl gradient-primary" style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}></i>
          </div>
          <h2 className="text-4xl font-bold text-gray-800 mb-2">
            {isLogin ? 'Welcome Back!' : 'Join Us!'}
          </h2>
          <p className="text-gray-600">
            {isLogin ? 'Sign in to manage attendance' : 'Create your teacher account'}
          </p>
        </div>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-lg mb-6 flex items-center gap-3 animate-slideInLeft shadow-md">
            <i className="bi bi-exclamation-triangle-fill text-2xl"></i>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="animate-fadeIn" style={{ animationDelay: '0.1s' }}>
            <label className="block text-gray-700 text-sm font-bold mb-3 flex items-center gap-2">
              <i className="bi bi-envelope-fill text-purple-600"></i>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 shadow-sm transition-all"
              placeholder="teacher@school.com"
              required
            />
          </div>

          <div className="animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            <label className="block text-gray-700 text-sm font-bold mb-3 flex items-center gap-2">
              <i className="bi bi-lock-fill text-purple-600"></i>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 shadow-sm transition-all"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full gradient-primary text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] flex items-center justify-center gap-2 animate-fadeIn btn-modern"
            style={{ animationDelay: '0.3s' }}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Processing...
              </>
            ) : (
              <>
                <i className="bi bi-box-arrow-in-right text-xl"></i>
                {isLogin ? 'Sign In' : 'Create Account'}
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center animate-fadeIn" style={{ animationDelay: '0.4s' }}>
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-purple-700 hover:text-purple-900 text-sm font-semibold transition-all hover:scale-105 flex items-center gap-2 mx-auto"
          >
            <i className="bi bi-arrow-left-right"></i>
            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
          </button>
        </div>
      </div>
    </div>
  )
}
