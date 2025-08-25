import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Heart, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Shield, 
  Users, 
  AlertTriangle,
  Bell
} from 'lucide-react';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ngo':
        return <Shield className="h-4 w-4" />;
      case 'volunteer':
        return <Users className="h-4 w-4" />;
      case 'victim':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ngo':
        return 'bg-blue-100 text-blue-800';
      case 'volunteer':
        return 'bg-green-100 text-green-800';
      case 'victim':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <header className="bg-white shadow-lg border-b-2 border-red-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo and Title */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-3">
              <div className="bg-red-600 p-2 rounded-lg">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  DisasterRelief
                </h1>
                <p className="text-sm text-gray-600">Resource Coordination</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              to="/dashboard" 
              className="text-gray-700 hover:text-red-600 font-medium transition-colors"
            >
              Dashboard
            </Link>
          
            {user?.role === 'ngo' && (
              <Link 
                to="/admin" 
                className="text-gray-700 hover:text-red-600 font-medium transition-colors"
              >
                Admin Panel
              </Link>
            )}
            <Link 
              to="/resources" 
              className="text-gray-700 hover:text-red-600 font-medium transition-colors"
            >
              Resources
            </Link>
            <Link 
              to="/requests" 
              className="text-gray-700 hover:text-red-600 font-medium transition-colors"
            >
              Help Requests
            </Link>
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Notification Bell */}
            <button className="relative p-2 text-gray-700 hover:text-red-600 transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Info */}
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <div className="flex items-center justify-end space-x-1">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user?.role || '')}`}>
                    {getRoleIcon(user?.role || '')}
                    <span className="ml-1 capitalize">{user?.role}</span>
                  </span>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-700"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-3">
              <Link 
                to="/dashboard" 
                className="text-gray-700 hover:text-red-600 font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link 
                to="/map" 
                className="text-gray-700 hover:text-red-600 font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Map View
              </Link>
              {user?.role === 'ngo' && (
                <Link 
                  to="/admin" 
                  className="text-gray-700 hover:text-red-600 font-medium py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Admin Panel
                </Link>
              )}
              <Link 
                to="/resources" 
                className="text-gray-700 hover:text-red-600 font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Resources
              </Link>
              <Link 
                to="/requests" 
                className="text-gray-700 hover:text-red-600 font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Help Requests
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;