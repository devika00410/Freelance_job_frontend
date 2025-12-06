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
import FreelancerDashboard from './Freelancer/FreelancerDashboard'
import HomePage from './Pages/HomePage'
import Navbar from './Components/Navbar'
import ProfilePage from './Client/ProfilePage'
import Settings from './Client/Settings'
import ClientProject from './Client/ClientProject'
import HirePreviousFreelancers from './Client/HirePreviousFreelancer'
import DownloadReports from './Client/DownloadReports'
import PostProject from './Client/PostProject'
import ProposalsPage from './Client/ProposalsPage'
import ContractsPage from './Client/ContractsPage'
import CreateContractPage from './Client/CreateContractPage'
import FindWork from './Freelancer/FindWork'
import FreelancerEarnings from './Freelancer/FreelancerEarnings'
import FreelancerPortfolio from './Freelancer/FreelancerPortfolio'
import ApplicationsDashboard from './Freelancer/ApplicationsDashboard'
import ContractsManagement from './Freelancer/ContractsManagement'
import PublicProfile from './Freelancer/PublicProfile'
import MainProfile from './Freelancer/MainProfile'
import EditProfile from './Freelancer/ProfileCreation/EditProfile'
import PaymentPage from './Client/PaymentPage'
import AdminDashboard from './Admin/AdminDashboard'
import AdminRoute from './AuthPages/AdminRoute'
import WorkspaceRouter from './Components/WorkspaceRouter'
import NotificationBanner from './Components/NotificationBanner'
import ClientWorkspace from './Client/ClientWorkspace'
import ClientWorkspaceList from './Client/ClientWorkspaceList'
import FreelancerWorkspaceList from './Freelancer/FreelancerWorkspaceList'
import ServiceDetailPage from './Pages/ServiceDetailPage'
import ServicePage from './Pages/ServicePage'
import FreelancerDetailPage from './Freelancer/FreelancerDetailPage'
import SearchResultsPage from './Pages/SearchResultsPage'

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

console.log('Stripe Publishable Key:', import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <NotificationBanner />
          <Routes>
            <Route path='/' element={<HomePage />} />
            <Route path="/services" element={<ServicePage />} />
            <Route path="/services/:serviceId/freelancers" element={<ServiceDetailPage />} />
            <Route path="/freelancers/:id" element={<FreelancerDetailPage />} />
            <Route path="/search" element={<SearchResultsPage />} />

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
            <Route path='/login' element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />

            {/* Generic dashboard route */}
            <Route path='/dashboard' element={
              <ProtectedRoute>
                <DashboardRedirect />
              </ProtectedRoute>
            } />

            {/* CLIENT routes */}
            <Route path='/client/dashboard' element={
              <ProtectedRoute requiredRole="client">
                <ClientDashboard />
              </ProtectedRoute>} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/project" element={<ClientProject />} />
            <Route path="/hire-previous" element={<HirePreviousFreelancers />} />
            <Route path="/download" element={<DownloadReports />} />
            <Route path="/projects/new" element={<PostProject />} />
            <Route path="/proposals" element={<ProposalsPage />} />
            <Route path="/contracts" element={<ContractsPage />} />
            <Route path="/payments" element={<PaymentPage />} />
            <Route path="/client/workspace" element={
              <ProtectedRoute requiredRole="client">
                <ClientWorkspaceList />
              </ProtectedRoute>
            } />

            <Route path="/contracts/create" element={<CreateContractPage />} />

            {/* FREELANCER routes */}
            <Route path='/freelancer/dashboard' element={
              <ProtectedRoute requiredRole="freelancer">
                <FreelancerDashboard />
              </ProtectedRoute>} />
            <Route path='/freelancer/profile/create' element={<MainProfile />} />
            <Route path="/freelancer/profile/edit" element={<EditProfile />} />
            <Route path="/freelancer/jobs" element={<FindWork />} />
            <Route path="/freelancer/earnings" element={<FreelancerEarnings />} />
            <Route path="/freelancer/portfolio" element={<FreelancerPortfolio />} />
            <Route path="/freelancer/proposals" element={<ApplicationsDashboard />} />
            <Route path="/freelancer/contracts" element={<ContractsManagement />} />
            <Route path="/freelancer/workspace" element={
              <ProtectedRoute requiredRole="freelancer">
                <FreelancerWorkspaceList />
              </ProtectedRoute>
            } />
            <Route path="/freelancer/profile/:id" element={
              <ProtectedRoute>
                <PublicProfile />
              </ProtectedRoute>
            } />

            {/* UNIFIED WORKSPACE ROUTE - SINGLE ENTRY POINT */}
            <Route path="/workspace/:workspaceId" element={
              <ProtectedRoute>
                <WorkspaceRouter />
              </ProtectedRoute>
            } />


            {/* ADMIN routes */}
            <Route path='/admin/register' element={
              <PublicRoute>
                <AdminRegister />
              </PublicRoute>
            } />
            <Route path='/admin/login' element={
              <PublicRoute>
                <AdminLogin />
              </PublicRoute>
            } />
            <Route path='/admin/dashboard' element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
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