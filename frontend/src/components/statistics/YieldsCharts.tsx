import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { useStatistics } from '../../contexts/StatisticsContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Download, Camera, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { EditableField } from '@/components/ui/editable-field';
import TechnicalSheetButton from '../common/TechnicalSheetButton';

const YieldsCharts = () => {
  const { yieldData, period } = useStatistics();
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');

  // Formatar os dados para o gráfico comparativo
  const comparativeData = yieldData.map(item => ({
    name: item.name,
    atual: item.current,
    anterior: item.previous,
    diferença: item.current - item.previous,
    unidade: item.unit
  }));

  // Dados históricos ao longo de vários anos (simulados)
  const historicalData = [
    { year: '2018', 'Cana-de-açúcar': 70, 'Banana': 28, 'Abacaxi': 40, 'Inhame': 14, 'Taioba': 18 },
    { year: '2019', 'Cana-de-açúcar': 72, 'Banana': 29, 'Abacaxi': 42, 'Inhame': 15, 'Taioba': 19 },
    { year: '2020', 'Cana-de-açúcar': 75, 'Banana': 30, 'Abacaxi': 48, 'Inhame': 15, 'Taioba': 20 },
    { year: '2021', 'Cana-de-açúcar': 78, 'Banana': 31, 'Abacaxi': 47, 'Inhame': 16, 'Taioba': 21 },
    { year: '2022', 'Cana-de-açúcar': 82, 'Banana': 31, 'Abacaxi': 46, 'Inhame': 17, 'Taioba': 21 },
    { year: '2023', 'Cana-de-açúcar': 85, 'Banana': 32, 'Abacaxi': 45, 'Inhame': 18, 'Taioba': 22 }
  ];

  // Gerar as cores para cada cultura
  const colors = {
    'Cana-de-açúcar': '#4CAF50',
    'Banana': '#FFC107',
    'Abacaxi': '#F44336',
    'Inhame': '#9C27B0',
    'Taioba': '#2196F3'
  };

  // Captura e exportação do gráfico (simulação)
  const handleExportChart = (chartName: string) => {
    toast.success(`Gráfico exportado`, {
      description: `O gráfico "${chartName}" foi baixado no formato PNG`
    });
  };

  // Compartilhamento do gráfico (simulação)
  const handleShareChart = (chartName: string) => {
    toast.success(`Gráfico compartilhado`, {
      description: `O link para o gráfico "${chartName}" foi copiado para a área de transferência`
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Rendimentos atuais vs anteriores</CardTitle>
            <CardDescription>Comparação dos rendimentos atuais com o período anterior</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex rounded-md border overflow-hidden">
              <Button
                variant={chartType === 'bar' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setChartType('bar')}
                className={chartType === 'bar' ? 'rounded-none' : 'rounded-none hover:bg-muted/50'}
              >
                Barras
              </Button>
              <Button
                variant={chartType === 'line' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setChartType('line')}
                className={chartType === 'line' ? 'rounded-none' : 'rounded-none hover:bg-muted/50'}
              >
                Linhas
              </Button>
            </div>
            <Button variant="outline" size="icon" onClick={() => handleExportChart('Rendimentos comparativos')}>
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => handleShareChart('Rendimentos comparativos')}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'bar' ? (
                <BarChart
                  data={comparativeData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name, props) => {
                      if (name === 'diferença') {
                        return [`${Number(value) > 0 ? '+' : ''}${value} ${props.payload.unidade}`, 'Evolução'];
                      }
                      return [`${value} ${props.payload.unidade}`, name];
                    }}
                  />
                  <Bar name="Rendimento atual" dataKey="atual" fill="#4CAF50" radius={[4, 4, 0, 0]} />
                  <Bar name="Rendimento anterior" dataKey="anterior" fill="#8D6E63" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                <LineChart
                  data={comparativeData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name, props) => {
                      if (name === 'diferença') {
                        return [`${Number(value) > 0 ? '+' : ''}${value} ${props.payload.unidade}`, 'Evolução'];
                      }
                      return [`${value} ${props.payload.unidade}`, name];
                    }}
                  />
                  <Line type="monotone" name="Rendimento atual" dataKey="atual" stroke="#4CAF50" strokeWidth={2} activeDot={{ r: 8 }} />
                  <Line type="monotone" name="Rendimento anterior" dataKey="anterior" stroke="#8D6E63" strokeWidth={2} />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Evolução histórica dos rendimentos ({period === 'year' ? 'anual' : 'mensal'})</CardTitle>
            <CardDescription>Tendência dos rendimentos ao longo de vários anos</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={() => handleExportChart('Evolução histórica')}>
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => handleShareChart('Evolução histórica')}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={historicalData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${value} t/ha`, '']} 
                  labelFormatter={(label) => `Ano: ${label}`}
                />
                <Legend />
                {Object.keys(colors).map((crop) => (
                  <Line
                    key={crop}
                    type="monotone"
                    dataKey={crop}
                    name={crop}
                    stroke={colors[crop as keyof typeof colors]}
                    activeDot={{ r: 8 }}
                    strokeWidth={2}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {yieldData.map((item) => {
          const change = item.current - item.previous;
          const changePercent = ((change / item.previous) * 100).toFixed(1);
          const isPositive = change >= 0;
          
          return (
            <Card key={item.name}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <div className={`rounded-full h-3 w-3 mr-2 ${isPositive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  {item.name}
                </CardTitle>
                <CardDescription>Rendimento atual vs anterior</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{item.current} {item.unit}</div>
                <div className={`text-sm flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {isPositive ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1">
                      <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1">
                      <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span>{isPositive ? '+' : ''}{change} {item.unit} ({isPositive ? '+' : ''}{changePercent}%)</span>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Anterior: {item.previous} {item.unit}
                </div>
              </CardContent>
              <TechnicalSheetButton 
                data={{ 
                  name: item.name,
                  currentYield: item.current,
                  previousYield: item.previous,
                  unit: item.unit
                }} 
                variant="outline"
                size="sm"
                className="w-full mt-2"
              >
                <Camera className="h-4 w-4 mr-2" />
                Ficha técnica
              </TechnicalSheetButton>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default YieldsCharts;