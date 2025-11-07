
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import ParcelsPage from "./pages/ParcelsManagementPage";
import ParcelsDetailsPage from "./pages/ParcelsDetailsPage";
import CropsPage from "./pages/CropsManagementPage";
import LivestockPage from "./pages/LivestockManagementPage";
import InventoryPage from "./pages/InventoryManagementPage";
import FinancePage from "./pages/FinancialManagementPage";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import { useEffect } from "react";
import { CRMProvider } from "./contexts/CRMContext";
import { AppSettingsProvider } from "./contexts/AppSettingsContext";
import { trackPageView } from "./utils/analytics";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

// Create query client with enhanced configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

// Router change handler component
const RouterChangeHandler = () => {
  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0);
    
    // Track page view for analytics
    const currentPath = window.location.pathname;
    const pageName = currentPath === '/' ? 'dashboard' : currentPath.replace(/^\//, '');
    trackPageView(pageName);
  });
  
  return null;
};

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Public route component
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }
  
  return !isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
};

// Application main component with properly nested providers
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppSettingsProvider>
        <AuthProvider>
          <CRMProvider>
            <BrowserRouter>
              <TooltipProvider>
                <RouterChangeHandler />
                <Routes>
                  <Route 
                    path="/login" 
                    element={
                      <PublicRoute>
                        <LoginPage />
                      </PublicRoute>
                    } 
                  />
                  <Route 
                    path="/register" 
                    element={
                      <PublicRoute>
                        <RegisterPage />
                      </PublicRoute>
                    } 
                  />
                  <Route 
                    path="/forgot-password" 
                    element={
                      <PublicRoute>
                        <ForgotPasswordPage />
                      </PublicRoute>
                    } 
                  />
                  <Route 
                    path="/" 
                    element={
                      <ProtectedRoute>
                        <Index />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/parcelas" 
                    element={
                      <ProtectedRoute>
                        <ParcelsPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/parcelas/:id" 
                    element={
                      <ProtectedRoute>
                        <ParcelsDetailsPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/culturas" 
                    element={
                      <ProtectedRoute>
                        <CropsPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/pecuaria" 
                    element={
                      <ProtectedRoute>
                        <LivestockPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/inventario" 
                    element={
                      <ProtectedRoute>
                        <InventoryPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/financas" 
                    element={
                      <ProtectedRoute>
                        <FinancePage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/dashboard" 
                    element={<Navigate to="/" replace />} 
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </TooltipProvider>
            </BrowserRouter>
          </CRMProvider>
        </AuthProvider>
      </AppSettingsProvider>
    </QueryClientProvider>
  );
};

export default App;
