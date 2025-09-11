import React, { useState, useEffect } from "react";
import PageLayout from "../components/layout/PageLayout";
import { FinancialTracking } from "../components/FinancialTracking";
import PageHeader from "../components/layout/PageHeader";
import usePageMetadata from "../hooks/use-page-metadata";
import TabContainer, { TabItem } from "../components/layout/TabContainer";
import { Button } from "@/components/ui/button";
import {
  Download,
  Upload,
  PieChart,
  BarChart,
  CreditCard,
  DollarSign,
  Filter,
  CalendarRange,
  Plus,
  FileText,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { EditableField } from "@/components/ui/editable-field";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import FinancialCharts from "../components/statistics/FinancialCharts";
import FinancialForecast from "../components/statistics/FinancialForecast";
import BudgetPlanning from "../components/BudgetPlanning";
import { toast } from "sonner";
import useSpacing from "../hooks/use-spacing";

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

interface BudgetData {
  id: number;
  category: string;
  allocated: number;
  spent: number;
  remaining: number;
  period: string;
}

const FinancialManagementPage = () => {
  const spacing = useSpacing();
  const { toast: uiToast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("this-month");
  const [financialData, setFinancialData] = useState<FinancialData[]>([]);
  const [budgetData, setBudgetData] = useState<BudgetData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showAddTransaction, setShowAddTransaction] = useState<boolean>(false);
  const [showAddBudget, setShowAddBudget] = useState<boolean>(false);

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

  // Mock data initialization
  useEffect(() => {
    const loadFinancialData = () => {
      setIsLoading(true);
      
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

      // Mock budget data
      const mockBudgetData: BudgetData[] = [
        {
          id: 1,
          category: "Insumos",
          allocated: 5000.0,
          spent: 3200.0,
          remaining: 1800.0,
          period: "Junho 2023",
        },
        {
          id: 2,
          category: "Mão de obra",
          allocated: 6000.0,
          spent: 4500.0,
          remaining: 1500.0,
          period: "Junho 2023",
        },
        {
          id: 3,
          category: "Manutenção",
          allocated: 2500.0,
          spent: 1800.0,
          remaining: 700.0,
          period: "Junho 2023",
        },
        {
          id: 4,
          category: "Equipamentos",
          allocated: 10000.0,
          spent: 0.0,
          remaining: 10000.0,
          period: "Junho 2023",
        },
      ];

      setFinancialData(mockFinancialData);
      setBudgetData(mockBudgetData);
      setIsLoading(false);
    };

    loadFinancialData();
  }, []);

  const handleExportData = () => {
    toast.success("Dados financeiros exportados com sucesso");
    console.log("Exportando dados financeiros...");
  };

  const handleImportData = () => {
    toast.info("Funcionalidade de importação em desenvolvimento");
    console.log("Importando dados financeiros...");
  };

  const handleAddTransaction = () => {
    setShowAddTransaction(true);
    console.log("Abrindo formulário para adicionar transação");
  };

  const handleAddBudget = () => {
    setShowAddBudget(true);
    console.log("Abrindo formulário para adicionar orçamento");
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case "income":
        return "text-green-600";
      case "expense":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const calculateTotalIncome = () => {
    return financialData
      .filter((item) => item.type === "income")
      .reduce((sum, item) => sum + item.amount, 0);
  };

  const calculateTotalExpenses = () => {
    return financialData
      .filter((item) => item.type === "expense")
      .reduce((sum, item) => sum + item.amount, 0);
  };

  const calculateNetProfit = () => {
    return calculateTotalIncome() - calculateTotalExpenses();
  };

  const getBudgetStatus = (spent: number, allocated: number) => {
    const percentage = (spent / allocated) * 100;
    if (percentage > 90) return "critical";
    if (percentage > 75) return "warning";
    return "good";
  };

  const getBudgetStatusColor = (status: string) => {
    switch (status) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "good":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const renderOverviewTab = () => (
    <div className={spacing.getFormContainerClasses()}>
      {/* Financial Summary Cards */}
      <div className={spacing.getGridContainerClasses({ mobile: 1, tablet: 2, desktop: 4 })}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Receita Total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {calculateTotalIncome().toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              +12% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Despesas Totais
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {calculateTotalExpenses().toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              +5% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Lucro Líquido
            </CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${calculateNetProfit() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              R$ {calculateNetProfit().toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              {calculateNetProfit() >= 0 ? '+' : ''}{((calculateNetProfit() / calculateTotalIncome()) * 100).toFixed(1)}% da receita
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Margem de Lucro
            </CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {calculateTotalIncome() > 0 
                ? ((calculateNetProfit() / calculateTotalIncome()) * 100).toFixed(1) 
                : '0.0'}%
            </div>
            <p className="text-xs text-muted-foreground">
              {calculateNetProfit() >= 0 ? 'Lucro positivo' : 'Prejuízo'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Financial Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Receitas e Despesas</CardTitle>
            <CardDescription>
              Comparação mensal de receitas e despesas
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <FinancialCharts />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Previsão Financeira</CardTitle>
            <CardDescription>
              Projeção de fluxo de caixa para os próximos meses
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <FinancialForecast />
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Transações Recentes</CardTitle>
          <CardDescription>
            Últimas movimentações financeiras registradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {financialData.slice(0, 5).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-full ${transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
                    <DollarSign className={`h-4 w-4 ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`} />
                  </div>
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {transaction.date} • {transaction.category}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.type === 'income' ? '+' : '-'} R$ {transaction.amount.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                  <Badge className={getStatusColor(transaction.status)}>
                    {transaction.status === 'completed' ? 'Concluído' : 
                     transaction.status === 'pending' ? 'Pendente' : 'Cancelado'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTransactionsTab = () => (
    <div className={spacing.getFormContainerClasses()}>
      <Card>
        <CardHeader>
          <CardTitle>Registro de Transações</CardTitle>
          <CardDescription>
            Gerencie todas as receitas e despesas da propriedade
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FinancialTracking />
        </CardContent>
      </Card>
    </div>
  );

  const renderBudgetTab = () => (
    <div className={spacing.getFormContainerClasses()}>
      <Card>
        <CardHeader>
          <CardTitle>Planejamento Orçamentário</CardTitle>
          <CardDescription>
            Defina e acompanhe orçamentos por categoria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BudgetPlanning />
        </CardContent>
      </Card>
    </div>
  );

  const tabs: TabItem[] = [
    {
      value: "overview",
      label: "Visão Geral",
      content: renderOverviewTab(),
    },
    {
      value: "transactions",
      label: "Transações",
      content: renderTransactionsTab(),
    },
    {
      value: "budget",
      label: "Orçamento",
      content: renderBudgetTab(),
    },
  ];

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    console.log(`Aba "${value}" selecionada`);
  };

  return (
    <PageLayout>
      <div className={spacing.getPageContainerClasses()}>
        <PageHeader
          title={title}
          description={description}
          onTitleChange={handleTitleChange}
          onDescriptionChange={handleDescriptionChange}
          actions={
            <div className={spacing.getActionButtonGroupClasses()}>
              <Button
                variant="outline"
                onClick={handleExportData}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Exportar
              </Button>
              <Button
                variant="outline"
                onClick={handleImportData}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Importar
              </Button>
              <Button
                onClick={handleAddTransaction}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Nova Transação
              </Button>
            </div>
          }
          filterArea={
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="this-month">Este mês</SelectItem>
                  <SelectItem value="last-month">Mês passado</SelectItem>
                  <SelectItem value="last-quarter">Último trimestre</SelectItem>
                  <SelectItem value="this-year">Este ano</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          }
        />

        <TabContainer
          tabs={tabs}
          defaultValue={activeTab}
          onValueChange={handleTabChange}
        />

        {/* Add Transaction Dialog */}
        <Dialog open={showAddTransaction} onOpenChange={setShowAddTransaction}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Adicionar Nova Transação</DialogTitle>
              <DialogDescription>
                Registre uma nova receita ou despesa
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="description" className="text-right">
                  Descrição
                </label>
                <input
                  id="description"
                  className="col-span-3 border rounded p-2"
                  placeholder="Descrição da transação"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="amount" className="text-right">
                  Valor
                </label>
                <input
                  id="amount"
                  type="number"
                  className="col-span-3 border rounded p-2"
                  placeholder="0.00"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="category" className="text-right">
                  Categoria
                </label>
                <select id="category" className="col-span-3 border rounded p-2">
                  <option value="Receita agrícola">Receita agrícola</option>
                  <option value="Insumos">Insumos</option>
                  <option value="Mão de obra">Mão de obra</option>
                  <option value="Manutenção">Manutenção</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddTransaction(false)}>
                Cancelar
              </Button>
              <Button onClick={() => {
                setShowAddTransaction(false);
                toast.success("Transação adicionada com sucesso");
              }}>
                Adicionar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Budget Dialog */}
        <Dialog open={showAddBudget} onOpenChange={setShowAddBudget}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Orçamento</DialogTitle>
              <DialogDescription>
                Defina um novo orçamento para uma categoria
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="budget-category" className="text-right">
                  Categoria
                </label>
                <input
                  id="budget-category"
                  className="col-span-3 border rounded p-2"
                  placeholder="Categoria do orçamento"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="allocated" className="text-right">
                  Valor Alocado
                </label>
                <input
                  id="allocated"
                  type="number"
                  className="col-span-3 border rounded p-2"
                  placeholder="0.00"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="period" className="text-right">
                  Período
                </label>
                <input
                  id="period"
                  className="col-span-3 border rounded p-2"
                  placeholder="Ex: Junho 2023"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddBudget(false)}>
                Cancelar
              </Button>
              <Button onClick={() => {
                setShowAddBudget(false);
                toast.success("Orçamento adicionado com sucesso");
              }}>
                Adicionar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  );
};

export default FinancialManagementPage;
