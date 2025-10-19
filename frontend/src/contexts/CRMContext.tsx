
import React, { createContext, useContext, ReactNode } from 'react';
import useCRMContext from '../hooks/use-crm-context';

// Definição do tipo para o contexto CRM
export interface CRMContextType {
  lastSync: Date;
  isRefreshing: boolean;
  companyName: string;
  activeModules: string[];
  syncDataAcrossCRM: () => void;
  updateModuleData: (moduleName: string, data: any) => void;
  getModuleData: (moduleName: string) => any;
  exportModuleData: (moduleName: string, format: 'csv' | 'excel' | 'pdf', customData?: any[]) => Promise<boolean>;
  importModuleData: (moduleName: string, file: File) => Promise<boolean>;
  printModuleData: (moduleName: string, options?: any) => Promise<boolean>;
  // Novos métodos para operações genéricas
  addData: <T>(moduleName: string, item: T) => Promise<void>;
  updateData: <T>(moduleName: string, id: string | number, updates: Partial<T>) => Promise<void>;
  deleteData: (moduleName: string, id: string | number) => Promise<void>;
  findData: <T>(moduleName: string, id: string | number) => T | undefined;
  filterData: <T>(moduleName: string, predicate: (item: T) => boolean) => T[];
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

// Props para o provider
interface CRMProviderProps {
  children: ReactNode;
}

// Provider que envolve nossa aplicação
export const CRMProvider: React.FC<CRMProviderProps> = ({ children }) => {
  const crmContext = useCRMContext();
  
  return (
    <CRMContext.Provider value={crmContext}>
      {children}
    </CRMContext.Provider>
  );
};

// Hook personalizado para usar o contexto
export const useCRM = () => {
  const context = useContext(CRMContext);
  
  if (context === undefined) {
    throw new Error('useCRM deve ser usado dentro de um CRMProvider');
  }
  
  return context;
};

export default CRMContext;
