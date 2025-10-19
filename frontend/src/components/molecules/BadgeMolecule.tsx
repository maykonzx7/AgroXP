import React from 'react';
import { Badge as UIBadge, BadgeProps } from '@/components/ui/badge';

// Wrapper para o badge da UI com estilos específicos
const BadgeMolecule: React.FC<BadgeProps> = ({ children, ...props }) => {
  return (
    <UIBadge {...props}>
      {children}
    </UIBadge>
  );
};

export default BadgeMolecule;