import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import FormField from '@/components/atoms/FormFieldEnhancedAtom';
import FormActionsMolecule from '@/components/molecules/FormActionsMolecule';
import { Button } from '@/components/ui/button';
import { SelectItem } from '@/components/ui/select';

interface TaskFormProps {
  task: {
    title: string;
    description: string;
    assignee: string;
    dueDate: string;
    priority: 'Baixa' | 'Média' | 'Alta' | 'Urgente';
    status: 'A fazer' | 'Em andamento' | 'Concluída';
  };
  onSave: () => void;
  onCancel: () => void;
  onChange: (field: string, value: any) => void;
  title: string;
  disabled?: boolean;
}

// Componente de formulário de tarefa reutilizável
const TaskFormOrganism: React.FC<TaskFormProps> = ({
  task,
  onSave,
  onCancel,
  onChange,
  title,
  disabled = false
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <FormField
            label="Título*"
            id="task-title"
            type="text"
            value={task.title}
            onChange={(value) => onChange('title', value)}
            placeholder="Ex: Preparar solo para plantio"
            required
          />
          
          <FormField
            label="Descrição"
            id="task-description"
            type="textarea"
            value={task.description}
            onChange={(value) => onChange('description', value)}
            placeholder="Detalhes da tarefa..."
          />
          
          <FormField
            label="Responsável"
            id="task-assignee"
            type="text"
            value={task.assignee}
            onChange={(value) => onChange('assignee', value)}
            placeholder="Nome do responsável"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Data de Vencimento"
              id="task-due-date"
              type="date"
              value={task.dueDate}
              onChange={(value) => onChange('dueDate', value)}
            />
            
            <FormField
              label="Prioridade"
              id="task-priority"
              type="select"
              value={task.priority}
              onChange={(value) => onChange('priority', value as any)}
            >
              <SelectItem value="Baixa">Baixa</SelectItem>
              <SelectItem value="Média">Média</SelectItem>
              <SelectItem value="Alta">Alta</SelectItem>
              <SelectItem value="Urgente">Urgente</SelectItem>
            </FormField>
          </div>
        </form>
        
        <FormActionsMolecule
          onSave={onSave}
          onCancel={onCancel}
          disabled={disabled}
        >
          <Button 
            type="button" 
            variant="secondary" 
            onClick={() => onChange('status', task.status === 'A fazer' ? 'Em andamento' : 'A fazer')}
          >
            {task.status === 'A fazer' ? 'Marcar como Em andamento' : 'Marcar como A fazer'}
          </Button>
        </FormActionsMolecule>
      </CardContent>
    </Card>
  );
};

export default TaskFormOrganism;