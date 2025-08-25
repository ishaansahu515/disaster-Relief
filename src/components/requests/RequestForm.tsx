import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { requestAPI } from '../../services/api';
import { HelpRequest } from '../../types';
import { useForm } from 'react-hook-form';
import {
  X,
  Save,
  MapPin,
  Users,
  Phone,
  AlertTriangle
} from 'lucide-react';

interface RequestFormProps {
  onSuccess: (request: HelpRequest) => void;
  onCancel: () => void;
  request?: HelpRequest;
}

interface RequestFormData {
  title: string;
  type: 'food' | 'medicine' | 'shelter' | 'water' | 'clothing' | 'transport' | 'rescue' | 'other';
  description: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  peopleAffected: number;
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
  contactInfo: {
    name: string;
    phone: string;
    email?: string;
  };
}

const RequestForm: React.FC<RequestFormProps> = ({ onSuccess, onCancel, request }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm<RequestFormData>({
    defaultValues: request ? {
      title: request.title,
      type: request.type,
      description: request.description,
      urgency: request.urgency,
      peopleAffected: request.peopleAffected,
      location: {
        address: request.location.address,
        latitude: request.location.latitude,
        longitude: request.location.longitude
      },
      contactInfo: {
        name: request.contactInfo.name,
        phone: request.contactInfo.phone,
        email: request.contactInfo.email
      }
    } : {
      contactInfo: {
        name: user?.name || '',
        phone: user?.phone || '',
        email: user?.email || ''
      },
      peopleAffected: 1
    }
  });

  const onSubmit = async (data: RequestFormData) => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const requestData = {
        ...data,
        requestedBy: user.id,
        status: 'open' as const
      };

      const newRequest = await requestAPI.create(requestData);
      onSuccess(newRequest);
    } catch (err) {
      setError('Failed to create help request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getAddressFromLocation = async () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // In a real app, you'd use a geocoding service
          // For now, we'll just set the coordinates and a placeholder address
          setValue('location.latitude', latitude);
          setValue('location.longitude', longitude);
          setValue('location.address', `Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        },
        (error) => {
          setError('Unable to get your location. Please enter address manually.');
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  };

  const requestTypes = [
    { value: 'food', label: 'Food & Nutrition', icon: '🍞' },
    { value: 'medicine', label: 'Medical Help', icon: '💊' },
    { value: 'shelter', label: 'Shelter & Housing', icon: '🏠' },
    { value: 'water', label: 'Water & Hydration', icon: '💧' },
    { value: 'clothing', label: 'Clothing & Blankets', icon: '👕' },
    { value: 'transport', label: 'Transportation', icon: '🚐' },
    { value: 'rescue', label: 'Emergency Rescue', icon: '🚨' },
    { value: 'other', label: 'Other Emergency', icon: '❓' }
  ];

  const urgencyOptions = [
    { value: 'low', label: 'Low Priority', color: 'text-gray-600', description: 'Can wait several hours' },
    { value: 'medium', label: 'Medium Priority', color: 'text-blue-600', description: 'Needed within a few hours' },
    { value: 'high', label: 'High Priority', color: 'text-yellow-600', description: 'Needed within an hour' },
    { value: 'critical', label: 'Critical/Life Threatening', color: 'text-red-600', description: 'Immediate assistance required' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {request ? 'Edit Help Request' : 'Create Help Request'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}

          {/* Emergency Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Emergency Guidelines</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  If this is a life-threatening emergency, please call emergency services immediately. 
                  Use this form for coordination and non-immediate assistance.
                </p>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Request Title *
              </label>
              <input
                {...register('title', { required: 'Title is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="e.g., Emergency Shelter Needed for Family of 4"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type of Help Needed *
              </label>
              <select
                {...register('type', { required: 'Type is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">Select type...</option>
                {requestTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
              {errors.type && (
                <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of People Affected *
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  {...register('peopleAffected', { required: 'Number of people is required', min: 1 })}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="1"
                />
              </div>
              {errors.peopleAffected && (
                <p className="mt-1 text-sm text-red-600">{errors.peopleAffected.message}</p>
              )}
            </div>
          </div>

          {/* Urgency Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Urgency Level *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {urgencyOptions.map((urgency) => (
                <label key={urgency.value} className="flex items-start">
                  <input
                    type="radio"
                    value={urgency.value}
                    {...register('urgency', { required: 'Please select urgency level' })}
                    className="mt-1 mr-3"
                  />
                  <div className="flex-1">
                    <div className={`font-medium ${urgency.color}`}>
                      {urgency.label}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {urgency.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
            {errors.urgency && (
              <p className="mt-2 text-sm text-red-600">{errors.urgency.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Detailed Description *
            </label>
            <textarea
              {...register('description', { required: 'Description is required' })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Provide detailed information about your situation and what help you need..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Location */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Location *
              </label>
              <button
                type="button"
                onClick={getAddressFromLocation}
                className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
              >
                Use Current Location
              </button>
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <textarea
                {...register('location.address', { required: 'Address is required' })}
                rows={2}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Enter your exact location or use current location"
              />
            </div>
            {errors.location?.address && (
              <p className="mt-1 text-sm text-red-600">{errors.location.address.message}</p>
            )}
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Name *
                </label>
                <input
                  {...register('contactInfo.name', { required: 'Contact name is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Full name"
                />
                {errors.contactInfo?.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.contactInfo.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    {...register('contactInfo.phone', { required: 'Phone number is required' })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                {errors.contactInfo?.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.contactInfo.phone.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  {...register('contactInfo.email')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="email@example.com"
                />
              </div>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600">
              <strong>Privacy Notice:</strong> Your contact information will only be shared with 
              verified volunteers and relief organizations to coordinate assistance. Your location 
              will be visible on the emergency coordination map.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{loading ? 'Creating...' : request ? 'Update Request' : 'Create Request'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestForm;