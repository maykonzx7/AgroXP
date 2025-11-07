import React from 'react';
import { Button as UIButton } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';

interface ActionMenuMoleculeProps {
  actions: { label: string; onClick: () => void }[];
}

// Menu dropdown com ações
const ActionMenuMolecule: React.FC<ActionMenuMoleculeProps> = ({ actions }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <UIButton variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </UIButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {actions.map((action, index) => (
          <DropdownMenuItem key={index} onClick={action.onClick}>
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ActionMenuMolecule;