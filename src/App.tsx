import { useState } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'
import Students from './components/Students'

type Page = 'dashboard' | 'students'

function AppContent() {
  const { user, loading } = useAuth()
  const [currentPage, setCurrentPage] = useState<Page>('dashboard')

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!user) {
    return <Auth />
  }

  const handleNavigate = (page: Page) => {
    setCurrentPage(page)
  }

  return currentPage === 'dashboard' ? (
    <Dashboard onNavigate={handleNavigate} />
  ) : (
    <Students onNavigate={handleNavigate} />
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
