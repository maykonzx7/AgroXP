import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  ReferenceLine,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Calculator, RefreshCw, TrendingUp, Share2 } from "lucide-react";

// Dados de previsão para os próximos 12 meses
const forecastData = [
  {
    month: "Jan",
    revenue: 28500,
    expenses: 20100,
    forecast: 8400,
    previous: 7200,
  },
  {
    month: "Fev",
    revenue: 30200,
    expenses: 21800,
    forecast: 8400,
    previous: 7500,
  },
  {
    month: "Mar",
    revenue: 32800,
    expenses: 22400,
    forecast: 10400,
    previous: 8200,
  },
  {
    month: "Abr",
    revenue: 35500,
    expenses: 23100,
    forecast: 12400,
    previous: 9200,
  },
  {
    month: "Mai",
    revenue: 38200,
    expenses: 23500,
    forecast: 14700,
    previous: 10700,
  },
  {
    month: "Jun",
    revenue: 37800,
    expenses: 22900,
    forecast: 14900,
    previous: 11200,
  },
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

// Dados de projeção de fluxo de caixa
const cashFlowProjection = [
  { month: "Jan", inflow: 28500, outflow: 20100, balance: 8400 },
  { month: "Fev", inflow: 30200, outflow: 21800, balance: 16800 },
  { month: "Mar", inflow: 32800, outflow: 22400, balance: 27200 },
  { month: "Abr", inflow: 35500, outflow: 23100, balance: 39600 },
  { month: "Mai", inflow: 38200, outflow: 23500, balance: 54300 },
  { month: "Jun", inflow: 37800, outflow: 22900, balance: 69200 },
  { month: "Jul", inflow: 42500, outflow: 24200, balance: 87500 },
  { month: "Ago", inflow: 44800, outflow: 25300, balance: 107000 },
  { month: "Set", inflow: 40200, outflow: 24800, balance: 122400 },
  { month: "Out", inflow: 38200, outflow: 23100, balance: 137500 },
  { month: "Nov", inflow: 36500, outflow: 22500, balance: 151500 },
  { month: "Dez", inflow: 41200, outflow: 25800, balance: 166900 },
];

const FinancialForecast = () => {
  const [forecastDuration, setForecastDuration] = useState<string>("12");
  const [revenueFactor, setRevenueFactor] = useState<number[]>([100]);
  const [expenseFactor, setExpenseFactor] = useState<number[]>([100]);
  const [revenueScenario, setRevenueScenario] = useState<string>("stable");
  const [forecastModel, setForecastModel] = useState<string>("basic");

  const handleRefreshForecast = () => {
    toast.info("Atualizando previsões financeiras");
    // Em um aplicativo real, isso recalcularia as previsões com base nos fatores selecionados
  };

  const handleShareForecast = () => {
    toast.success("Previsões compartilhadas por e-mail");
  };

  const handleRunSimulation = () => {
    toast.success("Simulação iniciada com sucesso");
    // Em um aplicativo real, isso executaria um modelo de previsão mais sofisticado
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold">Previsões Financeiras</h2>
          <p className="text-muted-foreground">
            Projeções para {forecastDuration} meses baseadas nos dados históricos
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={forecastDuration} onValueChange={setForecastDuration}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Duração" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3 meses</SelectItem>
              <SelectItem value="6">6 meses</SelectItem>
              <SelectItem value="12">12 meses</SelectItem>
              <SelectItem value="24">24 meses</SelectItem>
            </SelectContent>
          </Select>

          <Select value={forecastModel} onValueChange={setForecastModel}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Modelo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="basic">Modelo básico</SelectItem>
              <SelectItem value="seasonal">Modelo sazonal</SelectItem>
              <SelectItem value="advanced">Modelo avançado</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={handleRefreshForecast} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>

          <Button onClick={handleShareForecast} variant="outline">
            <Share2 className="h-4 w-4 mr-2" />
            Compartilhar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Margem líquida projetada</CardTitle>
            <CardDescription>
              Comparação com o ano anterior
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={forecastData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => {
                      if (name === "forecast")
                        return [`R$ ${value.toLocaleString()}`, "Previsão"];
                      if (name === "previous")
                        return [
                          `R$ ${value.toLocaleString()}`,
                          "Ano anterior",
                        ];
                      return [`R$ ${value.toLocaleString()}`, name];
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="forecast"
                    stroke="#4CAF50"
                    strokeWidth={2}
                    name="Previsão"
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="previous"
                    stroke="#9E9E9E"
                    strokeDasharray="5 5"
                    name="Ano anterior"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Previsão de fluxo de caixa</CardTitle>
            <CardDescription>Evolução do saldo de caixa</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={cashFlowProjection}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [`R$ ${value.toLocaleString()}`, ""]}
                  />
                  <Legend />
                  <ReferenceLine y={0} stroke="#000" />
                  <Area
                    type="monotone"
                    dataKey="balance"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.3}
                    name="Saldo de caixa"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Parâmetros de simulação</CardTitle>
          <CardDescription>
            Ajuste os fatores para observar seu impacto nas previsões
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Evolução das receitas</Label>
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
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>-30%</span>
                    <span>Estável</span>
                    <span>+30%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Evolução das despesas</Label>
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
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>-30%</span>
                    <span>Estável</span>
                    <span>+30%</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Cenário de receitas</Label>
                  <Select
                    value={revenueScenario}
                    onValueChange={setRevenueScenario}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Cenário" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="optimistic">
                        Otimista (+15%)
                      </SelectItem>
                      <SelectItem value="stable">Estável (±0%)</SelectItem>
                      <SelectItem value="pessimistic">
                        Pessimista (-15%)
                      </SelectItem>
                      <SelectItem value="seasonal">
                        Sazonal (variações)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button className="w-full" onClick={handleRunSimulation}>
                    <Calculator className="h-4 w-4 mr-2" />
                    Executar simulação
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="p-4 border rounded-lg">
                <p className="text-muted-foreground text-sm font-medium mb-1">
                  Resultado operacional projetado
                </p>
                <p className="text-xl font-bold">R$ 98.600</p>
                <div className="flex items-center space-x-1 text-green-600 text-xs">
                  <TrendingUp className="h-3 w-3" />
                  <span>+12% vs ano anterior</span>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <p className="text-muted-foreground text-sm font-medium mb-1">
                  Caixa projetado final do ano
                </p>
                <p className="text-xl font-bold">R$ 166.900</p>
                <div className="flex items-center space-x-1 text-green-600 text-xs">
                  <TrendingUp className="h-3 w-3" />
                  <span>+32% vs ano anterior</span>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <p className="text-muted-foreground text-sm font-medium mb-1">
                  Rentabilidade projetada
                </p>
                <p className="text-xl font-bold">21,3%</p>
                <div className="flex items-center space-x-1 text-green-600 text-xs">
                  <TrendingUp className="h-3 w-3" />
                  <span>+3,2pts vs ano anterior</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialForecast;