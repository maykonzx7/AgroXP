import React, { useState } from "react";
import PageLayout from "../components/layout/PageLayout";
import PageHeader from "../components/layout/PageHeader";
import usePageMetadata from "../hooks/use-page-metadata";
import { Button } from "@/components/ui/button";
import {
  Download,
  Upload,
  PieChart,
  BarChart,
  CreditCard,
  DollarSign,
  Filter,
  Plus,
  HelpCircle,
  Calculator,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import useSpacing from "@/hooks/use-spacing";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  ScatterChart,
  Scatter,
  ZAxis,
  AreaChart,
  Area,
} from "recharts";

// Financial data types
interface FinancialData {
  id: number;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: "income" | "expense";
  status: "pending" | "completed" | "cancelled";
}

// Mock financial data
const mockFinancialData: FinancialData[] = [
  {
    id: 1,
    date: "2023-06-15",
    description: "Venda de colheita de cana-de-açúcar",
    category: "Receita agrícola",
    amount: 12500.0,
    type: "income",
    status: "completed",
  },
  {
    id: 2,
    date: "2023-06-12",
    description: "Compra de fertilizantes",
    category: "Insumos",
    amount: 3200.0,
    type: "expense",
    status: "completed",
  },
  {
    id: 3,
    date: "2023-06-10",
    description: "Pagamento de funcionários",
    category: "Mão de obra",
    amount: 4500.0,
    type: "expense",
    status: "completed",
  },
  {
    id: 4,
    date: "2023-06-05",
    description: "Manutenção de equipamentos",
    category: "Manutenção",
    amount: 1800.0,
    type: "expense",
    status: "completed",
  },
  {
    id: 5,
    date: "2023-06-01",
    description: "Venda de banana orgânica",
    category: "Receita agrícola",
    amount: 8700.0,
    type: "income",
    status: "completed",
  },
];

// Mock data for charts
const revenueExpenseData = [
  { month: "Jan", revenue: 28500, expenses: 20100 },
  { month: "Fev", revenue: 30200, expenses: 21800 },
  { month: "Mar", revenue: 32800, expenses: 22400 },
  { month: "Abr", revenue: 35500, expenses: 23100 },
  { month: "Mai", revenue: 38200, expenses: 23500 },
  { month: "Jun", revenue: 37800, expenses: 22900 },
];

const profitabilityByParcelData = [
  { name: "Parcela Norte", profitability: 1250, size: 12.5, crop: "Cana-de-açúcar" },
  { name: "Parcela Leste", profitability: 980, size: 8.3, crop: "Banana" },
  { name: "Parcela Sul", profitability: 1580, size: 15.7, crop: "Abacaxi" },
  { name: "Parcela Oeste", profitability: 850, size: 10.2, crop: "Inhame" },
  { name: "Parcela Central", profitability: 920, size: 6.8, crop: "Taioba" },
];

// Forecast data
const forecastData = [
  {
    month: "Jul",
    revenue: 42500,
    expenses: 24200,
    forecast: 18300,
    previous: 12400,
  },
  {
    month: "Ago",
    revenue: 44800,
    expenses: 25300,
    forecast: 19500,
    previous: 13100,
  },
  {
    month: "Set",
    revenue: 40200,
    expenses: 24800,
    forecast: 15400,
    previous: 12400,
  },
  {
    month: "Out",
    revenue: 38200,
    expenses: 23100,
    forecast: 15100,
    previous: 11800,
  },
  {
    month: "Nov",
    revenue: 36500,
    expenses: 22500,
    forecast: 14000,
    previous: 10900,
  },
  {
    month: "Dez",
    revenue: 41200,
    expenses: 25800,
    forecast: 15400,
    previous: 12200,
  },
];

const cashFlowProjection = [
  { month: "Jul", inflow: 42500, outflow: 24200, balance: 18300 },
  { month: "Ago", inflow: 44800, outflow: 25300, balance: 19500 },
  { month: "Set", inflow: 40200, outflow: 24800, balance: 15400 },
  { month: "Out", inflow: 38200, outflow: 23100, balance: 15100 },
  { month: "Nov", inflow: 36500, outflow: 22500, balance: 14000 },
  { month: "Dez", inflow: 41200, outflow: 25800, balance: 15400 },
];

const monthlyRevenueExpenseData = [
  { month: "Jan", revenue: 28500, expenses: 20100 },
  { month: "Fev", revenue: 30200, expenses: 21800 },
  { month: "Mar", revenue: 32800, expenses: 22400 },
  { month: "Abr", revenue: 35500, expenses: 23100 },
  { month: "Mai", revenue: 38200, expenses: 23500 },
  { month: "Jun", revenue: 37800, expenses: 22900 },
];

const FinancialManagementPage = () => {
  const spacing = useSpacing();
  const [selectedPeriod, setSelectedPeriod] = useState<string>("this-month");
  const [forecastDuration, setForecastDuration] = useState<string>("12");
  const [forecastModel, setForecastModel] = useState<string>("basic");
  const [revenueFactor, setRevenueFactor] = useState<number[]>([100]);
  const [expenseFactor, setExpenseFactor] = useState<number[]>([100]);
  const [revenueScenario, setRevenueScenario] = useState<string>("stable");

  const {
    title,
    description,
    handleTitleChange,
    handleDescriptionChange,
  } = usePageMetadata({
    defaultTitle: "Gestão Financeira",
    defaultDescription:
      "Acompanhe suas finanças, orçamentos e previsões de receitas e despesas",
  });

  const handleExportData = () => {
    toast.success("Dados financeiros exportados com sucesso");
  };

  const handleImportData = () => {
    toast.info("Funcionalidade de importação em desenvolvimento");
  };

  const handleAddTransaction = () => {
    toast.success("Funcionalidade de adicionar transação em desenvolvimento");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const calculateTotalIncome = () => {
    return mockFinancialData
      .filter((item) => item.type === "income")
      .reduce((sum, item) => sum + item.amount, 0);
  };

  const calculateTotalExpenses = () => {
    return mockFinancialData
      .filter((item) => item.type === "expense")
      .reduce((sum, item) => sum + item.amount, 0);
  };

  const calculateNetProfit = () => {
    return calculateTotalIncome() - calculateTotalExpenses();
  };

  const handleRunSimulation = () => {
    toast.success("Simulação iniciada com sucesso");
  };

  // Main Revenue and Expense Chart Component - Compact version
  const RevenueExpenseChart = () => (
    <Card className="h-auto">
      <CardHeader className="pb-3 pt-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base">Receita e Despesa</CardTitle>
          <UITooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Comparação mensal de receitas e despesas</p>
            </TooltipContent>
          </UITooltip>
        </div>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={revenueExpenseData}
            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis 
              dataKey="month" 
              stroke="#6b7280" 
              tickLine={false} 
              axisLine={false} 
              fontSize={11}
            />
            <YAxis 
              stroke="#6b7280" 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={(value) => `R$ ${value/1000}k`}
              width={40}
              fontSize={11}
            />
            <Tooltip
              formatter={(value) => [`R$ ${Number(value).toLocaleString()}`, ""]}
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb', 
                borderRadius: '0.375rem',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                fontSize: '0.75rem',
                padding: '0.5rem'
              }}
            />
            <Legend 
              verticalAlign="top" 
              height={28}
              formatter={(value) => (
                <span className="text-xs text-gray-600">{value}</span>
              )}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              name="Receitas"
              stroke="#4CAF50"
              strokeWidth={1.5}
              dot={{ r: 3, strokeWidth: 1.5, fill: '#4CAF50' }}
              activeDot={{ r: 4, strokeWidth: 1.5, fill: '#4CAF50' }}
            />
            <Line
              type="monotone"
              dataKey="expenses"
              name="Despesas"
              stroke="#F44336"
              strokeWidth={1.5}
              dot={{ r: 3, strokeWidth: 1.5, fill: '#F44336' }}
              activeDot={{ r: 4, strokeWidth: 1.5, fill: '#F44336' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  // Profitability by Parcel Chart Component - Compact version
  const ProfitabilityByParcelChart = () => (
    <Card className="h-auto">
      <CardHeader className="pb-3 pt-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base">Rentabilidade por parcela</CardTitle>
          <UITooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Rentabilidade por parcela em R$/ha</p>
            </TooltipContent>
          </UITooltip>
        </div>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart
            margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis
              type="number"
              dataKey="size"
              name="Tamanho"
              unit=" ha"
              stroke="#6b7280"
              tickLine={false}
              axisLine={false}
              fontSize={11}
              label={{
                value: "Tamanho (ha)",
                position: "insideBottomRight",
                offset: -5,
                fill: "#6b7280",
                fontSize: 10
              }}
            />
            <YAxis
              type="number"
              dataKey="profitability"
              name="Rentabilidade"
              unit=" R$/ha"
              stroke="#6b7280"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `R$ ${value}`}
              width={45}
              fontSize={11}
              label={{
                value: "Rent. (R$/ha)",
                angle: -90,
                position: "insideLeft",
                fill: "#6b7280",
                fontSize: 10
              }}
            />
            <ZAxis
              type="category"
              dataKey="crop"
              name="Cultura"
              range={[50, 200]}
            />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              formatter={(value, name) => {
                if (name === "Rentabilidade")
                  return [`R$ ${value} /ha`, name];
                if (name === "Tamanho") return [`${value} ha`, name];
                return [value, name];
              }}
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb', 
                borderRadius: '0.375rem',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                fontSize: '0.75rem',
                padding: '0.5rem'
              }}
            />
            <Scatter
              name="Parcelas"
              data={profitabilityByParcelData}
              fill="#4CAF50"
            />
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  // Monthly Revenue and Expense Chart Component - Compact version
  const MonthlyRevenueExpenseChart = () => (
    <Card className="h-auto">
      <CardHeader className="pb-3 pt-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base">Receitas e Despesas mensais</CardTitle>
          <UITooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Evolução mensal de receitas e despesas</p>
            </TooltipContent>
          </UITooltip>
        </div>
      </CardHeader>
      <CardContent className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart
            data={monthlyRevenueExpenseData}
            margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis 
              dataKey="month" 
              stroke="#6b7280" 
              tickLine={false} 
              axisLine={false} 
              fontSize={11}
            />
            <YAxis 
              stroke="#6b7280" 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={(value) => `R$ ${value/1000}k`}
              width={40}
              fontSize={11}
            />
            <Tooltip
              formatter={(value) => [`R$ ${Number(value).toLocaleString()}`, ""]}
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb', 
                borderRadius: '0.375rem',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                fontSize: '0.75rem',
                padding: '0.5rem'
              }}
            />
            <Legend 
              verticalAlign="top" 
              height={28}
              formatter={(value) => (
                <span className="text-xs text-gray-600">{value}</span>
              )}
            />
            <Bar
              dataKey="revenue"
              name="Receitas"
              fill="#4CAF50"
              radius={[2, 2, 0, 0]}
              barSize={12}
            />
            <Bar
              dataKey="expenses"
              name="Despesas"
              fill="#F44336"
              radius={[2, 2, 0, 0]}
              barSize={12}
            />
          </RechartsBarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  // Financial Forecast Component - Compact version
  const FinancialForecast = () => (
    <Card className="h-auto">
      <CardHeader className="pb-3 pt-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base">Previsão Financeira</CardTitle>
          <div className="flex gap-1.5">
            <Select value={forecastDuration} onValueChange={setForecastDuration}>
              <SelectTrigger className="w-[70px] h-7 text-xs">
                <SelectValue placeholder="Per." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3m</SelectItem>
                <SelectItem value="6">6m</SelectItem>
                <SelectItem value="12">12m</SelectItem>
                <SelectItem value="24">24m</SelectItem>
              </SelectContent>
            </Select>

            <Select value={forecastModel} onValueChange={setForecastModel}>
              <SelectTrigger className="w-[80px] h-7 text-xs">
                <SelectValue placeholder="Mod." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Básico</SelectItem>
                <SelectItem value="seasonal">Saz.</SelectItem>
                <SelectItem value="advanced">Avan.</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={forecastData}
            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis 
              dataKey="month" 
              stroke="#6b7280" 
              tickLine={false} 
              axisLine={false} 
              fontSize={11}
            />
            <YAxis 
              stroke="#6b7280" 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={(value) => `R$ ${value/1000}k`}
              width={40}
              fontSize={11}
            />
            <Tooltip
              formatter={(value, name) => {
                if (name === "forecast")
                  return [`R$ ${Number(value).toLocaleString()}`, "Previsão"];
                if (name === "previous")
                  return [
                    `R$ ${Number(value).toLocaleString()}`,
                    "Ano ant.",
                  ];
                return [`R$ ${Number(value).toLocaleString()}`, name];
              }}
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb', 
                borderRadius: '0.375rem',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                fontSize: '0.75rem',
                padding: '0.5rem'
              }}
            />
            <Legend 
              verticalAlign="top" 
              height={28}
              formatter={(value) => (
                <span className="text-xs text-gray-600">{value}</span>
              )}
            />
            <Line
              type="monotone"
              dataKey="forecast"
              name="Previsão"
              stroke="#4CAF50"
              strokeWidth={1.5}
              dot={{ r: 3, strokeWidth: 1.5, fill: '#4CAF50' }}
              activeDot={{ r: 4, strokeWidth: 1.5, fill: '#4CAF50' }}
            />
            <Line
              type="monotone"
              dataKey="previous"
              name="Ano ant."
              stroke="#9E9E9E"
              strokeDasharray="3 3"
              strokeWidth={1.5}
              dot={{ r: 3, strokeWidth: 1.5, fill: '#9E9E9E' }}
              activeDot={{ r: 4, strokeWidth: 1.5, fill: '#9E9E9E' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  // Net Margin Chart Component - Compact version
  const NetMarginChart = () => (
    <Card className="h-auto">
      <CardHeader className="pb-3 pt-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base">Margem Líquida</CardTitle>
          <UITooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Margem líquida projetada</p>
            </TooltipContent>
          </UITooltip>
        </div>
      </CardHeader>
      <CardContent className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={forecastData}
            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis 
              dataKey="month" 
              stroke="#6b7280" 
              tickLine={false} 
              axisLine={false} 
              fontSize={11}
            />
            <YAxis 
              stroke="#6b7280" 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={(value) => `R$ ${value/1000}k`}
              width={40}
              fontSize={11}
            />
            <Tooltip
              formatter={(value, name) => {
                if (name === "forecast")
                  return [`R$ ${Number(value).toLocaleString()}`, "Previsão"];
                if (name === "previous")
                  return [
                    `R$ ${Number(value).toLocaleString()}`,
                    "Ano ant.",
                  ];
                return [`R$ ${Number(value).toLocaleString()}`, name];
              }}
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb', 
                borderRadius: '0.375rem',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                fontSize: '0.75rem',
                padding: '0.5rem'
              }}
            />
            <Legend 
              verticalAlign="top" 
              height={28}
              formatter={(value) => (
                <span className="text-xs text-gray-600">{value}</span>
              )}
            />
            <Line
              type="monotone"
              dataKey="forecast"
              name="Previsão"
              stroke="#4CAF50"
              strokeWidth={1.5}
              dot={{ r: 3, strokeWidth: 1.5, fill: '#4CAF50' }}
              activeDot={{ r: 4, strokeWidth: 1.5, fill: '#4CAF50' }}
            />
            <Line
              type="monotone"
              dataKey="previous"
              name="Ano ant."
              stroke="#9E9E9E"
              strokeDasharray="3 3"
              strokeWidth={1.5}
              dot={{ r: 3, strokeWidth: 1.5, fill: '#9E9E9E' }}
              activeDot={{ r: 4, strokeWidth: 1.5, fill: '#9E9E9E' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  // Cash Flow Chart Component - Compact version
  const CashFlowChart = () => (
    <Card className="h-auto">
      <CardHeader className="pb-3 pt-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base">Fluxo de Caixa</CardTitle>
          <UITooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Saldo de caixa projetado</p>
            </TooltipContent>
          </UITooltip>
        </div>
      </CardHeader>
      <CardContent className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={cashFlowProjection}
            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis 
              dataKey="month" 
              stroke="#6b7280" 
              tickLine={false} 
              axisLine={false} 
              fontSize={11}
            />
            <YAxis 
              stroke="#6b7280" 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={(value) => `R$ ${value/1000}k`}
              width={40}
              fontSize={11}
            />
            <Tooltip
              formatter={(value) => [`R$ ${Number(value).toLocaleString()}`, ""]}
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb', 
                borderRadius: '0.375rem',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                fontSize: '0.75rem',
                padding: '0.5rem'
              }}
            />
            <Legend 
              verticalAlign="top" 
              height={28}
              formatter={(value) => (
                <span className="text-xs text-gray-600">{value}</span>
              )}
            />
            <Area
              type="monotone"
              dataKey="balance"
              name="Saldo"
              stroke="#8884d8"
              fill="#8884d8"
              fillOpacity={0.2}
              strokeWidth={1.5}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  // Simulation Parameters Component - Compact version
  const SimulationParameters = () => (
    <Card className="h-auto">
      <CardHeader className="pb-3 pt-4">
        <CardTitle className="text-base">Parâmetros de Simulação</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-medium">Receitas</Label>
                <span className="text-xs font-medium">
                  {revenueFactor[0]}%
                </span>
              </div>
              <Slider
                value={revenueFactor}
                onValueChange={setRevenueFactor}
                min={70}
                max={130}
                step={1}
                className="py-1"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-medium">Despesas</Label>
                <span className="text-xs font-medium">
                  {expenseFactor[0]}%
                </span>
              </div>
              <Slider
                value={expenseFactor}
                onValueChange={setExpenseFactor}
                min={70}
                max={130}
                step={1}
                className="py-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Cenário</Label>
              <Select
                value={revenueScenario}
                onValueChange={setRevenueScenario}
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue placeholder="Cenário" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="optimistic">Otimista</SelectItem>
                  <SelectItem value="stable">Estável</SelectItem>
                  <SelectItem value="pessimistic">Pessimista</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button className="w-full bg-green-600 hover:bg-green-700 h-7 text-xs" onClick={handleRunSimulation}>
                <Calculator className="h-3 w-3 mr-1" />
                Simular
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Projected Results Component - Compact version
  const ProjectedResults = () => (
    <div className="grid grid-cols-3 gap-2">
      <Card className="h-auto">
        <CardContent className="p-2.5">
          <p className="text-muted-foreground text-[10px] font-medium mb-0.5">
            EBITDA
          </p>
          <p className="text-sm font-bold">R$ 98.6k</p>
          <div className="flex items-center space-x-0.5 text-green-600 text-[9px] mt-0.5">
            <TrendingUp className="h-2.5 w-2.5" />
            <span>+12%</span>
          </div>
        </CardContent>
      </Card>

      <Card className="h-auto">
        <CardContent className="p-2.5">
          <p className="text-muted-foreground text-[10px] font-medium mb-0.5">
            ROI
          </p>
          <p className="text-sm font-bold">21,3%</p>
          <div className="flex items-center space-x-0.5 text-green-600 text-[9px] mt-0.5">
            <TrendingUp className="h-2.5 w-2.5" />
            <span>+3,2pts</span>
          </div>
        </CardContent>
      </Card>

      <Card className="h-auto">
        <CardContent className="p-2.5">
          <p className="text-muted-foreground text-[10px] font-medium mb-0.5">
            Caixa
          </p>
          <p className="text-sm font-bold">R$ 166.9k</p>
          <div className="flex items-center space-x-0.5 text-green-600 text-[9px] mt-0.5">
            <TrendingUp className="h-2.5 w-2.5" />
            <span>+32%</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Recent Transactions Table Component - Compact version
  const RecentTransactionsTable = () => (
    <Card className="h-auto">
      <CardHeader className="pb-3 pt-4">
        <CardTitle className="text-base">Transações Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b">
                <th className="text-left py-1.5 px-1 text-[10px] font-medium text-muted-foreground">Descrição</th>
                <th className="text-right py-1.5 px-1 text-[10px] font-medium text-muted-foreground">Valor</th>
              </tr>
            </thead>
            <tbody>
              {mockFinancialData.slice(0, 4).map((transaction) => (
                <tr key={transaction.id} className="border-b hover:bg-muted/50">
                  <td className="py-1.5 px-1">
                    <div className="flex items-center">
                      <div className={`p-1 rounded-full mr-2 ${transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
                        <DollarSign className={`h-2.5 w-2.5 ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`} />
                      </div>
                      <span className="font-medium truncate max-w-[100px]">{transaction.description}</span>
                    </div>
                  </td>
                  <td className={`py-1.5 px-1 text-right font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.type === 'income' ? '+' : '-'} R$ {(transaction.amount/1000).toFixed(1)}k
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <PageLayout>
      <div className={spacing.getPageContainerClasses()}>
        <PageHeader
          title={title}
          description={description}
          onTitleChange={handleTitleChange}
          onDescriptionChange={handleDescriptionChange}
          actions={
            <div className="flex flex-wrap gap-1.5">
              <Button
                variant="outline"
                onClick={handleExportData}
                className="flex items-center gap-1.5 h-7 text-xs px-2"
              >
                <Download className="h-3 w-3" />
                Exportar
              </Button>
              <Button
                variant="outline"
                onClick={handleImportData}
                className="flex items-center gap-1.5 h-7 text-xs px-2"
              >
                <Upload className="h-3 w-3" />
                Importar
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700 flex items-center gap-1.5 h-7 text-xs px-2"
                onClick={handleAddTransaction}
              >
                <Plus className="h-3 w-3" />
                Nova
              </Button>
            </div>
          }
          filterArea={
            <div className="flex items-center gap-1.5 w-full md:w-auto">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-full md:w-[120px] h-7 text-xs">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="this-month">Este mês</SelectItem>
                  <SelectItem value="last-month">Mês passado</SelectItem>
                  <SelectItem value="last-quarter">Últ. trim.</SelectItem>
                  <SelectItem value="this-year">Este ano</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" className="h-7 w-7">
                <Filter className="h-3 w-3" />
              </Button>
            </div>
          }
        />

        {/* Main two-column grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Main Revenue and Expense Chart */}
            <RevenueExpenseChart />
            
            {/* Profitability by Parcel Chart */}
            <ProfitabilityByParcelChart />
            
            {/* Monthly Revenue and Expense Chart */}
            <MonthlyRevenueExpenseChart />
            
            {/* Recent Transactions Table */}
            <RecentTransactionsTable />
          </div>
          
          {/* Right Column */}
          <div className="space-y-4">
            {/* Financial Forecast */}
            <FinancialForecast />
            
            {/* Net Margin and Cash Flow Charts */}
            <div className="grid grid-cols-1 gap-4">
              <NetMarginChart />
              <CashFlowChart />
            </div>
            
            {/* Simulation Parameters */}
            <SimulationParameters />
            
            {/* Projected Results */}
            <ProjectedResults />
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default FinancialManagementPage;