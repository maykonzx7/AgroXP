import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Search } from 'lucide-react';

interface SearchAndFilterOrganismProps {
  onSearch: (term: string) => void;
  filters?: { label: string; value: string }[];
  onFilterChange?: (filter: string) => void;
  searchPlaceholder?: string;
}

// Componente de busca e filtros
const SearchAndFilterOrganism: React.FC<SearchAndFilterOrganismProps> = ({
  onSearch,
  filters,
  onFilterChange,
  searchPlaceholder = 'Buscar...'
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    onSearch(term);
  };

  return (
    <Card className="p-4 mb-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <Label htmlFor="search">Buscar</Label>
          <div className="relative mt-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={handleSearch}
              className="pl-8"
            />
          </div>
        </div>
        
        {filters && filters.length > 0 && (
          <div>
            <Label>Filtros</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {filters.map((filter, index) => (
                <Button
                  key={index}
                  variant={filter.value === 'active' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onFilterChange?.(filter.value)}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default SearchAndFilterOrganism;