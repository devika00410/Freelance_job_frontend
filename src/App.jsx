import { useState } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './Context/AuthContext'
import RoleSelection from './AuthPages/RoleSelection'
import UserRegister from './AuthPages/UserRegister'
import Login from './AuthPages/Login'
import AdminRegister from './AuthPages/AdminRegister'
import AdminLogin from './AuthPages/AdminLogin'
import ClientDashboard from './Client/DashboardPage'
import AdminDashboard from './Admin/AdminDashboard'
import FreelancerDashboard from './Freelancer/FreelancerDashboard'
import HomePage from './Pages/HomePage'
import Navbar from './Components/Navbar'
import ProfilePage from './Client/ProfilePage'
import Settings from './Client/Settings'
import ClientProject from './Client/ClientProject'
import HirePreviousFreelancers from './Client/HirePreviousFreelancer'
import DownloadReports from './Client/DownloadReports'
import Workspace from './Client/Workspace'



// Protected route component
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, token, loading } = useAuth()
  if (loading) {
    return <div>Loading...</div>
  }
  if (!token) {
    return <Navigate to='/login' replace />
  }
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to='/dashboard' replace />
  }
  return children;
}
// Public route component(redirect if logged in)
const PublicRoute = ({ children }) => {
  const { token, user, loading } = useAuth();
  if (loading) {
    return <div>Loading...</div>
  }
  if (token && user) {
    switch (user?.role) {
      case 'client':
        return <Navigate to='/client/dashboard' replace />
      case 'freelancer':
        return <Navigate to='/freelancer/dashboard' replace />
      case 'admin':
        return <Navigate to='/admin/dashboard' replace />
      default:
        return <Navigate to='/dashboard' replace />
    }

  }
  return children
}
// Role based dashboard redirecter
const DashboardRedirect = () => {
  const { user, loading } = useAuth()
  if (loading) {
    return <div>Loading...</div>
  }
  switch (user?.role) {
    case 'client':
      return <Navigate to='/client/dashboard' replace />
    case "freelancer":
      return <Navigate to='/freelancer/dashboard' replace />
    case 'admin':
      return <Navigate to='/admin/dashboard' replace />
    default:
      return <Navigate to='/login' replace />
  }
}

function App() {

  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path='/' element={<HomePage />} />
            {/* Public routes */}

            <Route path='/role-selection' element={
              <PublicRoute>
                <RoleSelection />
              </PublicRoute>
            } />
            <Route path='/register' element={
              <PublicRoute>
                <UserRegister />
              </PublicRoute>
            } />

            <Route
              path='/login'
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } />

            {/* Generic dashboard route*/}
            <Route
              path='/dashboard'
              element={
                <ProtectedRoute>
                  <DashboardRedirect />
                </ProtectedRoute>
              } />

            {/* Role specific protected routes */}
            <Route path='/client/dashboard' element={
              <ProtectedRoute requiredRole="client">
                <ClientDashboard />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/project" element={<ClientProject />} />
            <Route path="/hire-previous" element={<HirePreviousFreelancers />} />
            <Route path="/download" element={<DownloadReports />} />
            <Route path="/workspace" element={<Workspace />} />

            <Route path='/freelancer/dashboard' element={
              <ProtectedRoute requiredRole="freelancer">
                <FreelancerDashboard />
              </ProtectedRoute>} />

            {/* Hidden Admin routes */}
            <Route path='/admin-setup' element={<AdminRegister />} />
            <Route path='/admin-access' element={<AdminLogin />} />
            <Route path='/admin/dashboard' element={
              <ProtectedRoute requiredRole='admin'>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            {/* Catch all route */}
            <Route path='*' element={<Navigate to='/' replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
