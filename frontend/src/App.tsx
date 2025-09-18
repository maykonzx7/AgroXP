
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
import { useEffect } from "react";
import { CRMProvider } from "./contexts/CRMContext";
import { AppSettingsProvider } from "./contexts/AppSettingsContext";
import { trackPageView } from "./utils/analytics";

// Define routes configuration with redirects
const routes = [
  { path: "/", element: <Index /> },
  { path: "/parcelas", element: <ParcelsPage /> },
  { path: "/parcelas/:id", element: <ParcelsDetailsPage /> },
  { path: "/culturas", element: <CropsPage /> },
  { path: "/pecuaria", element: <LivestockPage /> },
  { path: "/inventario", element: <InventoryPage /> },
  { path: "/financas", element: <FinancePage /> },
  
  { path: "/dashboard", element: <Navigate to="/" replace /> },
  { path: "*", element: <NotFound /> }
];

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

// Application main component with properly nested providers
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppSettingsProvider>
        <CRMProvider>
          <BrowserRouter>
            <TooltipProvider>
              <RouterChangeHandler />
              <Routes>
                {routes.map((route) => (
                  <Route 
                    key={route.path} 
                    path={route.path} 
                    element={route.element} 
                  />
                ))}
              </Routes>
            </TooltipProvider>
          </BrowserRouter>
        </CRMProvider>
      </AppSettingsProvider>
    </QueryClientProvider>
  );
};

export default App;
