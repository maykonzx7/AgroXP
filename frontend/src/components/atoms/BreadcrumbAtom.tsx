import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  path?: string;
  isCurrent?: boolean;
}

interface BreadcrumbAtomProps {
  items: BreadcrumbItem[];
}

const BreadcrumbAtom: React.FC<BreadcrumbAtomProps> = ({ items }) => {
  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
      <Link 
        to="/" 
        className="hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          {item.path && !item.isCurrent ? (
            <Link 
              to={item.path} 
              className="hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className={`${item.isCurrent ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default BreadcrumbAtom;