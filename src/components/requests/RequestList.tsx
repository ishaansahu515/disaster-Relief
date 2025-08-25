import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { requestAPI } from '../../services/api';
import { HelpRequest } from '../../types';
import {
  Plus,
  AlertCircle,
  MapPin,
  Phone,
  Clock,
  Filter,
  Search,
  Users,
  CheckCircle,
  XCircle
} from 'lucide-react';
import RequestForm from './RequestForm';

const RequestList: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterUrgency, setFilterUrgency] = useState<string>('all');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await requestAPI.getAll();
      setRequests(data);
    } catch (error) {
      console.error('Failed to load requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAdded = (newRequest: HelpRequest) => {
    setRequests(prev => [newRequest, ...prev]);
    setShowForm(false);
  };

  const handleAssignToMe = async (requestId: string) => {
    if (!user || user.role !== 'volunteer') return;

    try {
      await requestAPI.assign(requestId, user.id);
      setRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { ...req, assignedTo: user.id, status: 'in-progress' as const, updatedAt: new Date().toISOString() }
          : req
      ));
    } catch (error) {
      console.error('Failed to assign request:', error);
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || request.type === filterType;
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    const matchesUrgency = filterUrgency === 'all' || request.urgency === filterUrgency;
    
    return matchesSearch && matchesType && matchesStatus && matchesUrgency;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'food':
        return '🍞';
      case 'medicine':
        return '💊';
      case 'shelter':
        return '🏠';
      case 'water':
        return '💧';
      case 'clothing':
        return '👕';
      case 'transport':
        return '🚐';
      case 'rescue':
        return '🚨';
      default:
        return '❓';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'medium':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-blue-100 text-blue-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="h-4 w-4" />;
      case 'in-progress':
        return <Clock className="h-4 w-4" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4" />;
      case 'closed':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading help requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Help Requests</h1>
            <p className="text-gray-600 mt-2">
              {filteredRequests.length} requests in your area
            </p>
          </div>
          {(user?.role === 'victim' || user?.role === 'ngo') && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Create Request</span>
            </button>
          )}
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="all">All Types</option>
                <option value="food">Food</option>
                <option value="medicine">Medicine</option>
                <option value="shelter">Shelter</option>
                <option value="water">Water</option>
                <option value="clothing">Clothing</option>
                <option value="transport">Transport</option>
                <option value="rescue">Rescue</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div>
              <select
                value={filterUrgency}
                onChange={(e) => setFilterUrgency(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="all">All Urgency</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Requests Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequests.map((request) => (
            <div
              key={request.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getTypeIcon(request.type)}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                        {request.title}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(request.status)}`}>
                          {getStatusIcon(request.status)}
                          <span className="ml-1">{request.status.replace('-', ' ')}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border capitalize ${getUrgencyColor(request.urgency)}`}>
                    {request.urgency}
                  </span>
                </div>

                {/* Description */}
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {request.description}
                </p>

                {/* People Affected */}
                <div className="flex items-center space-x-2 mb-4">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {request.peopleAffected} {request.peopleAffected === 1 ? 'person' : 'people'} affected
                  </span>
                </div>

                {/* Location */}
                <div className="flex items-start space-x-2 mb-4">
                  <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600 line-clamp-2">
                    {request.location.address}
                  </span>
                </div>

                {/* Contact Info */}
                <div className="flex items-center space-x-2 mb-4">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {request.contactInfo.name} - {request.contactInfo.phone}
                  </span>
                </div>

                {/* Time Info */}
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  <span>
                    Created {new Date(request.createdAt).toLocaleDateString()} at{' '}
                    {new Date(request.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Assignment Info */}
                {request.assignedTo && (
                  <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      Assigned to volunteer
                      {request.assignedTo === user?.id && ' (you)'}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="bg-gray-50 px-6 py-3">
                <div className="flex justify-between items-center">
                  <button className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors">
                    View Details
                  </button>
                  {user?.role === 'volunteer' && request.status === 'open' && !request.assignedTo && (
                    <button
                      onClick={() => handleAssignToMe(request.id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                    >
                      Assign to Me
                    </button>
                  )}
                  {request.assignedTo === user?.id && request.status === 'in-progress' && (
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors">
                      Update Status
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredRequests.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Requests Found</h3>
            <p className="text-gray-600">
              {searchTerm || filterType !== 'all' || filterStatus !== 'all' || filterUrgency !== 'all'
                ? 'Try adjusting your search filters.'
                : 'No help requests have been posted yet.'}
            </p>
          </div>
        )}
      </div>

      {/* Request Form Modal */}
      {showForm && (
        <RequestForm
          onSuccess={handleRequestAdded}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default RequestList;