// src/contexts/AuthContext.tsx (complete version)

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import api from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'moderator' | 'user' | 'farmer';
  phone?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, password: string, role: string, phone?: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  // Check if user is authenticated on app load
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const storedUser = localStorage.getItem('admin_user');

    if (token && storedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);

      // Make API call to backend using the API service
      const response = await api.post('/auth/login', {
        email,
        password
      });

      // Axios responses are handled differently from fetch
      const data = response.data;
      setUser(data.user);
      setIsAuthenticated(true);

      // Store in localStorage
      localStorage.setItem("admin_token", data.token);
      localStorage.setItem("admin_user", JSON.stringify(data.user));

      return true;
    } catch (error: any) {
      // Handle different error statuses
      if (error.response) {
        if (error.response.status === 401) {
          // Invalid credentials
          console.error("Login error: Invalid credentials");
        } else if (error.response.status === 422) {
          // Validation error
          console.error("Login error: Validation error");
        } else if (error.response.status === 404) {
          // Endpoint not found
          console.error("Login error: Login endpoint not found on server");
        } else {
          // Other errors
          console.error("Login error: Server responded with status", error.response.status);
        }

        // Handle error response data
        const errorData = error.response.data;
        console.error("Login error:", errorData.error || "Unknown error occurred");
      } else if (error.request) {
        // Request was made but no response received
        console.error("Login error: No response received from server. Check network connection.");
      } else {
        // Something else happened
        console.error("Login error:", error.message);
      }
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: string, phone?: string): Promise<boolean> => {
    try {
      setLoading(true);

      // Make API call to backend using the API service
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
        role,
        phone
      });

      // If we reach here, the request was successful
      return true;
    } catch (error: any) {
      // Handle different error statuses
      if (error.response) {
        if (error.response.status === 409) {
          // Conflict - email already exists
          console.error("Registration error: Email already exists");
        } else if (error.response.status === 422) {
          // Validation error
          console.error("Registration error: Validation error");
        } else if (error.response.status === 404) {
          // Endpoint not found
          console.error("Registration error: Registration endpoint not found on server");
        } else {
          // Other errors
          console.error("Registration error: Server responded with status", error.response.status);
        }

        // Handle error response data
        const errorData = error.response.data;
        console.error("Registration error:", errorData.error || "Unknown error occurred");
      } else if (error.request) {
        // Request was made but no response received
        console.error("Registration error: No response received from server. Check network connection.");
      } else {
        // Something else happened
        console.error("Registration error:", error.message);
      }
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = (): void => {
    setUser(null);
    setIsAuthenticated(false);

    // Remove from localStorage
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
  };

  const value = {
    isAuthenticated,
    loading,
    user,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

export default AuthContext;