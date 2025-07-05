export interface User {
  id: string;
  email: string;
  username: string;
  role: 'manager' | 'admin';
  createdAt: Date;
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  orderNumber: string;
  clientId: string;
  clientName: string; // Denormalized for easier querying
  dateReceived: Date;
  description: string;
  internalCost: number;
  clientPrice: number;
  estimatedHours: number;
  hoursCompleted: number;
  deadline?: Date;
  status: 'waiting' | 'started' | 'complete';
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkPreferences {
  daysPerWeek: number;
  hoursPerDay: number;
  daysOff: number[]; // 0 = Sunday, 1 = Monday, etc.
  customDaysOff: Date[]; // Specific dates off
}

export interface EstimatedCompletion {
  orderId: string;
  estimatedDate: Date;
  remainingHours: number;
}