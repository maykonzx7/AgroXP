import React from 'react';
import { Check, Layers, ArrowRight } from 'lucide-react';
import { useStatistics } from '../../contexts/StatisticsContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const EnvironmentalCharts = () => {
  const { environmentalData } = useStatistics();
  const { indicators, carbonFootprint, waterUsage, biodiversity } = environmentalData;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Balanço de carbono</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            <div className="text-center">
              <div className="inline-block relative">
                <div className="w-32 h-32 rounded-full border-8 border-agri-primary"></div>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-2xl font-bold">{carbonFootprint}%</span>
                  <span className="text-xs text-muted-foreground">vs N-1</span>
                </div>
              </div>
              <p className="mt-4 text-sm">
                Redução das emissões de carbono graças às práticas agrícolas sustentáveis.
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Consumo de água</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            <div className="text-center">
              <div className="inline-block relative">
                <div className="w-32 h-32 rounded-full border-8 border-[#2196F3]"></div>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-2xl font-bold">{waterUsage}%</span>
                  <span className="text-xs text-muted-foreground">vs N-1</span>
                </div>
              </div>
              <p className="mt-4 text-sm">
                Redução do consumo de água por otimização da irrigação.
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Biodiversidade</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            <div className="text-center">
              <div className="inline-block relative">
                <div className="w-32 h-32 rounded-full border-8 border-[#FFC107]"></div>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-2xl font-bold">+{biodiversity}%</span>
                  <span className="text-xs text-muted-foreground">vs N-1</span>
                </div>
              </div>
              <p className="mt-4 text-sm">
                Aumento da biodiversidade na propriedade.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Indicadores ambientais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted text-xs uppercase">
                <tr>
                  <th className="px-4 py-2 text-left">Indicador</th>
                  <th className="px-4 py-2 text-left">Valor atual</th>
                  <th className="px-4 py-2 text-left">Objetivo</th>
                  <th className="px-4 py-2 text-left">Tendência</th>
                  <th className="px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {indicators.map((item, index) => (
                  <tr key={index} className="border-t">
                    <td className="px-4 py-3 font-medium">{item.indicator}</td>
                    <td className="px-4 py-3">{item.current}</td>
                    <td className="px-4 py-3">{item.target}</td>
                    <td className="px-4 py-3 text-agri-success">{item.trend}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                        item.status === 'Alcançado' 
                          ? 'bg-agri-success/10 text-agri-success' 
                          : 'bg-agri-warning/10 text-agri-warning'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Certificações e compromissos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-agri-primary/10 flex items-center justify-center mb-2">
                <Check className="h-8 w-8 text-agri-primary" />
              </div>
              <h4 className="font-medium mb-1">Agricultura Racional</h4>
              <p className="text-sm text-center text-muted-foreground">
                Certificado desde 2019
              </p>
            </div>
            <div className="border rounded-lg p-4 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-[#FFC107]/10 flex items-center justify-center mb-2">
                <Layers className="h-8 w-8 text-[#FFC107]" />
              </div>
              <h4 className="font-medium mb-1">AVA Nível 2</h4>
              <p className="text-sm text-center text-muted-foreground">
                Alta Valor Ambiental
              </p>
            </div>
            <div className="border rounded-lg p-4 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-[#2196F3]/10 flex items-center justify-center mb-2">
                <ArrowRight className="h-8 w-8 text-[#2196F3]" />
              </div>
              <h4 className="font-medium mb-1">Em conversão Orgânica</h4>
              <p className="text-sm text-center text-muted-foreground">
                15% da superfície total
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnvironmentalCharts;