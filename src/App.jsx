import { useState } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './Context/AuthContext'
import RoleSelection from './AuthPages/RoleSelection'
import UnifiedRegister from './AuthPages/UnifiedRegister' // NEW: Unified registration
import UnifiedLogin from './AuthPages/UnifiedLogin'       // NEW: Unified login
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
import ClientAnalyticsPage from './Client/ClientAnalyticsPage'
import FreelancerWorkspace from './Freelancer/FreelancerWorkspace'

import HowItWorksPage from "./Pages/HowItWorks";
import CommunityPage from "./Pages/CommunityPage";
import SuccessStoriesPage from "./Community/SuccessStoriesPage";
import JoinCommunityForm from "./Community/JoinCommunityForm";
import BlogListPage from "./Community/BlogListPage";
import BlogPage from "./Community/BlogPage";
import PricingPage from "./Pages/PricingPage";
import NotificationPage from './Freelancer/NotificationPage'
import AnalyticsPage from './Freelancer/AnalyticsPage'
// import ContactPage from "./Pages/ContactPage";

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
            {/* PUBLIC PAGES */}
            <Route path='/' element={<HomePage />} />
            <Route path="/services" element={<ServicePage />} />
            <Route path="/service/:serviceId" element={<ServiceDetailPage />} />
            <Route path="/freelancers/:id" element={<FreelancerDetailPage />} />
            <Route path="/search" element={<SearchResultsPage />} />
            
            {/* PUBLIC WEBSITE PAGES */}
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            {/* <Route path="/contact" element={<ContactPage />} /> */}

            {/* COMMUNITY SYSTEM */}
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/community/success-stories" element={<SuccessStoriesPage />} />
            <Route path="/community/join" element={<JoinCommunityForm />} />
            <Route path="/community/blogs" element={<BlogListPage />} />
            <Route path="/community/blogs/:id" element={<BlogPage />} />

            {/* AUTHENTICATION PAGES - UPDATED */}
            <Route path='/role-selection' element={
              <PublicRoute>
                <RoleSelection />
              </PublicRoute>
            } />
            
            {/* UNIFIED REGISTRATION - Replaces UserRegister and AdminRegister */}
            <Route path='/register' element={
              <PublicRoute>
                <UnifiedRegister />
              </PublicRoute>
            } />
            
            {/* UNIFIED LOGIN - Replaces Login and AdminLogin */}
            <Route path='/login' element={
              <PublicRoute>
                <UnifiedLogin />
              </PublicRoute>
            } />

            {/* Optional: Direct admin registration link */}
            <Route path='/admin/register' element={
              <PublicRoute>
                <UnifiedRegister />
              </PublicRoute>
            } />
            
            {/* Optional: Direct admin login link */}
            <Route path='/admin/login' element={
              <PublicRoute>
                <UnifiedLogin />
              </PublicRoute>
            } />

            {/* Generic dashboard route */}
            <Route path='/dashboard' element={
              <ProtectedRoute>
                <DashboardRedirect />
              </ProtectedRoute>
            } />

            {/* CLIENT ROUTES */}
            <Route path='/client/dashboard' element={
              <ProtectedRoute requiredRole="client">
                <ClientDashboard />
              </ProtectedRoute>} />
            <Route path="/client/profile" element={
              <ProtectedRoute requiredRole="client">
                <ProfilePage />
              </ProtectedRoute>} />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>} />
            <Route path="/project" element={
              <ProtectedRoute requiredRole="client">
                <ClientProject />
              </ProtectedRoute>} />
            <Route path="/hire-previous" element={
              <ProtectedRoute requiredRole="client">
                <HirePreviousFreelancers />
              </ProtectedRoute>} />
            <Route path="/download" element={
              <ProtectedRoute requiredRole="client">
                <DownloadReports />
              </ProtectedRoute>} />
            <Route path="/projects/new" element={
              <ProtectedRoute requiredRole="client">
                <PostProject />
              </ProtectedRoute>} />
            <Route path="/proposals" element={
              <ProtectedRoute requiredRole="client">
                <ProposalsPage />
              </ProtectedRoute>} />
            <Route path="/contracts" element={
              <ProtectedRoute requiredRole="client">
                <ContractsPage />
              </ProtectedRoute>} />
            <Route path="/payments" element={
              <ProtectedRoute requiredRole="client">
                <PaymentPage />
              </ProtectedRoute>} />
            <Route path="/analytics" element={
              <ProtectedRoute requiredRole="client">
                <ClientAnalyticsPage />
              </ProtectedRoute>} />
            <Route path="/client/workspace" element={
              <ProtectedRoute requiredRole="client">
                <ClientWorkspaceList />
              </ProtectedRoute>
            } />

            {/* CLIENT WORKSPACE */}
            <Route path="/client/workspace/:workspaceId" element={
              <ProtectedRoute requiredRole="client">
                <ClientWorkspace />
              </ProtectedRoute>
            } />

            <Route path="/contracts/create" element={
              <ProtectedRoute requiredRole="client">
                <CreateContractPage />
              </ProtectedRoute>} />

            {/* FREELANCER ROUTES */}
            <Route path='/freelancer/dashboard' element={
              <ProtectedRoute requiredRole="freelancer">
                <FreelancerDashboard />
              </ProtectedRoute>} />
            <Route path='/freelancer/profile/create' element={
              <ProtectedRoute requiredRole="freelancer">
                <MainProfile />
              </ProtectedRoute>} />
            <Route path="/freelancer/profile/edit" element={
              <ProtectedRoute requiredRole="freelancer">
                <EditProfile />
              </ProtectedRoute>} />
            <Route path="/freelancer/jobs" element={
              <ProtectedRoute requiredRole="freelancer">
                <FindWork />
              </ProtectedRoute>} />
            <Route path="/freelancer/earnings" element={
              <ProtectedRoute requiredRole="freelancer">
                <FreelancerEarnings />
              </ProtectedRoute>} />
            {/* <Route path="/freelancer/portfolio" element={
              <ProtectedRoute requiredRole="freelancer">
                <FreelancerPortfolio />
              </ProtectedRoute>} /> */}
            <Route path="/freelancer/proposals" element={
              <ProtectedRoute requiredRole="freelancer">
                <ApplicationsDashboard />
              </ProtectedRoute>} />
            <Route path="/freelancer/contracts" element={
              <ProtectedRoute requiredRole="freelancer">
                <ContractsManagement />
              </ProtectedRoute>} />
            <Route path="/freelancer/workspace" element={
              <ProtectedRoute requiredRole="freelancer">
                <FreelancerWorkspaceList />
              </ProtectedRoute>
            } />

            {/* FREELANCER WORKSPACE */}
            <Route path="/freelancer/workspace/:workspaceId" element={
              <ProtectedRoute requiredRole="freelancer">
                <FreelancerWorkspace />
              </ProtectedRoute>
            } />

            <Route path="/profile/:id?" element={
              <ProtectedRoute>
                <PublicProfile />
              </ProtectedRoute>} />

            <Route path="/freelancer/notifications" element={
              <ProtectedRoute requiredRole="freelancer">
                <NotificationPage />
              </ProtectedRoute>} />
            <Route path="/freelancer/analytics" element={
              <ProtectedRoute requiredRole="freelancer">
                <AnalyticsPage />
              </ProtectedRoute>} />

            {/* UNIFIED WORKSPACE ROUTE - Keep for backward compatibility */}
            <Route path="/workspace/:workspaceId" element={
              <ProtectedRoute>
                <WorkspaceRouter />
              </ProtectedRoute>
            } />

            {/* ADMIN ROUTES */}
            <Route path='/admin/dashboard' element={
              <ProtectedRoute requiredRole="admin">
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