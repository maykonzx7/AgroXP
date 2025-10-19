import React from 'react';
import { Label as UILabel, LabelProps } from '@/components/ui/label';

// Wrapper para o label da UI com estilos específicos
const LabelAtom: React.FC<LabelProps> = ({ ...props }) => {
  return (
    <UILabel {...props} />
  );
};

export default LabelAtom;