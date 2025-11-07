import React, { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from './layouts/AdminLayout'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Tenants from './pages/Tenants'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import Login from './pages/Login'
import { AuthProvider, useAuth } from './contexts/AuthContext'

// Componente para rotas protegidas
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

// Componente principal da aplicação
const App = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="tenants" element={<Tenants />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App