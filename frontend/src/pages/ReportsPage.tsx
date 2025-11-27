import React, { useState } from 'react';
import { PageLayout, PageHeader } from '@/shared/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  FileText,
  PieChart,
  Calendar
} from 'lucide-react';
import usePageMetadata from '@/hooks/use-page-metadata';
import useSpacing from '@/hooks/use-spacing';
import { useCRM } from '@/contexts/CRMContext';

const ReportsPage = () => {
  const { getModuleData } = useCRM();
  const spacing = useSpacing();
  
  const { 
    title, 
    description, 
    handleTitleChange, 
    handleDescriptionChange 
  } = usePageMetadata({
    defaultTitle: 'Relatórios e Análises',
    defaultDescription: 'Visualize relatórios detalhados e análises dos seus dados agrícolas'
  });

  const financeData = getModuleData('finances')?.items || [];
  const parcelData = getModuleData('parcelles')?.items || [];
  const cropData = getModuleData('cultures')?.items || [];
  const livestockData = getModuleData('livestock')?.items || [];
  const inventoryData = getModuleData('inventaire')?.items || [];
  const harvestData = getModuleData('harvest')?.items || [];

  const handleExportReport = (reportType: string) => {
    // TODO: Implementar exportação de relatórios
    console.log(`Exportando relatório: ${reportType}`);
  };

  const reportCards = [
    {
      title: 'Relatório Financeiro',
      description: 'Análise completa de receitas e despesas',
      icon: <TrendingUp className="h-6 w-6" />,
      count: financeData.length,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      onClick: () => handleExportReport('financial')
    },
    {
      title: 'Relatório de Parcelas',
      description: 'Visão geral das suas propriedades',
      icon: <BarChart3 className="h-6 w-6" />,
      count: parcelData.length,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      onClick: () => handleExportReport('parcels')
    },
    {
      title: 'Relatório de Culturas',
      description: 'Análise de produção e cultivos',
      icon: <PieChart className="h-6 w-6" />,
      count: cropData.length,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      onClick: () => handleExportReport('crops')
    },
    {
      title: 'Relatório de Pecuária',
      description: 'Acompanhamento do rebanho',
      icon: <FileText className="h-6 w-6" />,
      count: livestockData.length,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      onClick: () => handleExportReport('livestock')
    },
    {
      title: 'Relatório de Inventário',
      description: 'Controle de estoque e materiais',
      icon: <BarChart3 className="h-6 w-6" />,
      count: inventoryData.length,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      onClick: () => handleExportReport('inventory')
    },
    {
      title: 'Relatório de Colheitas',
      description: 'Histórico e análise de colheitas',
      icon: <Calendar className="h-6 w-6" />,
      count: harvestData.length,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      onClick: () => handleExportReport('harvest')
    }
  ];

  return (
    <PageLayout>
      <div className={spacing.getPageContainerClasses()}>
        <PageHeader 
          title={title}
          description={description}
          onTitleChange={handleTitleChange}
          onDescriptionChange={handleDescriptionChange}
          icon={<BarChart3 className="h-6 w-6" />}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {reportCards.map((report, index) => (
            <Card 
              key={index}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={report.onClick}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-lg ${report.bgColor}`}>
                    <div className={report.color}>
                      {report.icon}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{report.count}</div>
                    <div className="text-sm text-muted-foreground">itens</div>
                  </div>
                </div>
                <CardTitle className="mt-4">{report.title}</CardTitle>
                <CardDescription>{report.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    report.onClick();
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Gerar Relatório
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Relatório Consolidado</CardTitle>
            <CardDescription>
              Gere um relatório completo com todos os dados do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => handleExportReport('consolidated')}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Gerar Relatório Consolidado
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default ReportsPage;

