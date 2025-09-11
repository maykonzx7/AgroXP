
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { toast } from 'sonner';

// Definir os tipos para os dados estatísticos
interface YieldData {
  name: string;
  current: number;
  previous: number;
  unit: string;
}

interface ParcelData {
  name: string;
  profitability: number;
  size: number;
  crop: string;
}

interface FinancialData {
  revenue: number;
  expenses: number;
  profit: number;
  month: string;
}

interface EnvironmentalData {
  temperature: number;
  humidity: number;
  rainfall: number;
  month: string;
}

interface StatisticsContextProps {
  yieldData: YieldData[];
  parcelData: ParcelData[];
  financialData: {
    revenueByMonth: FinancialData[];
    profitabilityByParcel: { name: string; profitability: number; size: number; crop: string }[];
  };
  environmentalData: {
    indicators: { indicator: string; current: number; target: number; trend: string; status: string }[];
    climateData: EnvironmentalData[];
  };
  period: string;
  setPeriod: (period: string) => void;
  updateDataWithFilters: (newPeriod: string, cropFilter: string) => void;
  exportModuleData: (moduleName: string, format: string, data?: any) => Promise<boolean>;
}

// Criar o contexto com valores iniciais vazios
const StatisticsContext = createContext<StatisticsContextProps>({
  yieldData: [],
  parcelData: [],
  financialData: {
    revenueByMonth: [],
    profitabilityByParcel: []
  },
  environmentalData: {
    indicators: [],
    climateData: []
  },
  period: 'year',
  setPeriod: () => {},
  updateDataWithFilters: () => {},
  exportModuleData: async () => false
});

// Dados de rendimento inicial (simulados)
const initialYieldData: YieldData[] = [
  { name: 'Cana-de-açúcar', current: 85, previous: 75, unit: 't/ha' },
  { name: 'Banana', current: 32, previous: 30, unit: 't/ha' },
  { name: 'Abacaxi', current: 45, previous: 48, unit: 't/ha' },
  { name: 'Inhame', current: 18, previous: 15, unit: 't/ha' },
  { name: 'Taioba', current: 22, previous: 20, unit: 't/ha' }
];

// Dados das parcelas (simulados)
const initialParcelData: ParcelData[] = [
  { name: 'Parcelle Nord', profitability: 1250, size: 12.5, crop: 'Cana-de-açúcar' },
  { name: 'Parcelle Est', profitability: 980, size: 8.3, crop: 'Banana' },
  { name: 'Parcelle Sud', profitability: 1580, size: 15.7, crop: 'Abacaxi' },
  { name: 'Parcelle Ouest', profitability: 850, size: 10.2, crop: 'Inhame' },
  { name: 'Parcelle Centrale', profitability: 920, size: 6.8, crop: 'Taioba' }
];

// Dados financeiros (simulados)
const initialRevenueData = [
  { month: 'Jan', revenue: 15450, expenses: 12300, profit: 3150 },
  { month: 'Fev', revenue: 16200, expenses: 12800, profit: 3400 },
  { month: 'Mar', revenue: 17800, expenses: 13500, profit: 4300 },
  { month: 'Abr', revenue: 19500, expenses: 14200, profit: 5300 },
  { month: 'Mai', revenue: 21200, expenses: 15100, profit: 6100 },
  { month: 'Jun', revenue: 22800, expenses: 15800, profit: 7000 },
  { month: 'Jul', revenue: 24500, expenses: 16500, profit: 8000 },
  { month: 'Ago', revenue: 26200, expenses: 17200, profit: 9000 },
  { month: 'Set', revenue: 27800, expenses: 17800, profit: 10000 },
  { month: 'Out', revenue: 29500, expenses: 18500, profit: 11000 },
  { month: 'Nov', revenue: 31200, expenses: 19200, profit: 12000 },
  { month: 'Dez', revenue: 32800, expenses: 19800, profit: 13000 }
];

// Dados ambientais (simulados)
const initialClimateData = [
  { month: 'Jan', temperature: 28.5, humidity: 78, rainfall: 120 },
  { month: 'Fev', temperature: 29.2, humidity: 75, rainfall: 95 },
  { month: 'Mar', temperature: 30.1, humidity: 72, rainfall: 80 },
  { month: 'Abr', temperature: 31.5, humidity: 70, rainfall: 65 },
  { month: 'Mai', temperature: 32.8, humidity: 68, rainfall: 45 },
  { month: 'Jun', temperature: 33.2, humidity: 65, rainfall: 35 },
  { month: 'Jul', temperature: 33.5, humidity: 63, rainfall: 25 },
  { month: 'Ago', temperature: 33.1, humidity: 64, rainfall: 30 },
  { month: 'Set', temperature: 32.2, humidity: 67, rainfall: 50 },
  { month: 'Out', temperature: 31.0, humidity: 71, rainfall: 75 },
  { month: 'Nov', temperature: 29.8, humidity: 74, rainfall: 100 },
  { month: 'Dez', temperature: 29.1, humidity: 77, rainfall: 115 }
];

// Dados dos indicadores ambientais
const initialEnvironmentalIndicators = [
  { indicator: 'Carbono no solo', current: 2.8, target: 3.2, trend: '+0.2', status: 'Melhorando' },
  { indicator: 'pH do solo', current: 6.5, target: 6.8, trend: '+0.1', status: 'Estável' },
  { indicator: 'Matéria orgânica', current: 4.2, target: 5.0, trend: '+0.3', status: 'Melhorando' },
  { indicator: 'Biodiversidade', current: 75, target: 80, trend: '+2', status: 'Melhorando' },
  { indicator: 'Eficiência hídrica', current: 82, target: 85, trend: '+1', status: 'Estável' }
];

interface StatisticsProviderProps {
  children: ReactNode;
}

export const StatisticsProvider: React.FC<StatisticsProviderProps> = ({ children }) => {
  const [yieldData, setYieldData] = useState<YieldData[]>(initialYieldData);
  const [parcelData, setParcelData] = useState<ParcelData[]>(initialParcelData);
  const [climateData] = useState<EnvironmentalData[]>(initialClimateData);
  const [environmentalIndicators] = useState(initialEnvironmentalIndicators);
  const [period, setPeriod] = useState<string>('year');
  
  // Atualizar os dados com base nos filtros
  const updateDataWithFilters = (newPeriod: string, cropFilter: string) => {
    setPeriod(newPeriod);
    console.log(`Atualização dos dados estatísticos para o período: ${newPeriod}, cultura: ${cropFilter}`);
    
    // Em uma aplicação real, isso faria uma chamada à API para buscar dados filtrados
    // Por enquanto, estamos apenas simulando
    if (cropFilter && cropFilter !== 'all') {
      // Filtrar os dados pela cultura selecionada
      const filteredYieldData = initialYieldData.filter(item => item.name === cropFilter);
      setYieldData(filteredYieldData);
      
      const filteredParcelData = initialParcelData.filter(item => item.crop === cropFilter);
      setParcelData(filteredParcelData);
    } else {
      // Mostrar todos os dados
      setYieldData(initialYieldData);
      setParcelData(initialParcelData);
    }
  };

  // Exportar dados do módulo (simulação)
  const exportModuleData = async (moduleName: string, format: string, data?: any): Promise<boolean> => {
    console.log(`Exportação do módulo ${moduleName} no formato ${format} solicitada`);
    
    // Simular um pequeno atraso para parecer uma operação assíncrona
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Em uma aplicação real, isso faria a exportação real dos dados
    toast.success(`Exportação concluída`, {
      description: `Os dados do módulo ${moduleName} foram exportados no formato ${format.toUpperCase()}`
    });
    
    return true;
  };

  // Dados financeiros calculados
  const financialData = {
    revenueByMonth: initialRevenueData,
    profitabilityByParcel: parcelData.map(parcel => ({
      name: parcel.name,
      profitability: parcel.profitability,
      size: parcel.size,
      crop: parcel.crop
    }))
  };

  // Dados ambientais
  const environmentalData = {
    indicators: environmentalIndicators,
    climateData: climateData
  };

  return (
    <StatisticsContext.Provider 
      value={{ 
        yieldData,
        parcelData,
        financialData,
        environmentalData,
        period,
        setPeriod,
        updateDataWithFilters,
        exportModuleData
      }}
    >
      {children}
    </StatisticsContext.Provider>
  );
};

// Hook personalizado para usar o contexto
export const useStatistics = (): StatisticsContextProps => {
  const context = useContext(StatisticsContext);
  
  if (!context) {
    throw new Error('useStatistics deve ser usado dentro de um StatisticsProvider');
  }
  
  return context;
};
