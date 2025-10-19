import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { exportModuleData } from '@/utils/dataExportUtils';

interface TechnicalSheetButtonProps {
  data: any[];
  moduleName: string;
  title: string;
  columns: { key: string; header: string }[];
}

const TechnicalSheetButton: React.FC<TechnicalSheetButtonProps> = ({ 
  data, 
  moduleName, 
  title,
  columns
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateTechnicalSheet = async () => {
    setIsGenerating(true);
    try {
      // In a real application, you would generate a technical sheet here
      // For now, we'll just export the data as a PDF
      const success = await exportModuleData(moduleName, 'pdf', data);
      
      if (success) {
        // Technical sheet generated successfully
      }
    } catch (error) {
      console.error("Error generating technical sheet:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button 
      onClick={handleGenerateTechnicalSheet}
      disabled={isGenerating}
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
    >
      <Download className="h-4 w-4" />
      {isGenerating ? 'Generating...' : 'Technical Sheet'}
    </Button>
  );
};

export default TechnicalSheetButton;