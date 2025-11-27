import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  label: string;
  id: string;
  type?: 'text' | 'email' | 'number' | 'password' | 'textarea' | 'select' | 'date';
  value?: string | number | boolean;
  onChange?: (value: any) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  className?: string;
  children?: React.ReactNode; // Para opções de select
  min?: string | number;
  max?: string | number;
  step?: string | number;
}

// Componente atômico para campos de formulário com mais opções
const FormField: React.FC<FormFieldProps> = ({
  label,
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
  className = '',
  children,
  min,
  max,
  step
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
      case 'select':
        return (
          <Select value={value as string} onValueChange={(val) => onChange?.(val)}>
            <SelectTrigger className={error ? 'border-red-500' : ''}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {children}
            </SelectContent>
          </Select>
        );
      case 'date':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !value && "text-muted-foreground",
                  error && "border-red-500"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? new Date(value as string).toLocaleDateString() : <span>{placeholder}</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={value ? new Date(value as string) : undefined}
                onSelect={(date) => onChange?.(date?.toISOString().split('T')[0])}
                initialFocus
              />
            </PopoverContent>
          </Popover>
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
            min={min}
            max={max}
            step={step}
            className={error ? 'border-red-500' : ''}
          />
        );
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={id}>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {renderField()}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default FormField;