import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { EditableField } from "@/components/ui/editable-field";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import {
  CalendarIcon,
  PlusCircle,
  Download,
  Printer,
  Trash2,
  FileText,
  RefreshCw
} from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { PageHeader } from "@/shared/components/layout";
import { useCRM } from "@/contexts/CRMContext";

// Schema for transaction form
const transactionSchema = z.object({
  date: z.string().min(1, "A data é obrigatória"),
  description: z.string().min(3, "Descrição muito curta"),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) !== 0, {
    message: "Valor inválido",
  }),
  category: z.string().min(1, "A categoria é obrigatória"),
  type: z.enum(["income", "expense"]),
  cropId: z.string().optional(),
  quantity: z.string().optional(),
  unit: z.string().optional(),
  unitPrice: z.string().optional(),
  paymentMethod: z.string().optional(),
  notes: z.string().optional(),
});

// Generate monthly data based on actual transactions
const generateMonthlyData = (transactions: any[]) => {
  // Create an array with the last 12 months
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const monthlyData = [];
  
  // Initialize with zero values for all months
  for (let i = 0; i < 12; i++) {
    monthlyData.push({
      name: months[i],
      income: 0,
      expenses: 0
    });
  }
  
  // Process transactions to populate monthly data
  transactions.forEach(transaction => {
    const date = new Date(transaction.date);
    const monthIndex = date.getMonth(); // 0-11
    
    if (monthIndex < 12) {
      if (transaction.type === 'income') {
        monthlyData[monthIndex].income += transaction.amount;
      } else {
        monthlyData[monthIndex].expenses += transaction.amount;
      }
    }
  });
  
  return monthlyData;
};

const FinancialTracking = () => {
  const { getModuleData, syncDataAcrossCRM, isRefreshing, addData } = useCRM();
  // State for editable content
  const [title, setTitle] = useState("Controle Financeiro");
  const [description, setDescription] = useState(
    "Gerencie suas receitas e despesas para otimizar a rentabilidade da sua exploração"
  );

  // State for transactions
  const [transactions, setTransactions] = useState<any[]>([]);
  
  // Generate monthly data based on transactions
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  
  // Obter dados de finanças do contexto CRM
  const financeModuleData = getModuleData('finances').items || [];
  
  // Converter dados do backend para o formato esperado
  useEffect(() => {
    const convertedTransactions = financeModuleData.map((item: any) => ({
      id: item.id,
      date: item.date ? new Date(item.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      description: item.description || 'Transação sem descrição',
      amount: item.amount || 0,
      category: item.category || 'Não categorizado',
      type: item.type === 'revenue' || item.type === 'income' ? 'income' : 'expense',
    }));
    
    setTransactions(convertedTransactions);
    
    // Generate monthly data
    const generatedMonthlyData = generateMonthlyData(convertedTransactions);
    setMonthlyData(generatedMonthlyData);
  }, [financeModuleData]);
  
  const handleRefresh = () => {
    syncDataAcrossCRM();
    toast.success('Dados financeiros atualizados');
  };

  // Filter and stats
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");

  // Dialog state
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Get crops data for selection
  const cropsData = getModuleData('cultures')?.items || [];
  
  // Form handling with react-hook-form
  const form = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      description: "",
      amount: "",
      category: "",
      type: "income" as "income" | "expense",
      cropId: "",
      quantity: "",
      unit: "",
      unitPrice: "",
      paymentMethod: "",
      notes: "",
    },
  });

  // Categories for filtering
  const categories = ["all", ...new Set(transactions.map((t) => t.category))];

  // Calculate totals
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  // Filter transactions based on selected filters
  const filteredTransactions = transactions
    .filter((t) => {
      const matchesCategory =
        categoryFilter === "all" || t.category === categoryFilter;
      const matchesType = typeFilter === "all" || t.type === typeFilter;
      return matchesCategory && matchesType;
    })
    .sort((a, b) => {
      if (sortBy === "date") {
        return sortOrder === "asc"
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (sortBy === "amount") {
        return sortOrder === "asc" ? a.amount - b.amount : b.amount - a.amount;
      }
      return 0;
    });

  // Handle form submission
  const onSubmit = async (data: z.infer<typeof transactionSchema>) => {
    try {
      const transactionData = {
        type: data.type === 'income' ? 'INCOME' : 'EXPENSE',
        category: data.category,
        amount: parseFloat(data.amount),
        description: data.description,
        date: data.date,
        cropId: data.cropId || undefined,
        // Additional fields for detailed tracking (stored in description or notes if needed)
        ...(data.quantity && { quantity: parseFloat(data.quantity) }),
        ...(data.unit && { unit: data.unit }),
        ...(data.unitPrice && { unitPrice: parseFloat(data.unitPrice) }),
        ...(data.paymentMethod && { paymentMethod: data.paymentMethod }),
        ...(data.notes && { notes: data.notes }),
      };

      await addData('finances', transactionData);
      setShowAddDialog(false);
      form.reset();
      toast.success("Transação financeira registrada com sucesso!");
      syncDataAcrossCRM();
    } catch (error: any) {
      console.error('Error adding transaction:', error);
      toast.error(error.message || "Erro ao registrar transação. Tente novamente.");
    }
  };

  // Handle delete transaction
  const handleDeleteTransaction = (id: number) => {
    setTransactions(transactions.filter((t) => t.id !== id));
    toast.success("Transação removida");
  };

  // Handle edit transaction
  const handleUpdateTransaction = (id: number, field: string, value: any) => {
    setTransactions(
      transactions.map((t) =>
        t.id === id
          ? { ...t, [field]: field === "amount" ? parseFloat(value) : value }
          : t
      )
    );
    toast.success("Transação atualizada");
  };

  // Export to CSV
  const exportToCSV = () => {
    // Create CSV content
    const headers = ["Data", "Descrição", "Valor", "Categoria", "Tipo"];
    const rows = transactions.map((t) => [
      t.date,
      t.description,
      t.amount.toString(),
      t.category,
      t.type === "income" ? "Receita" : "Despesa",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `transacoes_${new Date().toISOString().slice(0, 10)}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Dados exportados para CSV");
  };

  // Print transactions
  const printTransactions = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Não foi possível abrir a janela de impressão");
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Transações Financeiras</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f2f2f2; }
            .income { color: green; }
            .expense { color: red; }
            h2 { margin-bottom: 5px; }
            .summary { margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <h1>Transações Financeiras</h1>
          <div class="summary">
            <p>Receitas totais: <b>R$ ${totalIncome.toFixed(2)}</b></p>
            <p>Despesas totais: <b>R$ ${totalExpenses.toFixed(2)}</b></p>
            <p>Saldo: <b class="${
              balance >= 0 ? "income" : "expense"
            }">R$ ${balance.toFixed(2)}</b></p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Descrição</th>
                <th>Valor</th>
                <th>Categoria</th>
                <th>Tipo</th>
              </tr>
            </thead>
            <tbody>
              ${transactions
                .map(
                  (t) => `
                <tr>
                  <td>${new Date(t.date).toLocaleDateString()}</td>
                  <td>${t.description}</td>
                  <td class="${
                    t.type === "income" ? "income" : "expense"
                  }">R$ ${t.amount.toFixed(2)}</td>
                  <td>${t.category}</td>
                  <td>${t.type === "income" ? "Receita" : "Despesa"}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    toast.success("Impressão preparada");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={description}
        onTitleChange={(value) => {
          setTitle(String(value));
          toast.success("Título atualizado");
        }}
        onDescriptionChange={(value) => {
          setDescription(String(value));
          toast.success("Descrição atualizada");
        }}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Receitas</CardTitle>
            <CardDescription>Total de entradas</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              R$ {totalIncome.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Despesas</CardTitle>
            <CardDescription>Total de saídas</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              R$ {totalExpenses.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Saldo</CardTitle>
            <CardDescription>Receitas - Despesas</CardDescription>
          </CardHeader>
          <CardContent>
            <p
              className={`text-2xl font-bold ${
                balance >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              R$ {balance.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card">
          <CardHeader>
            <CardTitle>Visão Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [`R$ ${value}`, ""]}
                    labelFormatter={(label) => `Mês: ${label}`}
                  />
                  <Bar
                    name="Receitas"
                    dataKey="income"
                    fill="#4ade80"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    name="Despesas"
                    dataKey="expenses"
                    fill="#f87171"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Transações Recentes</CardTitle>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Atualizando...' : 'Atualizar'}
              </Button>
              <Button variant="outline" size="sm" onClick={exportToCSV}>
                <Download className="h-4 w-4 mr-1" />
                Exportar
              </Button>
              <Button variant="outline" size="sm" onClick={printTransactions}>
                <Printer className="h-4 w-4 mr-1" />
                Imprimir
              </Button>
              <Button onClick={() => setShowAddDialog(true)} size="sm">
                <PlusCircle className="h-4 w-4 mr-1" />
                Adicionar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2 mb-4">
              <select
                className="px-3 py-1 border rounded-md text-sm"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">Todos os tipos</option>
                <option value="income">Receitas</option>
                <option value="expense">Despesas</option>
              </select>

              <select
                className="px-3 py-1 border rounded-md text-sm"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === "all" ? "Todas as categorias" : cat}
                  </option>
                ))}
              </select>

              <select
                className="px-3 py-1 border rounded-md text-sm ml-auto"
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split("-");
                  setSortBy(field);
                  setSortOrder(order as "asc" | "desc");
                }}
              >
                <option value="date-desc">Data (recente)</option>
                <option value="date-asc">Data (antigo)</option>
                <option value="amount-desc">Valor (alto)</option>
                <option value="amount-asc">Valor (baixo)</option>
              </select>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="border rounded-lg p-3 flex flex-col sm:flex-row sm:items-center gap-2"
                  >
                    <div
                      className={`rounded-full h-8 w-8 flex items-center justify-center ${
                        transaction.type === "income"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      <FileText className="h-4 w-4" />
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                        <EditableField
                          value={new Date(
                            transaction.date
                          ).toLocaleDateString()}
                          type="date"
                          onSave={(value) =>
                            handleUpdateTransaction(
                              transaction.id,
                              "date",
                              typeof value === "string"
                                ? value
                                : new Date(value).toISOString().split("T")[0]
                            )
                          }
                          className="text-sm font-medium"
                        />
                        <span className="hidden sm:inline text-muted-foreground">
                          •
                        </span>
                        <EditableField
                          value={transaction.category}
                          onSave={(value) =>
                            handleUpdateTransaction(
                              transaction.id,
                              "category",
                              value
                            )
                          }
                          className="text-xs bg-muted px-2 py-1 rounded"
                        />
                      </div>
                      <EditableField
                        value={transaction.description}
                        onSave={(value) =>
                          handleUpdateTransaction(
                            transaction.id,
                            "description",
                            value
                          )
                        }
                        className="text-muted-foreground text-sm mt-1"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <EditableField
                        value={transaction.amount}
                        type="number"
                        onSave={(value) =>
                          handleUpdateTransaction(
                            transaction.id,
                            "amount",
                            value
                          )
                        }
                        className={`font-semibold ${
                          transaction.type === "income"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1"
                        onClick={() => handleDeleteTransaction(transaction.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma transação encontrada
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Transaction Dialog - Enhanced */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Registrar Transação Financeira</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Preencha os dados detalhados da transação financeira
            </p>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Tipo de Transação */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">Tipo de Transação *</FormLabel>
                    <div className="flex gap-3 mt-2">
                      <Button
                        type="button"
                        variant={field.value === "income" ? "default" : "outline"}
                        className={`flex-1 h-12 text-base ${
                          field.value === "income"
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : "border-2"
                        }`}
                        onClick={() => field.onChange("income")}
                      >
                        💰 Receita / Venda
                      </Button>
                      <Button
                        type="button"
                        variant={field.value === "expense" ? "default" : "outline"}
                        className={`flex-1 h-12 text-base ${
                          field.value === "expense"
                            ? "bg-red-600 hover:bg-red-700 text-white"
                            : "border-2"
                        }`}
                        onClick={() => field.onChange("expense")}
                      >
                        💸 Despesa / Pagamento
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                {/* Data */}
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data da Transação *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input type="date" {...field} className="h-10" />
                          <CalendarIcon className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Valor Total */}
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor Total (R$) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          className="h-10"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Categoria */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria *</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {form.watch("type") === "income" ? (
                            <>
                              <SelectItem value="Venda de Produtos">Venda de Produtos</SelectItem>
                              <SelectItem value="Venda de Cultura">Venda de Cultura</SelectItem>
                              <SelectItem value="Subsídios">Subsídios</SelectItem>
                              <SelectItem value="Outras Receitas">Outras Receitas</SelectItem>
                            </>
                          ) : (
                            <>
                              <SelectItem value="Insumos Agrícolas">Insumos Agrícolas</SelectItem>
                              <SelectItem value="Mão de Obra">Mão de Obra</SelectItem>
                              <SelectItem value="Equipamentos">Equipamentos</SelectItem>
                              <SelectItem value="Manutenção">Manutenção</SelectItem>
                              <SelectItem value="Combustível">Combustível</SelectItem>
                              <SelectItem value="Outras Despesas">Outras Despesas</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Seleção de Cultura */}
              {cropsData.length > 0 && (
                <FormField
                  control={form.control}
                  name="cropId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Relacionado à Cultura (Opcional)</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value || ""}
                          onValueChange={(value) => field.onChange(value || undefined)}
                        >
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Selecione uma cultura (opcional)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Nenhuma cultura</SelectItem>
                            {cropsData.map((crop: any) => (
                              <SelectItem key={crop.id} value={crop.id}>
                                {crop.name} {crop.variety ? `- ${crop.variety}` : ''}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <p className="text-xs text-muted-foreground">
                        Associe esta transação a uma cultura específica
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Detalhes Adicionais para Vendas */}
              {form.watch("type") === "income" && (
                <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-900">Detalhes da Venda</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantidade</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="Ex: 100"
                              {...field}
                              className="h-10"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="unit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unidade</FormLabel>
                          <FormControl>
                            <Select value={field.value || ""} onValueChange={field.onChange}>
                              <SelectTrigger className="h-10">
                                <SelectValue placeholder="Unidade" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="kg">kg</SelectItem>
                                <SelectItem value="ton">ton</SelectItem>
                                <SelectItem value="saco">saco</SelectItem>
                                <SelectItem value="un">un</SelectItem>
                                <SelectItem value="ha">ha</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="unitPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preço Unitário (R$)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                              className="h-10"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Detalhes Adicionais para Pagamentos */}
              {form.watch("type") === "expense" && (
                <div className="space-y-4 p-4 bg-red-50 rounded-lg border border-red-200">
                  <h4 className="font-semibold text-red-900">Detalhes do Pagamento</h4>
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Forma de Pagamento</FormLabel>
                        <FormControl>
                          <Select value={field.value || ""} onValueChange={field.onChange}>
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder="Selecione a forma de pagamento" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                              <SelectItem value="PIX">PIX</SelectItem>
                              <SelectItem value="Transferência Bancária">Transferência Bancária</SelectItem>
                              <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
                              <SelectItem value="Cartão de Débito">Cartão de Débito</SelectItem>
                              <SelectItem value="Boleto">Boleto</SelectItem>
                              <SelectItem value="Cheque">Cheque</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Descrição */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Descreva a transação em detalhes"
                        {...field}
                        className="h-10"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Observações */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações Adicionais</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Adicione informações complementares, notas ou observações relevantes..."
                        {...field}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddDialog(false);
                    form.reset();
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="min-w-[120px]">
                  Salvar Transação
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FinancialTracking;
export { FinancialTracking };
