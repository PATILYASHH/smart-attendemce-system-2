import { AuthProvider, useAuth } from './contexts/AuthContext'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'

function AppContent() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return user ? <Dashboard /> : <Auth />
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
