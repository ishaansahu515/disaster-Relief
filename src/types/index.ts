export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ngo' | 'volunteer' | 'victim';
  phone?: string;
  organization?: string;
  verified: boolean;
  createdAt: string;
}

export interface Resource {
  id: string;
  title: string;
  type: 'food' | 'medicine' | 'shelter' | 'water' | 'clothing' | 'transport' | 'other';
  description: string;
  quantity: number;
  unit: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  contactInfo: {
    name: string;
    phone: string;
    email?: string;
  };
  availability: 'available' | 'reserved' | 'distributed';
  expiryDate?: string;
  postedBy: string; // user id
  postedAt: string;
  updatedAt: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface HelpRequest {
  id: string;
  title: string;
  type: 'food' | 'medicine' | 'shelter' | 'water' | 'clothing' | 'transport' | 'rescue' | 'other';
  description: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  contactInfo: {
    name: string;
    phone: string;
    email?: string;
  };
  peopleAffected: number;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  requestedBy: string; // user id
  assignedTo?: string; // volunteer/ngo id
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface SafeZone {
  id: string;
  name: string;
  type: 'evacuation' | 'shelter' | 'medical' | 'distribution';
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  capacity: number;
  currentOccupancy: number;
  facilities: string[];
  contact: {
    name: string;
    phone: string;
  };
  status: 'active' | 'full' | 'closed';
  managedBy: string; // user id
  createdAt: string;
  updatedAt: string;
}

export interface Delivery {
  id: string;
  resourceId: string;
  requestId: string;
  volunteerId: string;
  status: 'pending' | 'in-transit' | 'delivered' | 'failed';
  pickupLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  deliveryLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  estimatedDeliveryTime?: string;
  actualDeliveryTime?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'ngo' | 'volunteer' | 'victim';
  phone?: string;
  organization?: string;
}