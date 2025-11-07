import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types for authentication
interface User {
  id: number;
  email: string;
  name: string;
  farmName: string;
  phone: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, phone: string, farmName: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Check if user is authenticated on app load
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('authUser');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    
    setLoading(false);
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Make API call to backend
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setToken(data.token);
        
        // Store in localStorage
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('authUser', JSON.stringify(data.user));
        
        return true;
      } else {
        const errorData = await response.json();
        console.error('Login error:', errorData.error);
        return false;
      }
    } catch (error) {
      console.error('Network error during login:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (
    name: string,
    email: string,
    phone: string,
    farmName: string,
    password: string
  ): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Make API call to backend
      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, phone, farmName, password }),
      });
      
      if (response.ok) {
        // Registration successful, but don't automatically log in
        // User will be redirected to login page to enter credentials
        return true;
      } else {
        const errorData = await response.json();
        console.error('Registration error:', errorData.error);
        return false;
      }
    } catch (error) {
      console.error('Network error during registration:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = (): void => {
    setUser(null);
    setToken(null);
    
    // Remove from localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};