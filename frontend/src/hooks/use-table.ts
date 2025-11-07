import { useState, useMemo, useCallback } from 'react';

// Interface para as colunas da tabela
export interface TableColumn<T> {
  key: keyof T;
  header: string;
  sortable?: boolean;
  searchable?: boolean;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  className?: string;
}

// Interface para as opções do hook
export interface UseTableOptions<T> {
  data: T[];
  columns: TableColumn<T>[];
  initialSort?: { key: keyof T; direction: 'asc' | 'desc' };
  initialPageSize?: number;
  enablePagination?: boolean;
  enableSearch?: boolean;
  enableSorting?: boolean;
  enableSelection?: boolean;
  searchFields?: (keyof T)[];
}

// Hook para gerenciamento de tabelas
export const useTable = <T extends Record<string, any>>({
  data,
  columns,
  initialSort = { key: columns[0]?.key, direction: 'asc' } as { key: keyof T; direction: 'asc' | 'desc' },
  initialPageSize = 10,
  enablePagination = true,
  enableSearch = true,
  enableSorting = true,
  enableSelection = false,
  searchFields = [],
}: UseTableOptions<T>) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState(initialSort);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRows, setSelectedRows] = useState<(string | number)[]>([]);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Filtrar dados com base no termo de busca
  const filteredData = useMemo(() => {
    if (!enableSearch || !searchTerm) return data;

    const term = searchTerm.toLowerCase();
    return data.filter(row => {
      if (searchFields.length > 0) {
        // Buscar apenas nos campos especificados
        return searchFields.some(field => {
          const value = row[field];
          return String(value).toLowerCase().includes(term);
        });
      } else {
        // Buscar em todos os campos das colunas
        return columns.some(column => {
          const value = row[column.key];
          return String(value).toLowerCase().includes(term);
        });
      }
    });
  }, [data, searchTerm, columns, enableSearch, searchFields]);

  // Ordenar dados
  const sortedData = useMemo(() => {
    if (!enableSorting) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig, enableSorting]);

  // Paginar dados
  const paginatedData = useMemo(() => {
    if (!enablePagination) return sortedData;

    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize, enablePagination]);

  // Manipular ordenação
  const handleSort = useCallback((key: keyof T) => {
    if (!enableSorting) return;

    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  }, [enableSorting]);

  // Manipular seleção de linha
  const toggleRowSelection = useCallback((id: string | number) => {
    if (!enableSelection) return;

    setSelectedRows(prev => 
      prev.includes(id) 
        ? prev.filter(rowId => rowId !== id) 
        : [...prev, id]
    );
  }, [enableSelection]);

  // Selecionar todas as linhas
  const toggleSelectAll = useCallback(() => {
    if (!enableSelection) return;

    if (selectedRows.length === paginatedData.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(paginatedData.map(row => row.id || row[columns[0].key]));
    }
  }, [selectedRows.length, paginatedData, columns, enableSelection]);

  // Manipular página atual
  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, []);

  // Calcular total de páginas
  const totalPages = useMemo(() => {
    if (!enablePagination) return 1;
    return Math.ceil(sortedData.length / pageSize);
  }, [sortedData.length, pageSize, enablePagination]);

  // Obter colunas ordenáveis
  const sortableColumns = useMemo(() => 
    columns.filter(col => col.sortable !== false), 
    [columns]
  );

  return {
    // Dados e paginação
    data: paginatedData,
    allData: sortedData,
    filteredData,
    totalCount: sortedData.length,
    
    // Configurações de paginação
    currentPage,
    totalPages,
    pageSize,
    setPageSize,
    goToPage,
    
    // Configurações de ordenação
    sortConfig,
    handleSort,
    sortableColumns,
    
    // Configurações de busca
    searchTerm,
    setSearchTerm,
    
    // Configurações de seleção
    selectedRows,
    toggleRowSelection,
    toggleSelectAll,
    isAllSelected: selectedRows.length > 0 && selectedRows.length === paginatedData.length,
    
    // Estados
    enablePagination,
    enableSearch,
    enableSorting,
    enableSelection,
  };
};

export default useTable;