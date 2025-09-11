import React, { useState } from 'react';
import { Download, Printer, Share2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useCRM } from '../../contexts/CRMContext';
import ReportGenerationButton from '../common/ReportGenerationButton';
import { useIsMobile } from '@/hooks/use-mobile';
import PreviewPrintButton from '../common/PreviewPrintButton';
import { useStatistics } from '@/contexts/StatisticsContext';

const StatisticsHeader = () => {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const { exportModuleData, printModuleData, getModuleData } = useCRM();
  const { yieldData, financialData, environmentalData } = useStatistics();
  const isMobile = useIsMobile();
  
  // Combinar todos os dados estatísticos para visualização/impressão
  const statisticsData = [
    ...(yieldData || []).map(item => ({ ...item, type: 'rendimento' })),
    ...(financialData.profitabilityByParcel || []).map(item => ({ ...item, type: 'financeiro' })),
    ...(environmentalData.indicators || []).map(item => ({ ...item, type: 'ambiental' }))
  ];

  const handleExport = async () => {
    try {
      console.log("Exportando as estatísticas no formato CSV...");
      await exportModuleData('estatisticas', 'csv');
      console.log("Exportação bem-sucedida!");
    } catch (error) {
      console.error("Erro ao exportar estatísticas:", error);
    }
  };

  const handlePrint = async () => {
    try {
      console.log("Preparando a impressão das estatísticas...");
      await printModuleData('estatisticas');
      console.log("Documento enviado para impressão");
    } catch (error) {
      console.error("Erro ao imprimir estatísticas:", error);
    }
  };

  const handleShare = () => {
    setShareDialogOpen(true);
    console.log("Abrindo a caixa de diálogo de compartilhamento");
  };
  
  const handleShareByEmail = () => {
    console.log("Preparando o compartilhamento por e-mail...");
    setShareDialogOpen(false);
    console.log("E-mail de compartilhamento preparado");
  };
  
  const handleShareByPDF = async () => {
    try {
      console.log("Gerando o PDF para compartilhamento...");
      await exportModuleData('estatisticas', 'pdf');
      setShareDialogOpen(false);
      console.log("PDF gerado com sucesso para compartilhamento");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      setShareDialogOpen(false);
    }
  };

  return (
    <header className="flex flex-col mb-6 gap-4">
      <div>
        <h1 className="text-xl md:text-2xl font-bold mb-1 text-gray-800">Estatísticas e Análises</h1>
        <p className="text-sm md:text-base text-gray-500">Visualize e analise os dados da sua propriedade</p>
      </div>
      <div className="flex flex-wrap gap-2 md:gap-3 justify-start md:justify-end">
        <ReportGenerationButton 
          moduleName="estatisticas" 
          className="bg-green-600 hover:bg-green-700 text-white text-xs md:text-sm px-2 md:px-4 py-1.5 md:py-2"
          withAnimation={false}
        />
        
        {!isMobile ? (
          <>
            <PreviewPrintButton 
              data={statisticsData}
              moduleName="estatisticas"
              title="Estatísticas e Análises"
              className="bg-white border-gray-200 hover:bg-gray-50 text-xs md:text-sm h-auto py-1.5 md:py-2"
              variant="outline"
              columns={[
                { key: "type", header: "Tipo" },
                { key: "name", header: "Nome" },
                { key: "current", header: "Valor atual" },
                { key: "previous", header: "Valor anterior" },
                { key: "unit", header: "Unidade" }
              ]}
            />
            
            <Button 
              variant="outline" 
              onClick={handleExport}
              className="bg-white border-gray-200 hover:bg-gray-50 text-xs md:text-sm h-auto py-1.5 md:py-2"
              size={isMobile ? "sm" : "default"}
            >
              <Download className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1.5 md:mr-2 text-gray-600" />
              {isMobile ? "CSV" : "Exportar CSV"}
            </Button>
          </>
        ) : null}
        <Button 
          variant="outline" 
          onClick={handleShare}
          className="bg-white border-gray-200 hover:bg-gray-50 text-xs md:text-sm h-auto py-1.5 md:py-2"
          size={isMobile ? "sm" : "default"}
        >
          <Share2 className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1.5 md:mr-2 text-gray-600" />
          {isMobile ? "Compartilhar" : "Compartilhar"}
        </Button>
      </div>
      
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md max-w-[90%]">
          <DialogHeader>
            <DialogTitle>Compartilhar estatísticas</DialogTitle>
            <DialogDescription>
              Escolha como deseja compartilhar essas estatísticas
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <Button onClick={handleShareByEmail} variant="outline">
                Enviar por e-mail
              </Button>
              <Button onClick={handleShareByPDF} className="bg-green-600 hover:bg-green-700">
                Gerar PDF
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShareDialogOpen(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default StatisticsHeader;