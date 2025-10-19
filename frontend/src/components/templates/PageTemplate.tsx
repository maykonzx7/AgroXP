import React from 'react';
import { cn } from '@/lib/utils';

interface PageTemplateProps {
  children: React.ReactNode;
  className?: string;
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
}

// Template básico de página com header, sidebar e conteúdo
const PageTemplate: React.FC<PageTemplateProps> = ({
  children,
  className = '',
  header,
  sidebar
}) => {
  return (
    <div className={cn('flex flex-col h-screen', className)}>
      {header && <header className="border-b">{header}</header>}
      
      <div className="flex flex-1 overflow-hidden">
        {sidebar && <aside className="hidden md:block border-r w-64 flex-shrink-0">{sidebar}</aside>}
        
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default PageTemplate;