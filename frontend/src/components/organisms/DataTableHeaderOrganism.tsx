import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Edit, Trash2, Plus } from 'lucide-react';

interface DataTableHeaderOrganismProps {
  title: string;
  description?: string;
  onAdd?: () => void;
  addLabel?: string;
  actions?: { label: string; onClick: () => void }[];
}

// Cabeçalho de tabela com título, descrição e ações
const DataTableHeaderOrganism: React.FC<DataTableHeaderOrganismProps> = ({
  title,
  description,
  onAdd,
  addLabel = 'Adicionar',
  actions
}) => {
  return (
    <Card className="p-4 mb-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">{title}</h2>
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
        
        <div className="flex items-center gap-2">
          {onAdd && (
            <Button onClick={onAdd}>
              <Plus className="h-4 w-4 mr-2" />
              {addLabel}
            </Button>
          )}
          {actions && actions.length > 0 && (
            <div className="flex gap-2">
              {actions.map((action, index) => (
                <Button key={index} variant="outline" onClick={action.onClick}>
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
      <Separator className="my-4" />
    </Card>
  );
};

export default DataTableHeaderOrganism;