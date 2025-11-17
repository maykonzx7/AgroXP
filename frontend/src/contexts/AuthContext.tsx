import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

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
  register: (
    name: string,
    email: string,
    phone: string,
    farmName: string,
    password: string
  ) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
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
    const storedToken = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("authUser");

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

      // Make API call to backend - using direct URL to bypass proxy issues
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setToken(data.token);

        // Store in localStorage
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("authUser", JSON.stringify(data.user));

        return true;
      } else {
        // Handle different error statuses
        if (response.status === 401) {
          // Invalid credentials
          // Tratar erro de login: credenciais inválidas
        } else if (response.status === 422) {
          // Validation error
          // Tratar erro de login: erro de validação
        } else {
          // Other errors
          // Tratar erro de login: servidor respondeu com status
        }
        
        // Attempt to parse error response, but handle if it's not JSON
        let errorData;
        try {
          errorData = await response.json();
        } catch (jsonError) {
          // Tratar erro: não foi possível fazer parse da resposta de erro como JSON
          errorData = { error: "Server response could not be processed" };
        }
        
        // Tratar erro de login
        return false;
      }
    } catch (error) {
      // Tratar erro de rede durante login
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
    password: string,
    farmLocation?: string,
    farmDescription?: string,
    farmSize?: number
  ): Promise<boolean> => {
    try {
      setLoading(true);

      // Make API call to backend - using direct URL to bypass proxy issues
      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          name, 
          email, 
          phone, 
          farmName, 
          password,
          farmLocation,
          farmDescription,
          farmSize
        }),
      });

      if (response.ok) {
        // Registration successful, but don't automatically log in
        // User will be redirected to login page to enter credentials
        return true;
      } else {
        // Handle different error statuses
        if (response.status === 409) {
          // Conflict - email already exists
          // Tratar erro de registro: e-mail já existe
        } else if (response.status === 422) {
          // Validation error
          // Tratar erro de registro: erro de validação
        } else {
          // Other errors
          // Tratar erro de registro: servidor respondeu com status
        }
        
        // Attempt to parse error response, but handle if it's not JSON
        let errorData;
        try {
          errorData = await response.json();
        } catch (jsonError) {
          // Tratar erro: não foi possível fazer parse da resposta de erro como JSON
          errorData = { error: "Server response could not be processed" };
        }
        
        // Tratar erro de registro
        return false;
      }
    } catch (error) {
      // Tratar erro de rede durante registro
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
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    
    // Clear any cached CRM data to prevent cross-user data leakage
    // This helps ensure that when a new user logs in, they don't see previous user's data
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('crm-') || key.startsWith('module-')) {
        localStorage.removeItem(key);
      }
    });
    
    // Dispatch event to notify other parts of the app (like CRM context) of logout
    window.dispatchEvent(new CustomEvent('userLoggedOut'));
  };

  // Update user function
  const updateUser = (userData: Partial<User>): void => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem("authUser", JSON.stringify(updatedUser));
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
    updateUser,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
