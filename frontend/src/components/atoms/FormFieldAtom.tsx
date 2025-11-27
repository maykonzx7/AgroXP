import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  label: string;
  id: string;
  type?: 'text' | 'email' | 'number' | 'password' | 'textarea' | 'checkbox';
  value?: string | number | boolean;
  onChange?: (value: any) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  className?: string;
}

// Componente atômico para campos de formulário
const FormField: React.FC<FormFieldProps> = ({
  label,
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
  className = ''
}) => {
  const renderField = () => {
    switch (type) {
      case 'textarea':
        return (
          <Textarea
            id={id}
            value={value as string}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            required={required}
            className={error ? 'border-red-500' : ''}
          />
        );
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={id}
              checked={value as boolean}
              onCheckedChange={(checked) => onChange?.(checked)}
            />
            <Label htmlFor={id}>{label}</Label>
          </div>
        );
      case 'number':
      case 'email':
      case 'password':
      case 'text':
      default:
        return (
          <Input
            id={id}
            type={type}
            value={value === null || value === undefined ? '' : value}
            onChange={(e) => {
              if (type === 'number') {
                const val = e.target.value === '' ? '' : (isNaN(Number(e.target.value)) ? value : Number(e.target.value));
                onChange?.(val);
              } else {
                onChange?.(e.target.value);
              }
            }}
            placeholder={placeholder}
            required={required}
            className={error ? 'border-red-500' : ''}
          />
        );
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      {type !== 'checkbox' && <Label htmlFor={id}>{label} {required && <span className="text-red-500">*</span>}</Label>}
      {renderField()}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default FormField;