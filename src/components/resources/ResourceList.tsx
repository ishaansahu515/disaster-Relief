import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { resourceAPI } from '../../services/api';
import { Resource } from '../../types';
import {
  Plus,
  Package,
  MapPin,
  Phone,
  Clock,
  Filter,
  Search,
  AlertCircle,
  CheckCircle,
  Calendar
} from 'lucide-react';
import ResourceForm from './ResourceForm';

const ResourceList: React.FC = () => {
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterAvailability, setFilterAvailability] = useState<string>('all');

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      setLoading(true);
      const data = await resourceAPI.getAll();
      setResources(data);
    } catch (error) {
      console.error('Failed to load resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResourceAdded = (newResource: Resource) => {
    setResources(prev => [newResource, ...prev]);
    setShowForm(false);
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || resource.type === filterType;
    const matchesAvailability = filterAvailability === 'all' || resource.availability === filterAvailability;
    
    return matchesSearch && matchesType && matchesAvailability;
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
      default:
        return '📦';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
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

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800';
      case 'distributed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading resources...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Available Resources</h1>
            <p className="text-gray-600 mt-2">
              {filteredResources.length} resources available in your area
            </p>
          </div>
          {(user?.role === 'ngo' || user?.role === 'volunteer') && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Add Resource</span>
            </button>
          )}
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-4 space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>

            {/* Type Filter */}
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
                <option value="other">Other</option>
              </select>
            </div>

            {/* Availability Filter */}
            <div>
              <select
                value={filterAvailability}
                onChange={(e) => setFilterAvailability(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="reserved">Reserved</option>
                <option value="distributed">Distributed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => (
            <div
              key={resource.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getTypeIcon(resource.type)}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                        {resource.title}
                      </h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getAvailabilityColor(resource.availability)}`}>
                        {resource.availability}
                      </span>
                    </div>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border capitalize ${getPriorityColor(resource.priority)}`}>
                    {resource.priority}
                  </span>
                </div>

                {/* Description */}
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {resource.description}
                </p>

                {/* Quantity */}
                <div className="flex items-center space-x-2 mb-4">
                  <Package className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {resource.quantity} {resource.unit}
                  </span>
                  {resource.expiryDate && (
                    <>
                      <Calendar className="h-4 w-4 text-gray-400 ml-2" />
                      <span className="text-sm text-gray-600">
                        Expires: {new Date(resource.expiryDate).toLocaleDateString()}
                      </span>
                    </>
                  )}
                </div>

                {/* Location */}
                <div className="flex items-start space-x-2 mb-4">
                  <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600 line-clamp-2">
                    {resource.location.address}
                  </span>
                </div>

                {/* Contact Info */}
                <div className="flex items-center space-x-2 mb-4">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {resource.contactInfo.name} - {resource.contactInfo.phone}
                  </span>
                </div>

                {/* Posted Date */}
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  <span>
                    Posted {new Date(resource.postedAt).toLocaleDateString()} at{' '}
                    {new Date(resource.postedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="bg-gray-50 px-6 py-3">
                <div className="flex justify-between items-center">
                  <button className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors">
                    View Details
                  </button>
                  {user?.role === 'volunteer' && resource.availability === 'available' && (
                    <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors">
                      Request Pickup
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredResources.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Resources Found</h3>
            <p className="text-gray-600">
              {searchTerm || filterType !== 'all' || filterAvailability !== 'all'
                ? 'Try adjusting your search filters.'
                : 'No resources have been posted yet.'}
            </p>
          </div>
        )}
      </div>

      {/* Resource Form Modal */}
      {showForm && (
        <ResourceForm
          onSuccess={handleResourceAdded}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default ResourceList;