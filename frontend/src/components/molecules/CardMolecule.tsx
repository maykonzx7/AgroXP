import React from 'react';
import { 
  Card as UICard, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';

interface CardMoleculeProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

// Componente Card que combina header, content e footer
const CardMolecule: React.FC<CardMoleculeProps> = ({ 
  title, 
  description, 
  children, 
  footer, 
  className = '' 
}) => {
  return (
    <UICard className={className}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        {children}
      </CardContent>
      {footer && <CardFooter>{footer}</CardFooter>}
    </UICard>
  );
};

export default CardMolecule;