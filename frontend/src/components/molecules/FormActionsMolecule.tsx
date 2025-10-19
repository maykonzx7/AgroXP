import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface FormActionsMoleculeProps {
  onSave: () => void;
  onCancel: () => void;
  saveLabel?: string;
  cancelLabel?: string;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode; // Para adicionar mais botões se necessário
}

// Componente de ações do formulário
const FormActionsMolecule: React.FC<FormActionsMoleculeProps> = ({
  onSave,
  onCancel,
  saveLabel = 'Salvar',
  cancelLabel = 'Cancelar',
  disabled = false,
  className = '',
  children
}) => {
  return (
    <Card className={cn('p-4 mt-6', className)}>
      <Separator className="mb-4" />
      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={disabled}
        >
          {cancelLabel}
        </Button>
        <Button
          type="button"
          onClick={onSave}
          disabled={disabled}
        >
          {saveLabel}
        </Button>
        {children}
      </div>
    </Card>
  );
};

export default FormActionsMolecule;