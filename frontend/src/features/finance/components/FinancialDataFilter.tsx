
import React from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';

interface FinancialDataFilterProps {
  periodFilter: string;
  setPeriodFilter: (value: string) => void;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  dateRange?: DateRange;
  setDateRange?: (dateRange: DateRange | undefined) => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  categories: string[];
}

const FinancialDataFilter = ({
  periodFilter,
  setPeriodFilter,
  categoryFilter,
  setCategoryFilter,
  dateRange,
  setDateRange,
  searchTerm,
  setSearchTerm,
  categories
}: FinancialDataFilterProps) => {
  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <div className="relative flex-grow max-w-sm">
        <Input
          placeholder="Pesquisar transações..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>
      
      <Select value={periodFilter} onValueChange={setPeriodFilter}>
        <SelectTrigger className="w-[180px]">
          <Calendar className="h-4 w-4 mr-2" />
          <SelectValue placeholder="Período" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os períodos</SelectItem>
          <SelectItem value="today">Hoje</SelectItem>
          <SelectItem value="week">Esta semana</SelectItem>
          <SelectItem value="month">Este mês</SelectItem>
          <SelectItem value="quarter">Este trimestre</SelectItem>
          <SelectItem value="year">Este ano</SelectItem>
        </SelectContent>
      </Select>
      
      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
        <SelectTrigger className="w-[180px]">
          <Filter className="h-4 w-4 mr-2" />
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as categorias</SelectItem>
          {categories.map(category => (
            <SelectItem key={category} value={category}>{category}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {setDateRange && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex gap-2">
              <Calendar className="h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, 'dd/MM/yyyy')} - {format(dateRange.to, 'dd/MM/yyyy')}
                  </>
                ) : (
                  format(dateRange.from, 'dd/MM/yyyy')
                )
              ) : (
                "Selecionar datas"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
              locale={fr}
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};

export default FinancialDataFilter;
