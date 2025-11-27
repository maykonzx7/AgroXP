import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Leaf, Wheat, BarChart3 } from 'lucide-react';
import { useCRM } from '@/contexts/CRMContext';

interface MainCropsCardProps {
  maxCrops?: number;
  showArea?: boolean;
  className?: string;
}

interface CropInfo {
  name: string;
  count: number;
  area?: number;
  totalYield?: number;
}

const MainCropsCard: React.FC<MainCropsCardProps> = ({ 
  maxCrops = 5, 
  showArea = false,
  className = ''
}) => {
  const { getModuleData } = useCRM();
  const parcelData = getModuleData('parcelles')?.items || [];
  const cropData = getModuleData('cultures')?.items || [];
  const harvestData = getModuleData('harvest')?.items || [];

  // Calcular principais culturas combinando dados de parcelas e culturas
  const mainCrops = useMemo(() => {
    const cropStats: { [key: string]: CropInfo } = {};

    // Contar culturas nas parcelas
    parcelData.forEach(parcel => {
      const cropName = parcel.crop || parcel.culture || 'Não especificado';
      if (cropName && cropName !== 'Não especificado') {
        if (!cropStats[cropName]) {
          cropStats[cropName] = {
            name: cropName,
            count: 0,
            area: 0,
            totalYield: 0
          };
        }
        cropStats[cropName].count += 1;
        
        // Adicionar área se disponível
        if (showArea) {
          const parcelArea = parcel.size || parcel.area || 0;
          const numArea = typeof parcelArea === 'number' ? parcelArea : parseFloat(parcelArea) || 0;
          cropStats[cropName].area = (cropStats[cropName].area || 0) + numArea;
        }
      }
    });

    // Adicionar culturas do módulo de culturas
    cropData.forEach(crop => {
      const cropName = crop.name || '';
      if (cropName && cropName !== 'Não especificado') {
        // Se a cultura não existe nas parcelas, criar entrada com contagem mínima
        if (!cropStats[cropName]) {
          cropStats[cropName] = {
            name: cropName,
            count: 1, // Contar como 1 se existir no módulo de culturas
            area: 0,
            totalYield: 0
          };
        }
        
        // Adicionar rendimento se disponível
        const yieldVal = crop.yield || crop.quantity || 0;
        const numYield = typeof yieldVal === 'number' ? yieldVal : parseFloat(yieldVal) || 0;
        cropStats[cropName].totalYield = (cropStats[cropName].totalYield || 0) + numYield;
      }
    });

    // Adicionar rendimentos do módulo de colheitas (harvest)
    harvestData.forEach(harvest => {
      const cropName = harvest.crop || '';
      if (cropName && cropName !== 'Não especificado') {
        // Se a cultura não existe, criar entrada
        if (!cropStats[cropName]) {
          cropStats[cropName] = {
            name: cropName,
            count: 0,
            area: 0,
            totalYield: 0
          };
        }
        
        // Adicionar rendimento do acompanhamento de colheitas
        const yieldVal = harvest.yield || harvest.quantity || 0;
        const numYield = typeof yieldVal === 'number' ? yieldVal : parseFloat(yieldVal) || 0;
        cropStats[cropName].totalYield = (cropStats[cropName].totalYield || 0) + numYield;
      }
    });

    // Converter para array e ordenar por contagem (ou área se showArea)
    const cropsArray = Object.values(cropStats)
      .filter(crop => crop.name && crop.name !== 'Não especificado')
      .sort((a, b) => {
        if (showArea && a.area !== undefined && b.area !== undefined) {
          return b.area - a.area;
        }
        return b.count - a.count;
      })
      .slice(0, maxCrops);

    return cropsArray;
  }, [parcelData, cropData, harvestData, maxCrops, showArea]);

  return (
    <Card className={`dashboard-card ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Principais Culturas</CardTitle>
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {mainCrops.length > 0 ? (
            mainCrops.map((crop, index) => (
              <div 
                key={`${crop.name}-${index}`} 
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                    index === 0 ? 'bg-primary text-primary-foreground' :
                    index === 1 ? 'bg-green-500 text-white' :
                    index === 2 ? 'bg-yellow-500 text-white' :
                    'bg-muted text-foreground'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <Leaf className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                      <span className="font-medium text-sm truncate">{crop.name}</span>
                    </div>
                    {showArea && crop.area !== undefined && crop.area > 0 && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {Number(crop.area).toFixed(2)} ha
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {crop.count > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted text-xs font-medium">
                      <Wheat className="h-3 w-3" />
                      {crop.count} {crop.count === 1 ? 'parcela' : 'parcelas'}
                    </span>
                  )}
                  {crop.totalYield !== undefined && crop.totalYield > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-medium">
                      <BarChart3 className="h-3 w-3" />
                      {Number(crop.totalYield).toFixed(1)} t
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6">
              <Wheat className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-sm text-muted-foreground">Nenhuma cultura registrada</p>
              <p className="text-xs text-muted-foreground mt-1">
                Adicione culturas ou parcelas para ver as principais culturas
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MainCropsCard;

