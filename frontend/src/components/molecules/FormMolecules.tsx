import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// InputWithLabelMolecule component
interface InputWithLabelProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}

export const InputWithLabelMolecule = ({ 
  id, 
  label, 
  value, 
  onChange, 
  type = 'text', 
  placeholder 
}: InputWithLabelProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
};

// TextareaWithLabelMolecule component
interface TextareaWithLabelProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const TextareaWithLabelMolecule = ({ 
  id, 
  label, 
  value, 
  onChange, 
  placeholder 
}: TextareaWithLabelProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
};

// SelectWithLabelMolecule component
interface SelectWithLabelProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const SelectWithLabelMolecule = ({ 
  id, 
  label, 
  value, 
  onChange, 
  options, 
  placeholder 
}: SelectWithLabelProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

// ActionButtonMolecule component
interface ActionButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  disabled?: boolean;
}

export const ActionButtonMolecule = ({ 
  onClick, 
  children, 
  variant = 'default', 
  disabled = false 
}: ActionButtonProps) => {
  return (
    <Button onClick={onClick} variant={variant} disabled={disabled}>
      {children}
    </Button>
  );
};

// FormActionsMolecule component
interface FormActionsProps {
  onSave: () => void;
  onCancel: () => void;
  saveDisabled?: boolean;
  cancelDisabled?: boolean;
  saveLabel?: string;
  cancelLabel?: string;
}

export const FormActionsMolecule = ({ 
  onSave, 
  onCancel, 
  saveDisabled = false, 
  cancelDisabled = false, 
  saveLabel = 'Salvar',
  cancelLabel = 'Cancelar'
}: FormActionsProps) => {
  return (
    <div className="flex justify-end space-x-2 pt-4">
      <ActionButtonMolecule 
        onClick={onCancel} 
        variant="outline" 
        disabled={cancelDisabled}
      >
        {cancelLabel}
      </ActionButtonMolecule>
      <ActionButtonMolecule 
        onClick={onSave} 
        disabled={saveDisabled}
      >
        {saveLabel}
      </ActionButtonMolecule>
    </div>
  );
};