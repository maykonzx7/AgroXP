import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, AlertTriangle, TrendingUp } from 'lucide-react';

interface InventoryStatsProps {
  inventoryData: any[];
  categoryStats: any[];
}

const InventoryStats: React.FC<InventoryStatsProps> = ({ inventoryData, categoryStats }) => {
  // Calculate inventory statistics
  const totalItems = inventoryData.length;
  const totalValue = inventoryData.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const lowStockItems = inventoryData.filter(item => item.quantity <= item.minQuantity).length;
  
  // Prepare data for charts
  const lowStockData = inventoryData
    .filter(item => item.quantity <= item.minQuantity)
    .map(item => ({
      name: item.name,
      current: item.quantity,
      min: item.minQuantity
    }))
    .slice(0, 5);
  
  const valueByCategory = categoryStats.map(stat => ({
    name: stat.name,
    value: stat.value
  }));

  // Colors for charts
  const COLORS = ['#4CAF50', '#8D6E63', '#F44336', '#2196F3', '#FFC107', '#9C27B0'];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card rounded-xl border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Itens</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">
              Itens no inventário
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-card rounded-xl border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Valor total em estoque
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-card rounded-xl border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockItems}</div>
            <p className="text-xs text-muted-foreground">
              Itens abaixo do mínimo
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card rounded-xl border">
          <CardHeader>
            <CardTitle>Itens com Estoque Baixo</CardTitle>
            <CardDescription>Top 5 itens que precisam de reposição</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={lowStockData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={90}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value) => [`${value}`, 'Quantidade']}
                  labelFormatter={(label) => `Item: ${label}`}
                />
                <Bar 
                  dataKey="current" 
                  name="Atual" 
                  fill="#4CAF50" 
                  radius={[0, 4, 4, 0]}
                />
                <Bar 
                  dataKey="min" 
                  name="Mínimo" 
                  fill="#F44336" 
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card className="bg-card rounded-xl border">
          <CardHeader>
            <CardTitle>Valor por Categoria</CardTitle>
            <CardDescription>Distribuição de valor por categoria de itens</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={valueByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {valueByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`R$ ${value}`, 'Valor']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InventoryStats;