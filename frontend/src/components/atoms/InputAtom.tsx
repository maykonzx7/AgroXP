import React from 'react';
import { Input as UIInput, InputProps } from '@/components/ui/input';

// Wrapper para o input da UI com estilos específicos
const InputAtom: React.FC<InputProps> = ({ ...props }) => {
  return (
    <UIInput {...props} />
  );
};

export default InputAtom;