import React from 'react';
import Navbar from '../Navbar';
import BreadcrumbAtom from '../atoms/BreadcrumbAtom';
import { useLocation } from 'react-router-dom';

interface DashboardLayoutTemplateProps {
  children: React.ReactNode;
  breadcrumbItems?: { label: string; path?: string; isCurrent?: boolean }[];
}

// Layout principal para dashboards com navbar e breadcrumbs
const DashboardLayoutTemplate: React.FC<DashboardLayoutTemplateProps> = ({
  children,
  breadcrumbItems = []
}) => {
  const location = useLocation();
  
  // Se não forem fornecidos breadcrumbs, podemos gerar automaticamente com base na rota
  const generateBreadcrumbs = () => {
    if (breadcrumbItems.length > 0) return breadcrumbItems;
    
    const pathnames = location.pathname.split('/').filter(x => x);
    const breadcrumbs = pathnames.map((value, index) => {
      const path = `/${pathnames.slice(0, index + 1).join('/')}`;
      const isLast = index === pathnames.length - 1;
      
      // Converter caminho em rótulo legível
      const label = value
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      return {
        label: isLast ? label : (
          <a href={path} className="hover:underline">
            {label}
          </a>
        ),
        path: isLast ? undefined : path,
        isCurrent: isLast
      };
    });
    
    return [{ label: 'Início', path: '/' }, ...breadcrumbs];
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <div className="flex h-screen overflow-hidden">
      <Navbar />
      
      <div className="flex-1 overflow-auto">
        <div className="border-b">
          <div className="container mx-auto px-4 py-3">
            <BreadcrumbAtom items={breadcrumbs} />
          </div>
        </div>
        
        <main className="container mx-auto py-6 px-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayoutTemplate;