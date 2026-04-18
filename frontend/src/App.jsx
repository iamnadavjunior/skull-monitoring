import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import Students from './pages/Students'
import StudentDetail from './pages/StudentDetail'
import StudentForm from './pages/StudentForm'
import Payments from './pages/Payments'
import FeeStructures from './pages/FeeStructures'
import Reports from './pages/Reports'
import Classes from './pages/Classes'
import PublicProfile from './pages/PublicProfile'
import Layout from './components/Layout'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>
  if (!user) return <Navigate to="/login" />
  if (!localStorage.getItem('onboarding_done')) return <Navigate to="/onboarding" />
  return children
}

function OnboardingRoute() {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>
  if (!user) return <Navigate to="/login" />
  if (localStorage.getItem('onboarding_done')) return <Navigate to="/" />
  return <Onboarding />
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/onboarding" element={<OnboardingRoute />} />
        <Route path="/s/:token" element={<PublicProfile />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="students" element={<Students />} />
          <Route path="students/new" element={<StudentForm />} />
          <Route path="students/:id" element={<StudentDetail />} />
          <Route path="students/:id/edit" element={<StudentForm />} />
          <Route path="payments" element={<Payments />} />
          <Route path="fees" element={<FeeStructures />} />
          <Route path="classes" element={<Classes />} />
          <Route path="reports" element={<Reports />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}
