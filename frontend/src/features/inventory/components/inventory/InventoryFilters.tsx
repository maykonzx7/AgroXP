
import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface InventoryFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  categories: string[];
  sortBy: string;
  setSortBy: (field: string) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;
  className?: string;
}

const InventoryFilters = ({
  searchTerm,
  setSearchTerm,
  categoryFilter,
  setCategoryFilter,
  categories,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  className = ''
}: InventoryFiltersProps) => {
  
  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };
  
  return (
    <div className={`flex flex-col md:flex-row gap-3 ${className}`}>
      <div className="relative flex-grow">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          type="text" 
          placeholder="Pesquisar um item..." 
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="flex gap-3">
        <div className="relative">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Todas as categorias" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category === 'all' ? 'Todas as categorias' : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <span>Ordenar</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => toggleSort('name')} className="flex justify-between">
              <span>Nome</span>
              {sortBy === 'name' && (
                <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toggleSort('quantity')} className="flex justify-between">
              <span>Quantidade</span>
              {sortBy === 'quantity' && (
                <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toggleSort('price')} className="flex justify-between">
              <span>Preço</span>
              {sortBy === 'price' && (
                <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toggleSort('lastUpdated')} className="flex justify-between">
              <span>Data de atualização</span>
              {sortBy === 'lastUpdated' && (
                <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default InventoryFilters;
