import React from 'react';
import { Plus } from 'lucide-react';

const TestHeaderLayout = () => {
  return (
    <div className="p-6">
      {/* Header section - Test version */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Teste de Layout de Cabeçalho</h1>
          <p className="text-muted-foreground">Verificando alinhamento dos elementos</p>
        </div>
        <button 
          className="inline-flex items-center justify-center px-4 py-2 bg-agri-primary text-white rounded-lg hover:bg-agri-primary-dark transition-colors whitespace-nowrap"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar item
        </button>
      </div>
      
      <div className="border rounded-lg p-4 bg-muted">
        <p>Conteúdo de teste abaixo do cabeçalho</p>
      </div>
    </div>
  );
};

export default TestHeaderLayout;