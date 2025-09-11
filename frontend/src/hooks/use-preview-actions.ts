
import { useState } from 'react';
import { useCRM } from '@/contexts/CRMContext';
import { useAppSettings } from '@/contexts/AppSettingsContext';
import { generatePreviewHTML } from '@/utils/preview-generator';
import { toast } from 'sonner';

interface UsePreviewActionsProps {
  data: any[];
  moduleName: string;
  columns?: { key: string, header: string }[];
  title?: string;
}

export const usePreviewActions = ({ 
  data, 
  moduleName, 
  columns, 
  title 
}: UsePreviewActionsProps) => {
  const { printModuleData, exportModuleData } = useCRM();
  const { settings } = useAppSettings();
  const [isActionInProgress, setIsActionInProgress] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewHTML, setPreviewHTML] = useState<string>('');

  const handlePrint = async () => {
    if (!data || data.length === 0) {
      toast.error("Nenhuma data para imprimir", {
        description: "Por favor, verifique seus filtros ou selecione outro período."
      });
      return;
    }

    setIsActionInProgress(true);
    
    try {
      await printModuleData(moduleName, {
        columns: columns,
        title: title || `Visualização - ${moduleName}`
      });
      toast.success("Documento enviado para impressão", {
        description: "Seu documento foi enviado para a impressora."
      });
    } catch (error) {
      console.error("Erro durante a impressão:", error);
      toast.error("Erro de impressão", {
        description: "Ocorreu um erro ao imprimir o documento."
      });
    } finally {
      setIsActionInProgress(false);
    }
  };

  const handleShowPreview = () => {
    if (!data || data.length === 0) {
      toast.error("Nenhuma data para exibir", {
        description: "Por favor, verifique seus filtros ou selecione outro período."
      });
      return;
    }
    
    const html = generatePreviewHTML(data, moduleName, title, columns, settings.locale);
    setPreviewHTML(html);
    setPreviewOpen(true);
  };

  const handleExportPDF = async () => {
    if (!data || data.length === 0) {
      toast.error("Nenhuma data para exportar", {
        description: "Por favor, verifique seus filtros ou selecione outro período."
      });
      return;
    }

    setIsActionInProgress(true);
    
    try {
      await exportModuleData(moduleName, 'pdf', data, {
        title: title || `Relatório - ${moduleName}`,
        columns: columns
      });
      toast.success("PDF gerado com sucesso", {
        description: "O documento foi baixado."
      });
    } catch (error) {
      console.error("Erro ao gerar o PDF:", error);
      toast.error("Erro de exportação", {
        description: "Ocorreu um erro ao gerar o PDF."
      });
    } finally {
      setIsActionInProgress(false);
    }
  };

  return {
    isActionInProgress,
    previewOpen,
    setPreviewOpen,
    previewHTML,
    handlePrint,
    handleShowPreview,
    handleExportPDF
  };
};
