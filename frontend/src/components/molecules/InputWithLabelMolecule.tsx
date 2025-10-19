import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface InputWithLabelMoleculeProps {
  label: string;
  id: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

// Componente que combina input com label
const InputWithLabelMolecule: React.FC<InputWithLabelMoleculeProps> = ({
  label,
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  className = ''
}) => {
  return (
    <div className={cn('grid items-center gap-2', className)}>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </div>
  );
};

export default InputWithLabelMolecule;