import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Loader2, Download, Eye, Printer } from 'lucide-react';
import { useCRM } from '../../contexts/CRMContext';
import { useAppSettings } from '@/contexts/AppSettingsContext';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import PreviewContainer from './PreviewContainer.en';

interface TechnicalSheetButtonProps {
  data: any;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  children?: React.ReactNode;
  size?: "default" | "sm" | "lg" | "icon";
}

const TechnicalSheetButton: React.FC<TechnicalSheetButtonProps> = ({ 
  data, 
  className = "",
  variant = "default",
  children,
  size = "default"
}) => {
  const { exportModuleData } = useCRM();
  const { settings } = useAppSettings();
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewHTML, setPreviewHTML] = useState<string>('');
  
  // Format data for the technical sheet
  const formatTechSheetData = () => {
    if (!data || Object.keys(data).length === 0) {
      console.error("Insufficient data to generate technical sheet");
      return null;
    }
    
    return [{
      name: data.name || data.nom || "Not specified",
      scientificName: data.scientificName || data.nomScientifique || "Not specified",
      family: data.family || data.famille || "Not specified",
      origin: data.origin || data.origine || "Not specified",
      growingSeason: data.growingSeason || data.saisonCulture || "Not specified",
      soilType: data.soilType || data.typeSol || "Not specified",
      waterNeeds: data.waterNeeds || data.besoinEau || "Not specified",
      fertilization: data.fertilization || data.fertilisation || "Not specified",
      pests: data.pests || data.ravageurs || "Not specified",
      diseases: data.diseases || data.maladies || "Not specified",
      notes: data.notes || "No observations",
      type: data.type || "Not specified",
      harvestPeriod: data.harvestPeriod || data.periodeRecolte || "Not specified",
      yieldPerHectare: data.yieldPerHectare || data.rendementHectare || data.currentYield || "Not specified"
    }];
  };
  
  const downloadTechnicalSheet = async () => {
    const techSheetData = formatTechSheetData();
    if (!techSheetData) return;

    setIsGenerating(true);
    
    try {
      await exportModuleData('technical_sheet', 'pdf', techSheetData);
      console.log("Technical sheet generated successfully");
    } catch (error) {
      console.error("Error generating technical sheet:", error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const generatePreviewHTML = () => {
    const techSheetData = formatTechSheetData();
    if (!techSheetData) return '';
    
    const item = techSheetData[0];
    const isDarkMode = settings.darkMode;
    
    return `
      <div class="technical-sheet">
        <div class="technical-sheet-header text-center mb-8">
          <h1 class="text-2xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-700'}">${item.name}</h1>
          <p class="italic">${item.scientificName}</p>
        </div>
        
        <div class="section mb-6">
          <h2 class="text-lg font-semibold ${isDarkMode ? 'text-blue-400' : 'text-blue-800'} border-b pb-2 mb-4">General Information</h2>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <span class="font-medium">Family:</span>
              ${item.family}
            </div>
            <div>
              <span class="font-medium">Origin:</span>
              ${item.origin}
            </div>
            <div>
              <span class="font-medium">Type:</span>
              ${item.type}
            </div>
            <div>
              <span class="font-medium">Growing Season:</span>
              ${item.growingSeason}
            </div>
          </div>
        </div>
        
        <div class="section mb-6">
          <h2 class="text-lg font-semibold ${isDarkMode ? 'text-blue-400' : 'text-blue-800'} border-b pb-2 mb-4">Growing Conditions</h2>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <span class="font-medium">Soil Type:</span>
              ${item.soilType}
            </div>
            <div>
              <span class="font-medium">Water Needs:</span>
              ${item.waterNeeds}
            </div>
            <div>
              <span class="font-medium">Fertilization:</span>
              ${item.fertilization}
            </div>
            <div>
              <span class="font-medium">Harvest Period:</span>
              ${item.harvestPeriod}
            </div>
            <div>
              <span class="font-medium">Yield per Hectare:</span>
              ${item.yieldPerHectare}
            </div>
          </div>
        </div>
        
        <div class="section mb-6">
          <h2 class="text-lg font-semibold ${isDarkMode ? 'text-blue-400' : 'text-blue-800'} border-b pb-2 mb-4">Phytosanitary Issues</h2>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <span class="font-medium">Pests:</span>
              ${item.pests}
            </div>
            <div>
              <span class="font-medium">Diseases:</span>
              ${item.diseases}
            </div>
          </div>
        </div>
        
        <div class="section mb-6">
          <h2 class="text-lg font-semibold ${isDarkMode ? 'text-blue-400' : 'text-blue-800'} border-b pb-2 mb-4">Notes</h2>
          <div class="${isDarkMode ? 'bg-card' : 'bg-background'} p-4 rounded-md">
            ${item.notes}
          </div>
        </div>
      </div>
    `;
  };
  
  const handleShowPreview = () => {
    setPreviewHTML(generatePreviewHTML());
    setPreviewOpen(true);
  };
  
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const isDarkMode = settings.darkMode;
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Technical Sheet - ${data.name || data.nom || 'Crop'}</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              :root {
                --font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                --primary-color: ${isDarkMode ? '#8BADE3' : '#4CAF50'};
                --border-color: ${isDarkMode ? '#3A3A3A' : '#e5e7eb'};
                --bg-color: ${isDarkMode ? '#1F1F1F' : '#ffffff'};
                --text-color: ${isDarkMode ? '#E1E1E1' : '#333333'};
                --muted-color: ${isDarkMode ? '#A0A0A0' : '#6B7280'};
                --header-bg: ${isDarkMode ? '#2D2D2D' : '#F9FAFB'};
              }
              
              body { 
                font-family: var(--font-family);
                margin: 0; 
                padding: 20px;
                background-color: var(--bg-color);
                color: var(--text-color);
              }
              
              .technical-sheet {
                max-width: 800px;
                margin: 0 auto;
                background-color: var(--bg-color);
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
              }
              
              h1 { color: var(--primary-color); margin-top: 0; }
              
              h2 { 
                color: ${isDarkMode ? '#4B96E6' : '#1565c0'}; 
                border-bottom: 1px solid var(--border-color); 
                padding-bottom: 5px;
              }
              
              .section { margin-bottom: 20px; }
              
              .grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 15px;
              }
              
              .font-medium { font-weight: bold; }
              
              .bg-gray-50 { 
                background-color: ${isDarkMode ? '#2A2A2A' : '#f9f9f9'}; 
                padding: 15px; 
                border-radius: 5px;
              }
              
              @media print {
                body { background-color: white; }
                .technical-sheet { box-shadow: none; }
              }
            </style>
          </head>
          <body>
            <div class="technical-sheet">
              ${generatePreviewHTML()}
              
              <div class="footer text-center text-sm text-muted-color mt-8">
                <p>Technical sheet generated on ${new Date().toLocaleDateString(settings.locale)}</p>
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 1000);
    }
  };
  
  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={variant}
                  size={size}
                                    className={className || `bg-primary hover:bg-primary/90 text-primary-foreground`}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : children || (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Download Technical Sheet
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-background border shadow-lg">
                <DropdownMenuItem onClick={handleShowPreview} className="cursor-pointer">
                  <Eye className="mr-2 h-4 w-4" />
                  <span>Preview</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handlePrint} className="cursor-pointer">
                  <Printer className="mr-2 h-4 w-4" />
                  <span>Print</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={downloadTechnicalSheet} className="cursor-pointer">
                  <Download className="mr-2 h-4 w-4" />
                  <span>Download PDF</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TooltipTrigger>
          <TooltipContent className="bg-background border shadow-lg">
            <p>Generate a detailed technical sheet</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Technical Sheet - {data?.name || data?.nom || 'Crop'}</DialogTitle>
            <DialogDescription>
              Technical sheet preview
            </DialogDescription>
          </DialogHeader>
          <div className="flex-grow overflow-auto border rounded-md mt-4 bg-background">
            <iframe
              srcDoc={`
                <!DOCTYPE html>
                <html>
                  <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                      :root {
                        --font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                        --primary-color: ${settings.darkMode ? '#8BADE3' : '#4CAF50'};
                        --border-color: ${settings.darkMode ? '#3A3A3A' : '#e5e7eb'};
                        --bg-color: ${settings.darkMode ? '#1F1F1F' : '#ffffff'};
                        --text-color: ${settings.darkMode ? '#E1E1E1' : '#333333'};
                        --muted-color: ${settings.darkMode ? '#A0A0A0' : '#6B7280'};
                        --header-bg: ${settings.darkMode ? '#2D2D2D' : '#F9FAFB'};
                        --card-bg: ${settings.darkMode ? '#2A2A2A' : '#f9fafb'};
                      }
                      
                      body {
                        font-family: var(--font-family);
                        margin: 0; 
                        padding: 0;
                        background-color: var(--bg-color);
                        color: var(--text-color);
                      }
                      
                      .technical-sheet {
                        max-width: 800px;
                        margin: 20px auto;
                        padding: 30px;
                      }
                      
                      .technical-sheet-header {
                        text-align: center;
                        padding-bottom: 20px;
                        margin-bottom: 30px;
                        border-bottom: 1px solid var(--border-color);
                      }
                      
                      .technical-sheet-header h1 {
                        margin: 0 0 10px 0;
                        color: var(--primary-color);
                      }
                      
                      .section {
                        margin-bottom: 30px;
                      }
                      
                      .section h2 {
                        color: ${settings.darkMode ? '#4B96E6' : '#1565c0'};
                        padding-bottom: 8px;
                        margin-top: 0;
                        border-bottom: 1px solid var(--border-color);
                      }
                      
                      .grid {
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 16px;
                      }
                      
                      .grid > div {
                        padding: 10px;
                        border-radius: 6px;
                        background-color: var(--card-bg);
                      }
                      
                      .font-medium {
                        font-weight: 600;
                        color: ${settings.darkMode ? '#A4C2F4' : '#2E7D32'};
                        margin-right: 6px;
                      }
                      
                      .footer {
                        margin-top: 40px;
                        padding-top: 15px;
                        text-align: center;
                        font-size: 12px;
                        color: var(--muted-color);
                        border-top: 1px solid var(--border-color);
                      }
                      
                      @media print {
                        body { padding: 0; background-color: white; }
                        button { display: none; }
                      }
                    </style>
                  </head>
                  <body>
                    <div class="technical-sheet">
                      ${previewHTML}
                      
                      <div class="footer">
                        <p>Technical sheet generated on ${new Date().toLocaleDateString(settings.locale)}</p>
                      </div>
                    </div>
                  </body>
                </html>
              `}
              className="w-full h-full border-none"
              title="Technical Sheet Preview"
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>
              Close
            </Button>
            <Button onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TechnicalSheetButton;