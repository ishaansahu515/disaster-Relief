import { User, Resource, HelpRequest, SafeZone, Delivery, RegisterData } from '../types';

// const API_BASE_URL = process.env.NODE_ENV === 'production' 
//   ? 'https://your-disaster-relief-api.com/api' 
//   : 'http://localhost:5000/api';

// Mock data for demonstration
const mockUsers: User[] = [
  {
    id: '1',
    email: 'ngo@relief.org',
    name: 'Relief Organization',
    role: 'ngo',
    organization: 'Global Relief Foundation',
    verified: true,
    createdAt: '2025-01-27T10:00:00Z'
  },
  {
    id: '2',
    email: 'volunteer@helper.com',
    name: 'John Volunteer',
    role: 'volunteer',
    phone: '+1234567890',
    verified: true,
    createdAt: '2025-01-27T11:00:00Z'
  },
  {
    id: '3',
    email: 'victim@help.com',
    name: 'Jane Victim',
    role: 'victim',
    phone: '+1987654321',
    verified: false,
    createdAt: '2025-01-27T12:00:00Z'
  }
];

const mockResources: Resource[] = [
  {
    id: '1',
    title: 'Emergency Food Supplies',
    type: 'food',
    description: 'Rice, canned goods, and water for 50 families',
    quantity: 50,
    unit: 'family packs',
    location: {
      latitude: 40.7128,
      longitude: -74.0060,
      address: 'Relief Center, NYC'
    },
    contactInfo: {
      name: 'Relief Organization',
      phone: '+1234567890',
      email: 'ngo@relief.org'
    },
    availability: 'available',
    postedBy: '1',
    postedAt: '2025-01-27T10:30:00Z',
    updatedAt: '2025-01-27T10:30:00Z',
    priority: 'high'
  },
  {
    id: '2',
    title: 'Medical Supplies',
    type: 'medicine',
    description: 'First aid kits, antibiotics, and pain relief medication',
    quantity: 100,
    unit: 'kits',
    location: {
      latitude: 40.7589,
      longitude: -73.9851,
      address: 'Medical Center, NYC'
    },
    contactInfo: {
      name: 'Medical Relief Team',
      phone: '+1234567891'
    },
    availability: 'available',
    expiryDate: '2025-12-31',
    postedBy: '1',
    postedAt: '2025-01-27T11:00:00Z',
    updatedAt: '2025-01-27T11:00:00Z',
    priority: 'urgent'
  }
];

const mockRequests: HelpRequest[] = [
  {
    id: '1',
    title: 'Emergency Shelter Needed',
    type: 'shelter',
    description: 'Family of 4 needs temporary shelter after building collapse',
    urgency: 'critical',
    location: {
      latitude: 40.7505,
      longitude: -73.9934,
      address: '123 Emergency St, NYC'
    },
    contactInfo: {
      name: 'Jane Victim',
      phone: '+1987654321'
    },
    peopleAffected: 4,
    status: 'open',
    requestedBy: '3',
    createdAt: '2025-01-27T12:30:00Z',
    updatedAt: '2025-01-27T12:30:00Z'
  },
  {
    id: '2',
    title: 'Medical Assistance Required',
    type: 'medicine',
    description: 'Elderly person needs insulin and blood pressure medication',
    urgency: 'high',
    location: {
      latitude: 40.7614,
      longitude: -73.9776,
      address: '456 Help Ave, NYC'
    },
    contactInfo: {
      name: 'Emergency Contact',
      phone: '+1555666777'
    },
    peopleAffected: 1,
    status: 'in-progress',
    requestedBy: '3',
    assignedTo: '2',
    createdAt: '2025-01-27T13:00:00Z',
    updatedAt: '2025-01-27T14:00:00Z'
  }
];

const makeApiCall = async (endpoint: string, options?: RequestInit): Promise<any> => {
  // In a real implementation, this would make actual HTTP requests
  // For now, we'll simulate API responses with mock data
  
  const token = localStorage.getItem('disaster_relief_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options?.headers,
  };

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return new Promise((resolve, reject) => {
    // Simulate different API endpoints
    if (endpoint.includes('/auth/login')) {
      const body = JSON.parse(options?.body as string);
      const user = mockUsers.find(u => u.email === body.email);
      if (user && body.password === 'password123') {
        resolve({ user, token: `mock-token-${user.id}` });
      } else {
        reject(new Error('Invalid credentials'));
      }
    } else if (endpoint.includes('/auth/register')) {
      const body = JSON.parse(options?.body as string);
      const newUser: User = {
        id: Date.now().toString(),
        ...body,
        verified: false,
        createdAt: new Date().toISOString()
      };
      resolve({ user: newUser, token: `mock-token-${newUser.id}` });
    } else if (endpoint.includes('/resources')) {
      if (options?.method === 'POST') {
        const body = JSON.parse(options?.body as string);
        const newResource: Resource = {
          id: Date.now().toString(),
          ...body,
          postedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        mockResources.push(newResource);
        resolve(newResource);
      } else {
        resolve(mockResources);
      }
    } else if (endpoint.includes('/requests')) {
      if (options?.method === 'POST') {
        const body = JSON.parse(options?.body as string);
        const newRequest: HelpRequest = {
          id: Date.now().toString(),
          ...body,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        mockRequests.push(newRequest);
        resolve(newRequest);
      } else {
        resolve(mockRequests);
      }
    } else {
      reject(new Error('Endpoint not found'));
    }
  });
};

export const authAPI = {
  login: (email: string, password: string) => 
    makeApiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),
  
  register: (userData: RegisterData) => 
    makeApiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),
};

export const resourceAPI = {
  getAll: () => makeApiCall('/resources'),
  
  create: (resourceData: Partial<Resource>) => 
    makeApiCall('/resources', {
      method: 'POST',
      body: JSON.stringify(resourceData)
    }),
  
  update: (id: string, resourceData: Partial<Resource>) =>
    makeApiCall(`/resources/${id}`, {
      method: 'PUT',
      body: JSON.stringify(resourceData)
    }),
};

export const requestAPI = {
  getAll: () => makeApiCall('/requests'),
  
  create: (requestData: Partial<HelpRequest>) => 
    makeApiCall('/requests', {
      method: 'POST',
      body: JSON.stringify(requestData)
    }),
  
  update: (id: string, requestData: Partial<HelpRequest>) =>
    makeApiCall(`/requests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(requestData)
    }),
  
  assign: (id: string, volunteerId: string) =>
    makeApiCall(`/requests/${id}/assign`, {
      method: 'POST',
      body: JSON.stringify({ volunteerId })
    }),
};