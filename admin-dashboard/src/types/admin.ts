// src/types/admin.ts (complete)

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'moderator' | 'user' | 'farmer';
  phone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  createdAt: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

export interface Report {
  id: string;
  title: string;
  description: string;
  type: 'financial' | 'operational' | 'user' | 'performance';
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  lastGenerated: string;
  createdBy: string;
  createdAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalTenants: number;
  activeSessions: number;
  systemUptime: string;
  apiRequestsPerMinute: number;
}