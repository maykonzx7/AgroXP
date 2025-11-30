import React, { useState, useRef, useEffect } from 'react';
import { EditableField } from './editable-field';
import { ChevronDown, Edit, Trash2, Plus, Save, X } from 'lucide-react';

export interface Column {
  id: string;
  header: string;
  accessorKey: string;
  type?: 'text' | 'number' | 'boolean' | 'select';
  options?: string[];
  isEditable?: boolean;
  width?: string;
}

interface EditableTableProps {
  data: Record<string, any>[];
  columns: Column[];
  onUpdate: (rowIndex: number, columnId: string, value: any) => void;
  onDelete?: (rowIndex: number) => void;
  onAdd?: (newRow: Record<string, any>) => void;
  className?: string;
  sortable?: boolean;
  actions?: { icon: React.ReactNode, label: string, onClick: (rowIndex: number) => void }[];
  requiredFields?: string[]; // Campos obrigatórios para validação ao adicionar
}

export const EditableTable = ({
  data,
  columns,
  onUpdate,
  onDelete,
  onAdd,
  className = '',
  sortable = true,
  actions = [],
  requiredFields
}: EditableTableProps) => {
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [newRow, setNewRow] = useState<Record<string, any> | null>(null);
  const newRowRef = useRef<Record<string, any> | null>(null);
  
  // Sincronizar ref com state
  useEffect(() => {
    newRowRef.current = newRow;
  }, [newRow]);

  const handleSort = (columnId: string) => {
    if (!sortable) return;
    
    if (sortBy === columnId) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(columnId);
      setSortOrder('asc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortBy) return 0;
    
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    return sortOrder === 'asc' 
      ? (aValue > bValue ? 1 : -1)
      : (aValue < bValue ? 1 : -1);
  });

  const handleAddRow = () => {
    if (onAdd) {
      const initialRow = columns.reduce((acc, column) => {
        // Definir valores padrão baseados no tipo de coluna
        if (column.type === 'number') {
          acc[column.accessorKey] = 0;
        } else if (column.type === 'select' && column.options && column.options.length > 0) {
          acc[column.accessorKey] = column.options[0];
        } else if (column.accessorKey === 'date') {
          acc[column.accessorKey] = new Date().toISOString().split('T')[0];
        } else {
          acc[column.accessorKey] = '';
        }
        return acc;
      }, {} as Record<string, any>);
      
      // Adicionar linha temporária para edição
      setNewRow(initialRow);
    }
  };

  const handleSaveNewRow = () => {
    if (onAdd) {
      // Usar ref para obter o valor mais atualizado
      const currentRow = newRowRef.current || newRow;
      if (!currentRow) return;
      
      // Determinar campos obrigatórios: usar prop se fornecida, senão detectar automaticamente
      const fieldsToValidate = requiredFields || 
        // Detectar automaticamente: primeira coluna editável ou campos comuns
        (columns.length > 0 && columns[0].isEditable ? [columns[0].accessorKey] : []);
      
      // Validar campos obrigatórios antes de salvar
      const missingFields = fieldsToValidate.filter(field => {
        const value = currentRow[field];
        
        // Verificar se o campo está vazio
        if (value === null || value === undefined) return true;
        
        // Para strings, verificar se está vazia ou só tem espaços
        if (typeof value === 'string') {
          const trimmed = value.trim();
          if (trimmed === '') return true;
        }
        
        // Para números, permitir zero apenas para campos específicos (yield, expectedYield, etc)
        if (typeof value === 'number') {
          // Permitir zero para campos de rendimento
          if (value === 0 && (field === 'yield' || field === 'expectedYield' || field === 'harvestArea')) {
            return false; // Zero é válido para esses campos
          }
          // Para outros campos numéricos, zero pode ser inválido
          if (value === 0 && !['yield', 'expectedYield', 'harvestArea', 'quantity', 'amount'].includes(field)) {
            return true;
          }
        }
        
        return false;
      });

      if (missingFields.length > 0) {
        const fieldNames = missingFields.map(f => {
          const column = columns.find(c => c.accessorKey === f);
          return column ? column.header : f;
        }).join(', ');
        alert(`Por favor, preencha os campos obrigatórios: ${fieldNames}`);
        return;
      }

      onAdd(currentRow);
      setNewRow(null);
      newRowRef.current = null;
    }
  };

  const handleCancelNewRow = () => {
    setNewRow(null);
  };

  const handleUpdateNewRow = (columnId: string, value: any) => {
    if (newRow) {
      const updatedRow = { ...newRow, [columnId]: value };
      setNewRow(updatedRow);
      newRowRef.current = updatedRow; // Atualizar ref imediatamente
    }
  };

  const getRowClass = (row: Record<string, any>) => {
    if (row.status === 'critical') return 'bg-agri-danger/5 dark:bg-agri-danger/10';
    if (row.status === 'warning') return 'bg-agri-warning/5 dark:bg-agri-warning/10';
    return '';
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'Haute':
      case 'Élevée':
      case 'Urgente':
        return 'bg-red-100 text-red-800';
      case 'Moyenne':
        return 'bg-orange-100 text-orange-800';
      case 'Basse':
      case 'Faible':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`bg-card rounded-xl border overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted text-xs uppercase">
            <tr>
              {columns.map((column) => (
                <th 
                  key={column.id} 
                  className={`px-4 py-3 text-left ${column.width || ''}`}
                  style={{ width: column.width }}
                >
                  {sortable ? (
                    <button 
                      className="flex items-center" 
                      onClick={() => handleSort(column.accessorKey)}
                    >
                      {column.header}
                      {sortBy === column.accessorKey && (
                        <ChevronDown 
                          className={`h-4 w-4 ml-1 ${sortOrder === 'desc' ? 'transform rotate-180' : ''}`} 
                        />
                      )}
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              ))}
              {(onDelete || actions.length > 0) && (
                <th className="px-4 py-3 text-left w-24">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, rowIndex) => (
              <tr key={rowIndex} className={`border-t hover:bg-muted/30 ${getRowClass(row)}`}>
                {columns.map((column) => (
                  <td key={`${rowIndex}-${column.id}`} className="px-4 py-3">
                    {column.isEditable ? (
                      column.accessorKey === 'priority' ? (
                        <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getPriorityStyle(row[column.accessorKey])}`}>
                          <EditableField
                            value={row[column.accessorKey]}
                            type={column.type as 'text' | 'number' | 'date' | 'select'}
                            options={column.options?.map(opt => ({ value: opt, label: opt }))}
                            onSave={(value) => onUpdate(rowIndex, column.accessorKey, value)}
                          />
                        </div>
                      ) : (
                        <EditableField
                          value={row[column.accessorKey]}
                          type={column.type as 'text' | 'number' | 'date' | 'select'}
                          options={column.options?.map(opt => ({ value: opt, label: opt }))}
                          onSave={(value) => onUpdate(rowIndex, column.accessorKey, value)}
                        />
                      )
                    ) : column.accessorKey === 'priority' ? (
                      <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getPriorityStyle(row[column.accessorKey])}`}>
                        {row[column.accessorKey]}
                      </div>
                    ) : (
                      row[column.accessorKey]
                    )}
                  </td>
                ))}
                {(onDelete || actions.length > 0) && (
                  <td className="px-4 py-3">
                    <div className="flex space-x-1">
                      {actions.map((action, index) => (
                        <button 
                          key={index}
                          onClick={() => action.onClick(rowIndex)}
                          className="p-1.5 hover:bg-muted rounded"
                          title={action.label}
                        >
                          {action.icon}
                        </button>
                      ))}
                      {onDelete && (
                        <button 
                          onClick={() => onDelete(rowIndex)}
                          className="p-1.5 hover:bg-agri-danger/10 text-agri-danger rounded"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
            {newRow && (
              <tr className="border-t bg-muted/20">
                {columns.map((column) => (
                  <td key={`new-${column.id}`} className="px-4 py-3">
                    {column.isEditable ? (
                      <EditableField
                        value={newRow[column.accessorKey] || ''}
                        type={column.type as 'text' | 'number' | 'date' | 'select'}
                        options={column.options?.map(opt => ({ value: opt, label: opt }))}
                        onSave={(value) => handleUpdateNewRow(column.accessorKey, value)}
                      />
                    ) : (
                      newRow[column.accessorKey] || ''
                    )}
                  </td>
                ))}
                <td className="px-4 py-3">
                  <div className="flex space-x-1">
                    <button
                      onClick={handleSaveNewRow}
                      className="p-1.5 hover:bg-green-100 text-green-600 rounded"
                      title="Salvar"
                    >
                      <Save className="h-4 w-4" />
                    </button>
                    <button
                      onClick={handleCancelNewRow}
                      className="p-1.5 hover:bg-red-100 text-red-600 rounded"
                      title="Cancelar"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            )}
            {data.length === 0 && !newRow && (
              <tr>
                <td colSpan={columns.length + ((onDelete || actions.length > 0) ? 1 : 0)} className="px-4 py-4 text-center text-muted-foreground">
                  Nenhum dado disponível
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {onAdd && !newRow && (
        <div className="p-4 border-t">
          <button 
            onClick={handleAddRow}
            className="flex items-center px-4 py-2 text-sm bg-agri-primary text-white rounded-lg hover:bg-agri-primary-dark"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar linha
          </button>
        </div>
      )}
    </div>
  );
};
