import React, { useState, useEffect } from "react";
import { PageLayout, PageHeader } from "@/shared/components/layout";
import usePageMetadata from "../hooks/use-page-metadata";
import { Button } from "@/components/ui/button";
import { useCRM } from "../contexts/CRMContext";
import { AddTransactionDialog } from "@/features/finance";
import ImportDialog from "../components/common/ImportDialog";
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

// Financial data types - matching Prisma schema
interface FinancialData {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  fieldId?: string | null;
  createdAt: string;
  updatedAt: string;
}

const FinancialManagementPage = () => {
  const { getModuleData, exportModuleData, syncDataAcrossCRM } = useCRM();
  const spacing = useSpacing();
  const [financialData, setFinancialData] = useState<FinancialData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("this-month");
  const [forecastDuration, setForecastDuration] = useState<string>("12");
  const [forecastModel, setForecastModel] = useState<string>("basic");
  const [revenueFactor, setRevenueFactor] = useState<number[]>([100]);
  const [expenseFactor, setExpenseFactor] = useState<number[]>([100]);
  const [revenueScenario, setRevenueScenario] = useState<string>("stable");
  const [addTransactionOpen, setAddTransactionOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  // Load financial data from API
  useEffect(() => {
    const loadFinancialData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await financeApi.getAll();
        setFinancialData(data || []);
      } catch (err: any) {
        console.error('Error loading financial data:', err);
        setError(err.message || 'Erro ao carregar dados financeiros');
        toast.error('Erro ao carregar dados financeiros');
      } finally {
        setLoading(false);
      }
    };

    loadFinancialData();
  }, []);

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

  const handleExportData = async () => {
    try {
      const success = await exportModuleData('finance', 'excel');
      if (success) {
        toast.success("Dados financeiros exportados com sucesso");
      } else {
        toast.error("Erro ao exportar dados financeiros");
      }
    } catch (error) {
      toast.error("Erro ao exportar dados financeiros");
    }
  };

  const handleImportData = async (file: File) => {
    // Implementar lógica de importação CSV/Excel
    try {
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',');
      
      // Validar cabeçalhos esperados
      const expectedHeaders = ['type', 'category', 'amount', 'description', 'date'];
      const hasValidHeaders = expectedHeaders.every(h => 
        headers.some(header => header.toLowerCase().includes(h.toLowerCase()))
      );
      
      if (!hasValidHeaders) {
        throw new Error('Formato de arquivo inválido. Verifique o template.');
      }
      
      // Processar linhas (pular cabeçalho)
      const transactions = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const values = line.split(',');
        if (values.length >= 5) {
          transactions.push({
            type: values[0].toUpperCase() === 'RECEITA' || values[0].toUpperCase() === 'INCOME' ? 'INCOME' : 'EXPENSE',
            category: values[1],
            amount: parseFloat(values[2]),
            description: values[3],
            date: values[4] || new Date().toISOString().split('T')[0],
          });
        }
      }
      
      // Criar transações em lote
      for (const transaction of transactions) {
        await financeApi.create(transaction);
      }
      
      // Recarregar dados
      await handleTransactionAdded();
      
      toast.success(`${transactions.length} transações importadas com sucesso!`);
    } catch (error: any) {
      console.error('Import error:', error);
      throw error;
    }
  };

  const handleAddTransaction = () => {
    setAddTransactionOpen(true);
  };

  const handleTransactionAdded = async () => {
    // Reload financial data
    try {
      setLoading(true);
      // Sync CRM data first to ensure consistency
      if (syncDataAcrossCRM) {
        await syncDataAcrossCRM();
      }
      // Then reload from API
      const data = await financeApi.getAll();
      console.log('Reloaded financial data:', data);
      setFinancialData(data || []);
      toast.success('Dados atualizados com sucesso!');
    } catch (err: any) {
      console.error('Error reloading financial data:', err);
      toast.error('Erro ao recarregar dados');
    } finally {
      setLoading(false);
    }
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

  // Filter data by selected period
  const getFilteredData = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return financialData.filter((item) => {
      const itemDate = new Date(item.date);
      const itemMonth = itemDate.getMonth();
      const itemYear = itemDate.getFullYear();

      switch (selectedPeriod) {
        case "this-month":
          return itemMonth === currentMonth && itemYear === currentYear;
        case "last-month":
          const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
          const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
          return itemMonth === lastMonth && itemYear === lastMonthYear;
        case "last-quarter":
          // Last 3 months
          const threeMonthsAgo = new Date(now);
          threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
          return itemDate >= threeMonthsAgo;
        case "this-year":
          return itemYear === currentYear;
        default:
          return true;
      }
    });
  };

  const calculateTotalIncome = () => {
    return getFilteredData()
      .filter((item) => item.type === "INCOME")
      .reduce((sum, item) => sum + Number(item.amount), 0);
  };

  const calculateTotalExpenses = () => {
    return getFilteredData()
      .filter((item) => item.type === "EXPENSE")
      .reduce((sum, item) => sum + Number(item.amount), 0);
  };

  const calculateNetProfit = () => {
    return calculateTotalIncome() - calculateTotalExpenses();
  };

  // Calculate revenue and expense data by month from real data
  const getRevenueExpenseData = () => {
    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const dataByMonth: { [key: string]: { revenue: number; expenses: number } } = {};
    const filteredData = getFilteredData();

    filteredData.forEach((item) => {
      const date = new Date(item.date);
      const monthKey = `${monthNames[date.getMonth()]}`;
      
      if (!dataByMonth[monthKey]) {
        dataByMonth[monthKey] = { revenue: 0, expenses: 0 };
      }

      if (item.type === "INCOME") {
        dataByMonth[monthKey].revenue += Number(item.amount);
      } else {
        dataByMonth[monthKey].expenses += Number(item.amount);
      }
    });

    return Object.entries(dataByMonth)
      .map(([month, values]) => ({ month, ...values }))
      .slice(-6); // Last 6 months
  };

  // Get recent transactions for table
  const getRecentTransactions = () => {
    return getFilteredData()
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10); // Show last 10 transactions
  };

  // Generate monthly revenue and expense data for bar chart
  const getMonthlyRevenueExpenseData = () => {
    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const dataByMonth: { [key: string]: { revenue: number; expenses: number } } = {};
    const filteredData = getFilteredData();

    filteredData.forEach((item) => {
      const date = new Date(item.date);
      const monthKey = `${monthNames[date.getMonth()]}`;
      
      if (!dataByMonth[monthKey]) {
        dataByMonth[monthKey] = { revenue: 0, expenses: 0 };
      }

      if (item.type === "INCOME") {
        dataByMonth[monthKey].revenue += Number(item.amount);
      } else {
        dataByMonth[monthKey].expenses += Number(item.amount);
      }
    });

    return Object.entries(dataByMonth)
      .map(([month, values]) => ({ month, ...values }))
      .slice(-12); // Last 12 months
  };

  // Generate cash flow projection data
  const getCashFlowProjection = () => {
    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const dataByMonth: { [key: string]: { balance: number } } = {};
    let runningBalance = 0;

    // Sort by date to calculate running balance
    const filteredData = getFilteredData();
    const sortedData = [...filteredData].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    sortedData.forEach((item) => {
      const date = new Date(item.date);
      const monthKey = `${monthNames[date.getMonth()]}`;
      
      if (!dataByMonth[monthKey]) {
        dataByMonth[monthKey] = { balance: runningBalance };
      }

      if (item.type === "INCOME") {
        runningBalance += Number(item.amount);
      } else {
        runningBalance -= Number(item.amount);
      }

      dataByMonth[monthKey].balance = runningBalance;
    });

    return Object.entries(dataByMonth)
      .map(([month, values]) => ({ month, ...values }))
      .slice(-12); // Last 12 months
  };

  // Calculate real financial metrics
  const calculateEBITDA = () => {
    // EBITDA = Receitas - Despesas Operacionais (sem juros, impostos, depreciação)
    // Para simplificar, vamos usar: Receitas - Despesas (exceto juros e impostos)
    const totalIncome = calculateTotalIncome();
    const filteredData = getFilteredData();
    const operationalExpenses = filteredData
      .filter((item) => item.type === "EXPENSE" && 
        !item.category.toLowerCase().includes('juros') &&
        !item.category.toLowerCase().includes('imposto') &&
        !item.category.toLowerCase().includes('depreciação'))
      .reduce((sum, item) => sum + Number(item.amount), 0);
    
    return totalIncome - operationalExpenses;
  };

  const calculateROI = () => {
    // ROI = (Lucro Líquido / Investimento Total) * 100
    // Para simplificar: (Lucro Líquido / Despesas Totais) * 100
    const netProfit = calculateNetProfit();
    const totalExpenses = calculateTotalExpenses();
    
    if (totalExpenses === 0) return 0;
    
    // ROI baseado no retorno sobre despesas
    return (netProfit / totalExpenses) * 100;
  };

  const calculateCashBalance = () => {
    // Saldo de caixa atual = soma de todas as receitas - soma de todas as despesas
    return calculateNetProfit();
  };

  const getPreviousPeriodMetrics = () => {
    // Calcular métricas do período anterior para comparação
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Período anterior (mês passado)
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    const previousPeriodData = financialData.filter((item) => {
      const itemDate = new Date(item.date);
      return itemDate.getMonth() === previousMonth && itemDate.getFullYear() === previousYear;
    });
    
    const previousIncome = previousPeriodData
      .filter((item) => item.type === "INCOME")
      .reduce((sum, item) => sum + Number(item.amount), 0);
    
    const previousExpenses = previousPeriodData
      .filter((item) => item.type === "EXPENSE")
      .reduce((sum, item) => sum + Number(item.amount), 0);
    
    const previousEBITDA = previousIncome - previousExpenses;
    const previousROI = previousExpenses > 0 ? ((previousIncome - previousExpenses) / previousExpenses) * 100 : 0;
    const previousCash = previousIncome - previousExpenses;
    
    return {
      ebitda: previousEBITDA,
      roi: previousROI,
      cash: previousCash
    };
  };

  const getMetricsGrowth = () => {
    const currentEBITDA = calculateEBITDA();
    const currentROI = calculateROI();
    const currentCash = calculateCashBalance();
    
    const previous = getPreviousPeriodMetrics();
    
    const ebitdaGrowth = previous.ebitda !== 0 
      ? ((currentEBITDA - previous.ebitda) / Math.abs(previous.ebitda)) * 100 
      : 0;
    
    const roiGrowth = currentROI - previous.roi;
    
    const cashGrowth = previous.cash !== 0 
      ? ((currentCash - previous.cash) / Math.abs(previous.cash)) * 100 
      : 0;
    
    return {
      ebitda: ebitdaGrowth,
      roi: roiGrowth,
      cash: cashGrowth
    };
  };

  const handleRunSimulation = () => {
    toast.success("Simulação iniciada com sucesso");
  };

  // Main Revenue and Expense Chart Component - Compact version
  const RevenueExpenseChart = () => (
    <Card className="h-auto">
      <CardHeader className="pb-3 pt-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">Receita e Despesa</CardTitle>
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
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={getRevenueExpenseData()}
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
          <CardTitle className="text-lg font-semibold">Rentabilidade por parcela</CardTitle>
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
      <CardContent className="h-80">
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
              data={[]}
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
          <CardTitle className="text-lg font-semibold">Receitas e Despesas mensais</CardTitle>
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
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart
            data={getMonthlyRevenueExpenseData()}
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
          <CardTitle className="text-lg font-semibold">Previsão Financeira</CardTitle>
          <div className="flex gap-1.5">
            <Select value={forecastDuration} onValueChange={setForecastDuration}>
              <SelectTrigger className="w-[90px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 meses</SelectItem>
                <SelectItem value="6">6 meses</SelectItem>
                <SelectItem value="12">12 meses</SelectItem>
                <SelectItem value="24">24 meses</SelectItem>
              </SelectContent>
            </Select>

            <Select value={forecastModel} onValueChange={setForecastModel}>
              <SelectTrigger className="w-[110px]">
                <SelectValue placeholder="Modelo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Básico</SelectItem>
                <SelectItem value="seasonal">Sazonal</SelectItem>
                <SelectItem value="advanced">Avançado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={[]}
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
          <CardTitle className="text-lg font-semibold">Margem Líquida</CardTitle>
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
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={[]}
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
          <CardTitle className="text-lg font-semibold">Fluxo de Caixa</CardTitle>
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
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={getCashFlowProjection()}
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
        <CardTitle className="text-lg font-semibold">Parâmetros de Simulação</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium">Receitas</Label>
                <span className="text-sm font-medium">
                  {revenueFactor[0]}%
                </span>
              </div>
              <Slider
                value={revenueFactor}
                onValueChange={setRevenueFactor}
                min={70}
                max={130}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium">Despesas</Label>
                <span className="text-sm font-medium">
                  {expenseFactor[0]}%
                </span>
              </div>
              <Slider
                value={expenseFactor}
                onValueChange={setExpenseFactor}
                min={70}
                max={130}
                step={1}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Cenário</Label>
              <Select
                value={revenueScenario}
                onValueChange={setRevenueScenario}
              >
              <SelectTrigger>
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
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium" size="sm" onClick={handleRunSimulation}>
                <Calculator className="h-4 w-4 mr-2" />
                Simular
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Projected Results Component - Compact version with real data
  const ProjectedResults = () => {
    const ebitda = calculateEBITDA();
    const roi = calculateROI();
    const cash = calculateCashBalance();
    const growth = getMetricsGrowth();
    
    const formatCurrency = (value: number) => {
      if (Math.abs(value) >= 1000000) {
        return `R$ ${(value / 1000000).toFixed(1)}M`;
      } else if (Math.abs(value) >= 1000) {
        return `R$ ${(value / 1000).toFixed(1)}k`;
      }
      return `R$ ${value.toFixed(2)}`;
    };
    
    const formatPercentage = (value: number) => {
      return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
    };
    
    const formatROI = (value: number) => {
      return `${value.toFixed(1)}%`;
    };
    
    return (
      <div className="grid grid-cols-3 gap-2">
        <Card className="h-auto">
          <CardContent className="p-3">
            <p className="text-muted-foreground text-xs font-medium mb-1">
              EBITDA
            </p>
            <p className="text-base font-bold">{formatCurrency(ebitda)}</p>
            <div className={`flex items-center space-x-1 text-xs mt-1 ${growth.ebitda >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {growth.ebitda >= 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span>{formatPercentage(growth.ebitda)}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="h-auto">
          <CardContent className="p-3">
            <p className="text-muted-foreground text-xs font-medium mb-1">
              ROI
            </p>
            <p className="text-base font-bold">{formatROI(roi)}</p>
            <div className={`flex items-center space-x-1 text-xs mt-1 ${growth.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {growth.roi >= 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span>{growth.roi >= 0 ? '+' : ''}{growth.roi.toFixed(1)}pts</span>
            </div>
          </CardContent>
        </Card>

        <Card className="h-auto">
          <CardContent className="p-3">
            <p className="text-muted-foreground text-xs font-medium mb-1">
              Caixa
            </p>
            <p className="text-base font-bold">{formatCurrency(cash)}</p>
            <div className={`flex items-center space-x-1 text-xs mt-1 ${growth.cash >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {growth.cash >= 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span>{formatPercentage(growth.cash)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Recent Transactions Table Component - Compact version
  const RecentTransactionsTable = () => (
    <Card className="h-auto">
      <CardHeader className="pb-3 pt-4">
        <CardTitle className="text-lg font-semibold">Transações Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Descrição</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Categoria</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Data</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Valor</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-muted-foreground text-sm">
                    Carregando...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-red-600 text-sm">
                    {error}
                  </td>
                </tr>
              ) : getRecentTransactions().length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-muted-foreground text-sm">
                    Nenhuma transação encontrada
                  </td>
                </tr>
              ) : (
                getRecentTransactions().map((transaction) => (
                  <tr key={transaction.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className={`p-1.5 rounded-full mr-3 ${transaction.type === 'INCOME' ? 'bg-green-100' : 'bg-red-100'}`}>
                          <DollarSign className={`h-4 w-4 ${transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`} />
                        </div>
                        <span className="font-medium">{transaction.description}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="text-xs">
                        {transaction.category}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className={`py-3 px-4 text-right font-semibold ${transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'INCOME' ? '+' : '-'} R$ {Number(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              )}
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
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportData}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Exportar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setImportDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Importar
              </Button>
              <Button
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                size="sm"
                onClick={handleAddTransaction}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Transação
              </Button>
            </div>
          }
          filterArea={
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-full md:w-[140px]">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="this-month">Este mês</SelectItem>
                  <SelectItem value="last-month">Mês passado</SelectItem>
                  <SelectItem value="last-quarter">Últ. trim.</SelectItem>
                  <SelectItem value="this-year">Este ano</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          }
        />

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Receitas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <p className="text-2xl font-bold text-green-600">
                  R$ {calculateTotalIncome().toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Despesas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <p className="text-2xl font-bold text-red-600">
                  R$ {calculateTotalExpenses().toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <TrendingDown className="h-5 w-5 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Lucro Líquido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <p className={`text-2xl font-bold ${calculateNetProfit() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R$ {calculateNetProfit().toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                {calculateNetProfit() >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-green-600" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-600" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

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
      
      <AddTransactionDialog
        open={addTransactionOpen}
        onOpenChange={setAddTransactionOpen}
        onSuccess={handleTransactionAdded}
      />
      
      <ImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onImport={handleImportData}
        acceptedFileTypes=".csv,.xlsx,.xls"
        title="Importar Transações Financeiras"
        description="Selecione um arquivo CSV ou Excel com as transações"
      />
    </PageLayout>
  );
};

export default FinancialManagementPage;