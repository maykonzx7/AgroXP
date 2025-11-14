import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Layers, TrendingUp, TrendingDown, MapPin, Wheat } from 'lucide-react';
import { useCRM } from '../../../contexts/CRMContext';

interface ParcelStatsProps {
  searchTerm?: string;
}

const ParcelStats: React.FC<ParcelStatsProps> = ({ searchTerm = '' }) => {
  const { getModuleData } = useCRM();
  const parcelData = getModuleData('parcelles')?.items || [];
  const cropData = getModuleData('cultures')?.items || [];

  // Filtrar parcelas com base no termo de pesquisa
  const filteredParcels = parcelData.filter(parcel => 
    !searchTerm || 
    parcel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    parcel.crop?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    parcel.culture?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular estatísticas
  const totalArea = filteredParcels.reduce((total, parcel) => {
    const size = parcel.size || parcel.area || 0;
    // Ensure size is a number
    const numSize = typeof size === 'number' ? size : parseFloat(size) || 0;
    return total + numSize;
  }, 0);
  const activeParcels = filteredParcels.filter(parcel => parcel.status === 'active').length;
  const totalParcels = filteredParcels.length;
  
  // Obter culturas principais
  const cropCounts: { [key: string]: number } = {};
  filteredParcels.forEach(parcel => {
    const cropName = parcel.crop || parcel.culture || 'Não especificado';
    cropCounts[cropName] = (cropCounts[cropName] || 0) + 1;
  });

  // Obter as 5 culturas mais comuns
  const mainCrops = Object.entries(cropCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([crop, count]) => ({ name: crop, count }));

  // Calcular rendimento médio (usando dados de culturas se disponível)
  const totalYield = cropData.reduce((total, crop) => {
    const yieldVal = crop.yield || crop.quantity || 0;
    // Ensure yield is a number
    const numYield = typeof yieldVal === 'number' ? yieldVal : parseFloat(yieldVal) || 0;
    return total + numYield;
  }, 0);
  const avgYield = cropData.length > 0 ? totalYield / cropData.length : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="dashboard-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Área Total</CardTitle>
          <Layers className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold text-primary">{Number(totalArea).toFixed(2)} ha</div>
          <p className="text-xs text-muted-foreground mt-1">
            {totalParcels} {totalParcels === 1 ? 'parcela' : 'parcelas'}
          </p>
        </CardContent>
      </Card>

      <Card className="dashboard-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Parcelas Ativas</CardTitle>
          <MapPin className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold text-primary">{activeParcels}</div>
          <p className="text-xs text-muted-foreground mt-1">
            de {totalParcels} total
          </p>
        </CardContent>
      </Card>

      <Card className="dashboard-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Rendimento Médio</CardTitle>
          <Wheat className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold text-primary">{Number(avgYield).toFixed(2)} t/ha</div>
          <p className="text-xs text-muted-foreground mt-1">
            Baseado nas últimas colheitas
          </p>
        </CardContent>
      </Card>

      <Card className="dashboard-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Principais Culturas</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {mainCrops.length > 0 ? (
              mainCrops.map((crop, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="truncate max-w-[60%]">{crop.name}</span>
                  <span className="font-medium bg-muted px-1.5 py-0.5 rounded text-xs">{crop.count}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground text-center py-1">Nenhuma cultura</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ParcelStats;