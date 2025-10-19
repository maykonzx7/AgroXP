import React from 'react';
import { Button as UIButton, ButtonProps } from '@/components/ui/button';

// Wrapper para o botão da UI com estilos específicos
const ButtonAtom: React.FC<ButtonProps> = ({ children, ...props }) => {
  return (
    <UIButton {...props}>
      {children}
    </UIButton>
  );
};

export default ButtonAtom;