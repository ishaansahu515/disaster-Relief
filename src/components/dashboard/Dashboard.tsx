import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { resourceAPI, requestAPI } from '../../services/api';
import { Resource, HelpRequest } from '../../types';
import {
  Heart,
  Users,
  Package,
  AlertCircle,
  TrendingUp,
  MapPin,
  Clock,
  CheckCircle
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [resourcesData, requestsData] = await Promise.all([
          resourceAPI.getAll(),
          requestAPI.getAll()
        ]);
        setResources(resourcesData);
        setRequests(requestsData);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const getStatsForRole = () => {
    const totalResources = resources.length;
    const availableResources = resources.filter(r => r.availability === 'available').length;
    const totalRequests = requests.length;
    const openRequests = requests.filter(r => r.status === 'open').length;
    const criticalRequests = requests.filter(r => r.urgency === 'critical').length;

    switch (user?.role) {
      case 'ngo':
        return {
          title: 'NGO Dashboard',
          stats: [
            { label: 'Total Resources', value: totalResources, icon: Package, color: 'blue' },
            { label: 'Available Resources', value: availableResources, icon: CheckCircle, color: 'green' },
            { label: 'Total Requests', value: totalRequests, icon: AlertCircle, color: 'yellow' },
            { label: 'Critical Requests', value: criticalRequests, icon: AlertCircle, color: 'red' }
          ]
        };
      case 'volunteer':
        return {
          title: 'Volunteer Dashboard',
          stats: [
            { label: 'Available Resources', value: availableResources, icon: Package, color: 'blue' },
            { label: 'Open Requests', value: openRequests, icon: AlertCircle, color: 'yellow' },
            { label: 'Critical Requests', value: criticalRequests, icon: AlertCircle, color: 'red' },
            { label: 'My Assignments', value: requests.filter(r => r.assignedTo === user?.id).length, icon: Users, color: 'green' }
          ]
        };
      case 'victim':
        return {
          title: 'Help Dashboard',
          stats: [
            { label: 'My Requests', value: requests.filter(r => r.requestedBy === user?.id).length, icon: AlertCircle, color: 'blue' },
            { label: 'Available Resources', value: availableResources, icon: Package, color: 'green' },
            { label: 'Nearby Help', value: Math.floor(Math.random() * 5) + 3, icon: MapPin, color: 'yellow' },
            { label: 'Response Time', value: '< 2 hrs', icon: Clock, color: 'blue', isText: true }
          ]
        };
      default:
        return {
          title: 'Dashboard',
          stats: [
            { label: 'Total Resources', value: totalResources, icon: Package, color: 'blue' },
            { label: 'Total Requests', value: totalRequests, icon: AlertCircle, color: 'yellow' },
            { label: 'Active Users', value: Math.floor(Math.random() * 100) + 50, icon: Users, color: 'green' },
            { label: 'Critical Alerts', value: criticalRequests, icon: AlertCircle, color: 'red' }
          ]
        };
    }
  };

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-700 border-blue-200',
      green: 'bg-green-50 text-green-700 border-green-200',
      yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      red: 'bg-red-50 text-red-700 border-red-200'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getRecentActivity = () => {
    const allActivity = [
      ...resources.map(r => ({
        id: r.id,
        type: 'resource',
        title: r.title,
        time: new Date(r.postedAt),
        priority: r.priority,
        location: r.location.address
      })),
      ...requests.map(r => ({
        id: r.id,
        type: 'request',
        title: r.title,
        time: new Date(r.createdAt),
        priority: r.urgency,
        location: r.location.address
      }))
    ];

    return allActivity
      .sort((a, b) => b.time.getTime() - a.time.getTime())
      .slice(0, 5);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const dashboardData = getStatsForRole();
  const recentActivity = getRecentActivity();

  // Calculate criticalRequests for use in JSX
  const criticalRequests =
    user?.role === 'ngo'
      ? requests.filter(r => r.urgency === 'critical')
      : user?.role === 'volunteer'
      ? requests.filter(r => r.urgency === 'critical')
      : user?.role === 'victim'
      ? requests.filter(r => r.urgency === 'critical' && r.requestedBy === user?.id)
      : requests.filter(r => r.urgency === 'critical');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{dashboardData.title}</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {user?.name}. Here's what's happening in your area.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardData.stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div
                key={index}
                className={`p-6 rounded-lg border ${getColorClasses(stat.color)} transition-all hover:shadow-md`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium opacity-75">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">
                      {stat.isText ? stat.value : typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                    </p>
                  </div>
                  <IconComponent className="h-8 w-8 opacity-60" />
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                  <TrendingUp className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className={`p-2 rounded-full ${activity.type === 'resource' ? 'bg-blue-100' : 'bg-yellow-100'}`}>
                        {activity.type === 'resource' ? (
                          <Package className={`h-4 w-4 ${activity.type === 'resource' ? 'text-blue-600' : 'text-yellow-600'}`} />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {activity.title}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            activity.priority === 'urgent' || activity.priority === 'critical'
                              ? 'bg-red-100 text-red-800'
                              : activity.priority === 'high'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {activity.priority}
                          </span>
                          <span className="text-xs text-gray-500">
                            {activity.time.toLocaleDateString()} at {activity.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {activity.location}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            {/* Emergency Alert */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <AlertCircle className="h-6 w-6 text-red-600" />
                <h3 className="text-lg font-semibold text-red-800">Emergency Status</h3>
              </div>
              <p className="text-sm text-red-700 mb-4">
                {criticalRequests.length > 0 
                  ? `${criticalRequests.length} critical requests need immediate attention`
                  : 'No critical alerts at this time'
                }
              </p>
              <button className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors">
                View Critical Requests
              </button>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Response Rate</span>
                  <span className="text-sm font-medium text-green-600">94%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Volunteers</span>
                  <span className="text-sm font-medium text-blue-600">127</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Resources Distributed</span>
                  <span className="text-sm font-medium text-green-600">89%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avg Response Time</span>
                  <span className="text-sm font-medium text-yellow-600">1.3 hrs</span>
                </div>
              </div>
            </div>

            {/* Real-time Updates */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Updates</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-700">System Online</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Real-time Updates Active</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">{requests.filter(r => r.status === 'open').length} Active Requests</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;