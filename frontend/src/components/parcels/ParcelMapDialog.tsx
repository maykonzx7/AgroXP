import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import ParcelMap from '@/components/ParcelMap';
import { Search, ZoomIn, ZoomOut, Maximize2, Download, Layers, Ruler, MapPin, Target } from 'lucide-react';
import { toast } from 'sonner';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from '@/components/ui/checkbox';

interface Layer {
  id: string;
  name: string;
  enabled: boolean;
  type: 'base' | 'overlay';
}

interface ParcelMapDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const ParcelMapDialog = ({ isOpen, onOpenChange }: ParcelMapDialogProps) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [coordinates, setCoordinates] = useState({ lat: -23.5505, lng: -46.6333 });
  const [searchQuery, setSearchQuery] = useState('');
  const [measureMode, setMeasureMode] = useState(false);
  const [measureResult, setMeasureResult] = useState<string | null>(null);
  const [layersOpen, setLayersOpen] = useState(false);
  const [mapLayers, setMapLayers] = useState<Layer[]>([
    { id: 'satellite', name: 'Vista de Satélite', enabled: false, type: 'base' },
    { id: 'terrain', name: 'Terreno', enabled: true, type: 'base' },
    { id: 'parcels', name: 'Limites dos Talhões', enabled: true, type: 'overlay' },
    { id: 'crops', name: 'Culturas Atuais', enabled: true, type: 'overlay' },
    { id: 'soil', name: 'Tipos de Solo', enabled: false, type: 'overlay' },
    { id: 'irrigation', name: 'Irrigação', enabled: false, type: 'overlay' },
  ]);
  
  const handleZoomIn = () => {
    if (zoomLevel < 3) {
      setZoomLevel(zoomLevel + 0.5);
    }
  };
  
  const handleZoomOut = () => {
    if (zoomLevel > 0.5) {
      setZoomLevel(zoomLevel - 0.5);
    }
  };
  
  const handleResetView = () => {
    setZoomLevel(1);
    setCoordinates({ lat: -23.5505, lng: -46.6333 });
  };
  
  const handleExportMap = () => {
    toast.success("Exportar Mapa", {
      description: "O mapa dos talhões foi exportado para PDF."
    });
  };

  const toggleMeasureMode = () => {
    const newMode = !measureMode;
    setMeasureMode(newMode);
    
    if (newMode) {
      toast.info("Modo de Medição Ativado", {
        description: "Clique no mapa para marcar pontos e medir a distância."
      });
    } else {
      setMeasureResult(null);
    }
  };

  const handleLayerChange = (layerId: string, enabled: boolean) => {
    setMapLayers(mapLayers.map(layer => 
      layer.id === layerId ? { ...layer, enabled } : layer
    ));
    
    if (enabled) {
      const layer = mapLayers.find(l => l.id === layerId);
      if (layer?.type === 'base') {
        setMapLayers(mapLayers.map(l => 
          l.type === 'base' ? { ...l, enabled: l.id === layerId } : l
        ));
      }
    }
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    toast.info("Buscando...", {
      description: `Buscando pelo talhão: ${searchQuery}`
    });

    setTimeout(() => {
      setCoordinates({ lat: -23.56, lng: -46.64 });
      setZoomLevel(2);
      toast.success("Talhão encontrado", {
        description: "O mapa foi centralizado no talhão buscado."
      });
    }, 1000);
  };

  const simulateMeasurement = useCallback(() => {
    if (measureMode) {
      setMeasureResult("Distância: 245.3 metros");
    }
  }, [measureMode]);

  useEffect(() => {
    if (isOpen && measureMode) {
      const timer = setTimeout(simulateMeasurement, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, measureMode, simulateMeasurement]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Mapa dos Talhões</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <form onSubmit={handleSearch} className="flex-grow mr-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input 
                  type="text"
                  placeholder="Buscar um talhão..."
                  className="pl-9 pr-4 py-2 w-full border rounded-md"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>
            <div className="flex space-x-2">
              <Button variant="outline" size="icon" onClick={handleZoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleZoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleResetView}>
                <Maximize2 className="h-4 w-4" />
              </Button>
              <Popover open={layersOpen} onOpenChange={setLayersOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Layers className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56">
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm">Camadas Base</h4>
                    <div className="space-y-2">
                      {mapLayers.filter(l => l.type === 'base').map(layer => (
                        <div key={layer.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`layer-${layer.id}`} 
                            checked={layer.enabled}
                            onCheckedChange={(checked) => handleLayerChange(layer.id, checked === true)}
                          />
                          <label 
                            htmlFor={`layer-${layer.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {layer.name}
                          </label>
                        </div>
                      ))}
                    </div>
                    
                    <h4 className="font-medium text-sm">Camadas Adicionais</h4>
                    <div className="space-y-2">
                      {mapLayers.filter(l => l.type === 'overlay').map(layer => (
                        <div key={layer.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`layer-${layer.id}`} 
                            checked={layer.enabled}
                            onCheckedChange={(checked) => handleLayerChange(layer.id, checked === true)}
                          />
                          <label 
                            htmlFor={`layer-${layer.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {layer.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              <Button 
                variant={measureMode ? "default" : "outline"} 
                size="icon" 
                onClick={toggleMeasureMode}
                className={measureMode ? "bg-agri-primary text-white" : ""}
              >
                <Ruler className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleExportMap}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="h-[500px] bg-gray-100 rounded-lg overflow-hidden relative" style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}>
            <ParcelMap 
              coordinates={coordinates}
              parcelName="Visão Geral"
              isEditing={false}
              onCoordinatesChange={setCoordinates}
            />
            
            {measureMode && (
              <div className="absolute top-2 left-2 bg-white/90 p-2 rounded-md shadow-md">
                <div className="flex items-center text-sm">
                  <Ruler className="h-4 w-4 mr-1 text-agri-primary" />
                  <span className="font-medium">Modo de Medição Ativado</span>
                </div>
                {measureResult && (
                  <div className="text-sm mt-1 font-bold">{measureResult}</div>
                )}
              </div>
            )}
            
            <div className="absolute bottom-2 right-2 bg-white/90 p-2 rounded-md shadow-md max-w-xs">
              <div className="text-xs font-medium mb-1">Camadas Ativas:</div>
              <div className="flex flex-wrap gap-1">
                {mapLayers.filter(layer => layer.enabled).map(layer => (
                  <span 
                    key={layer.id}
                    className="text-xs px-2 py-0.5 bg-agri-primary/10 text-agri-primary rounded-full"
                  >
                    {layer.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground text-center">
            Esta visão geral mostra a localização de todos os seus talhões. 
            Clique em um talhão específico para ver mais detalhes.
          </p>
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => {
                navigator.geolocation.getCurrentPosition((position) => {
                  const { latitude, longitude } = position.coords;
                  setCoordinates({ lat: latitude, lng: longitude });
                  setZoomLevel(2.5);
                  toast.success("Localização", {
                    description: "Mapa centrado na sua posição."
                  });
                }, () => {
                  toast.error("Localização", {
                    description: "Não foi possível obter sua localização."
                  });
                });
              }}
              className="gap-2"
            >
              <Target className="h-4 w-4" />
              Minha Posição
            </Button>
            <Button onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ParcelMapDialog;