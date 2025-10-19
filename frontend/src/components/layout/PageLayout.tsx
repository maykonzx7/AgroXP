
import React, { ReactNode } from 'react';
import Navbar from '../Navbar';
import { useIsMobile } from '@/hooks/use-mobile';
import DashboardLayoutTemplate from '../templates/DashboardLayoutTemplate';

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
