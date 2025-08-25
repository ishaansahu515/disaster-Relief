import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { resourceAPI } from '../../services/api';
import { Resource } from '../../types';
import { useForm } from 'react-hook-form';
import {
  X,
  Save,
  MapPin,
  Package,
  Calendar,
  Phone,
  AlertTriangle
} from 'lucide-react';

interface ResourceFormProps {
  onSuccess: (resource: Resource) => void;
  onCancel: () => void;
  resource?: Resource;
}

interface ResourceFormData {
  title: string;
  type: 'food' | 'medicine' | 'shelter' | 'water' | 'clothing' | 'transport' | 'other';
  description: string;
  quantity: number;
  unit: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
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
  expiryDate?: string;
}

const ResourceForm: React.FC<ResourceFormProps> = ({ onSuccess, onCancel, resource }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm<ResourceFormData>({
    defaultValues: resource ? {
      title: resource.title,
      type: resource.type,
      description: resource.description,
      quantity: resource.quantity,
      unit: resource.unit,
      priority: resource.priority,
      location: {
        address: resource.location.address,
        latitude: resource.location.latitude,
        longitude: resource.location.longitude
      },
      contactInfo: {
        name: resource.contactInfo.name,
        phone: resource.contactInfo.phone,
        email: resource.contactInfo.email
      },
      expiryDate: resource.expiryDate ? resource.expiryDate.split('T')[0] : undefined
    } : {
      contactInfo: {
        name: user?.name || '',
        phone: user?.phone || '',
        email: user?.email || ''
      }
    }
  });

  const onSubmit = async (data: ResourceFormData) => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const resourceData = {
        ...data,
        postedBy: user.id,
        availability: 'available' as const
      };

      const newResource = await resourceAPI.create(resourceData);
      onSuccess(newResource);
    } catch (err) {
      setError('Failed to post resource. Please try again.');
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

  const resourceTypes = [
    { value: 'food', label: 'Food & Nutrition', icon: '🍞' },
    { value: 'medicine', label: 'Medical Supplies', icon: '💊' },
    { value: 'shelter', label: 'Shelter & Housing', icon: '🏠' },
    { value: 'water', label: 'Water & Hydration', icon: '💧' },
    { value: 'clothing', label: 'Clothing & Blankets', icon: '👕' },
    { value: 'transport', label: 'Transportation', icon: '🚐' },
    { value: 'other', label: 'Other Resources', icon: '📦' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low Priority', color: 'text-gray-600' },
    { value: 'medium', label: 'Medium Priority', color: 'text-blue-600' },
    { value: 'high', label: 'High Priority', color: 'text-yellow-600' },
    { value: 'urgent', label: 'Urgent', color: 'text-red-600' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {resource ? 'Edit Resource' : 'Add New Resource'}
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

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Resource Title *
              </label>
              <input
                {...register('title', { required: 'Title is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="e.g., Emergency Food Supplies for 50 Families"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Resource Type *
              </label>
              <select
                {...register('type', { required: 'Type is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">Select type...</option>
                {resourceTypes.map(type => (
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
                Priority Level *
              </label>
              <select
                {...register('priority', { required: 'Priority is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">Select priority...</option>
                {priorityOptions.map(priority => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
              {errors.priority && (
                <p className="mt-1 text-sm text-red-600">{errors.priority.message}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              {...register('description', { required: 'Description is required' })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Provide detailed information about the resource..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Quantity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity *
              </label>
              <div className="relative">
                <Package className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  {...register('quantity', { required: 'Quantity is required', min: 1 })}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="0"
                />
              </div>
              {errors.quantity && (
                <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit *
              </label>
              <input
                {...register('unit', { required: 'Unit is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="e.g., boxes, kits, people, liters"
              />
              {errors.unit && (
                <p className="mt-1 text-sm text-red-600">{errors.unit.message}</p>
              )}
            </div>
          </div>

          {/* Expiry Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiry Date (Optional)
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="date"
                {...register('expiryDate')}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
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
                placeholder="Enter full address or use current location"
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
              <span>{loading ? 'Saving...' : resource ? 'Update Resource' : 'Post Resource'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResourceForm;