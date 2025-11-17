
import React, { ReactNode } from 'react';
import Navbar from '@/components/Navbar';
import { useIsMobile } from '@/hooks/use-mobile';
import DashboardLayoutTemplate from '@/components/templates/DashboardLayoutTemplate';

interface PageLayoutProps {
  children: ReactNode;
}

const PageLayout = ({ children }: PageLayoutProps) => {
  return (
    <DashboardLayoutTemplate>
      {children}
    </DashboardLayoutTemplate>
  );
};

export default PageLayout;
