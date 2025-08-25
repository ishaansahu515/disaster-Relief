import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Header from './components/layout/Header';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import Dashboard from './components/dashboard/Dashboard';
import ResourceList from './components/resources/ResourceList';
import RequestList from './components/requests/RequestList';
import AdminPanel from './components/admin/AdminPanel';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          
          {/* Protected Routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <div className="min-h-screen bg-gray-50">
                  <Header />
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/resources" element={<ResourceList />} />
                    <Route path="/requests" element={<RequestList />} />
                    <Route 
                      path="/admin" 
                      element={
                        <ProtectedRoute requiredRoles={['ngo']}>
                          <AdminPanel />
                        </ProtectedRoute>
                      } 
                    />
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/unauthorized" element={
                      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                        <div className="text-center">
                          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
                          <p className="text-gray-600">You don't have permission to access this page.</p>
                        </div>
                      </div>
                    } />
                  </Routes>
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;