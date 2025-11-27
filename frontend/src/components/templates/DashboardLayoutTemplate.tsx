import React from "react";
import Navbar from "../Navbar";
import BreadcrumbAtom from "../atoms/BreadcrumbAtom";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardLayoutTemplateProps {
  children: React.ReactNode;
  breadcrumbItems?: { label: string; path?: string; isCurrent?: boolean }[];
}

// Layout principal para dashboards com navbar e breadcrumbs
const DashboardLayoutTemplate: React.FC<DashboardLayoutTemplateProps> = ({
  children,
  breadcrumbItems = [],
}) => {
  const location = useLocation();
  const { user } = useAuth();

  // Se não forem fornecidos breadcrumbs, podemos gerar automaticamente com base na rota
  const generateBreadcrumbs = () => {
    if (breadcrumbItems.length > 0) return breadcrumbItems;

    const pathnames = location.pathname.split("/").filter((x) => x);
    const breadcrumbs = pathnames.map((value, index) => {
      const path = `/${pathnames.slice(0, index + 1).join("/")}`;
      const isLast = index === pathnames.length - 1;

      // Converter caminho em rótulo legível
      const label = value
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      return {
        label: isLast ? (
          label
        ) : (
          <a href={path} className="hover:underline">
            {label}
          </a>
        ),
        path: isLast ? undefined : path,
        isCurrent: isLast,
      };
    });

    return [{ label: "Início", path: "/" }, ...breadcrumbs];
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-background">
      <Navbar />

      <div className="flex-1 overflow-auto flex flex-col min-h-0">
        <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-2 md:py-3">
            <BreadcrumbAtom items={breadcrumbs as any} />
          </div>
        </div>

        <main className="flex-1 container mx-auto py-4 md:py-6 px-3 sm:px-4 md:px-6 lg:px-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayoutTemplate;
