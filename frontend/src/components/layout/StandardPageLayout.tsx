import React, { ReactNode } from 'react';
import PageLayout from './PageLayout';
import PageHeader from './PageHeader';
import usePageMetadata from '../../hooks/use-page-metadata';
import useSpacing from '../../hooks/use-spacing';
import { Button } from '../ui/button';
import { Download, Upload, Plus, Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Input } from '../ui/input';

interface StandardPageLayoutProps {
  defaultTitle: string;
  defaultDescription: string;
  actions?: ReactNode;
  filterArea?: ReactNode;
  children: ReactNode;
  onExport?: () => void | Promise<void>;
  onImport?: () => void | Promise<void>;
  onAdd?: () => void;
  addButtonLabel?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  searchValue?: string;
  filterOptions?: {
    label: string;
    value: string;
    options: { label: string; value: string }[];
    onChange: (value: string) => void;
  }[];
}

const StandardPageLayout: React.FC<StandardPageLayoutProps> = ({
  defaultTitle,
  defaultDescription,
  actions,
  filterArea,
  children,
  onExport,
  onImport,
  onAdd,
  addButtonLabel = 'Adicionar',
  searchPlaceholder = 'Buscar...',
  onSearchChange,
  searchValue,
  filterOptions = [],
}) => {
  const spacing = useSpacing();
  const {
    title,
    description,
    handleTitleChange,
    handleDescriptionChange,
  } = usePageMetadata({
    defaultTitle,
    defaultDescription,
  });

  const defaultActions = (
    <div className="flex flex-wrap gap-1.5">
      {onSearchChange && (
        <div className="relative">
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue || ''}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full md:w-[200px] h-7 text-xs"
          />
        </div>
      )}
      
      {filterOptions.map((filter, index) => (
        <Select
          key={index}
          value={filter.value}
          onValueChange={filter.onChange}
        >
          <SelectTrigger className="w-full md:w-[120px] h-7 text-xs">
            <SelectValue placeholder={filter.label} />
          </SelectTrigger>
          <SelectContent>
            {filter.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}

      {onExport && (
        <Button
          variant="outline"
          onClick={onExport}
          className="flex items-center gap-1.5 h-7 text-xs px-2"
        >
          <Download className="h-3 w-3" />
          Exportar
        </Button>
      )}

      {onImport && (
        <Button
          variant="outline"
          onClick={onImport}
          className="flex items-center gap-1.5 h-7 text-xs px-2"
        >
          <Upload className="h-3 w-3" />
          Importar
        </Button>
      )}

      {onAdd && (
        <Button
          className="bg-green-600 hover:bg-green-700 flex items-center gap-1.5 h-7 text-xs px-2"
          onClick={onAdd}
        >
          <Plus className="h-3 w-3" />
          {addButtonLabel}
        </Button>
      )}

      {actions}
    </div>
  );

  return (
    <PageLayout>
      <div className={spacing.getPageContainerClasses()}>
        <PageHeader
          title={title}
          description={description}
          onTitleChange={handleTitleChange}
          onDescriptionChange={handleDescriptionChange}
          actions={defaultActions}
          filterArea={filterArea}
        />
        {children}
      </div>
    </PageLayout>
  );
};

export default StandardPageLayout;

