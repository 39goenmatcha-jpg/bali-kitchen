import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import { AlarmProvider } from './context/AlarmContext.jsx'

// Pages（各Taskで実装）
const Login = React.lazy(() => import('./pages/Login.jsx'))
const OwnerDashboard = React.lazy(() => import('./pages/OwnerDashboard.jsx'))
const OwnerOrders = React.lazy(() => import('./pages/OwnerOrders.jsx'))
const OrderLabel = React.lazy(() => import('./pages/OrderLabel.jsx'))
const StaffHome = React.lazy(() => import('./pages/StaffHome.jsx'))
const OwnerSettings = React.lazy(() => import('./pages/OwnerSettings.jsx'))
const UserManagement = React.lazy(() => import('./pages/UserManagement.jsx'))

function RoleGuard({ allowedRoles, children }) {
  const { currentUser, role, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center h-screen">読み込み中...</div>
  if (!currentUser) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={role === 'owner' ? '/dashboard' : '/staff'} replace />
  }
  return children
}

function RootRedirect() {
  const { currentUser, role, loading } = useAuth()
  if (loading) return null
  if (!currentUser) return <Navigate to="/login" replace />
  return <Navigate to={role === 'owner' ? '/dashboard' : '/staff'} replace />
}

export default function App() {
  return (
    <AuthProvider>
      <AlarmProvider>
        <BrowserRouter>
          <React.Suspense fallback={<div className="flex items-center justify-center h-screen">読み込み中...</div>}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<RootRedirect />} />
              <Route path="/dashboard" element={
                <RoleGuard allowedRoles={['owner']}><OwnerDashboard /></RoleGuard>
              } />
              <Route path="/orders" element={
                <RoleGuard allowedRoles={['owner']}><OwnerOrders /></RoleGuard>
              } />
              <Route path="/orders/:id/label" element={
                <RoleGuard allowedRoles={['owner', 'staff']}><OrderLabel /></RoleGuard>
              } />
              <Route path="/staff" element={
                <RoleGuard allowedRoles={['staff']}><StaffHome /></RoleGuard>
              } />
              <Route path="/settings" element={
                <RoleGuard allowedRoles={['owner']}><OwnerSettings /></RoleGuard>
              } />
              <Route path="/settings/users" element={
                <RoleGuard allowedRoles={['owner']}><UserManagement /></RoleGuard>
              } />
            </Routes>
          </React.Suspense>
        </BrowserRouter>
      </AlarmProvider>
    </AuthProvider>
  )
}
