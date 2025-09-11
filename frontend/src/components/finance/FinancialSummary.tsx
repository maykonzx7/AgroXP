
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Banknote, Receipt, Wallet } from 'lucide-react';

interface FinancialSummaryProps {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  period?: string;
}

const FinancialSummary: React.FC<FinancialSummaryProps> = ({ 
  totalIncome, 
  totalExpenses, 
  balance,
  period
}) => {
  const getPercentChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  // Mock data for previous period comparison
  const previousIncome = totalIncome * 0.95;
  const previousExpenses = totalExpenses * 0.98;
  const previousBalance = previousIncome - previousExpenses;
  
  const incomeChange = getPercentChange(totalIncome, previousIncome);
  const expensesChange = getPercentChange(totalExpenses, previousExpenses);
  const balanceChange = getPercentChange(balance, previousBalance);
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={item}>
        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="px-3 md:px-6 pt-3 md:pt-6 pb-2 md:pb-3">
            <CardTitle className="text-base md:text-lg flex items-center">
              <Banknote className="h-4 w-4 md:h-5 md:w-5 mr-1.5 md:mr-2 text-green-500" />
              Receitas
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              {period ? `Total para ${period}` : 'Total das entradas'}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-3 md:px-6 pb-3 md:pb-6">
            <p className="text-xl md:text-2xl font-bold text-green-600">{totalIncome.toLocaleString('fr-FR', {
              style: 'currency',
              currency: 'EUR'
            })}</p>
            <div className={`flex items-center text-xs md:text-sm mt-1 ${incomeChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              <span>{incomeChange >= 0 ? '↑' : '↓'}</span>
              <span className="ml-1">{Math.abs(incomeChange).toFixed(1)}%</span>
              <span className="ml-1">vs período anterior</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="px-3 md:px-6 pt-3 md:pt-6 pb-2 md:pb-3">
            <CardTitle className="text-base md:text-lg flex items-center">
              <Receipt className="h-4 w-4 md:h-5 md:w-5 mr-1.5 md:mr-2 text-red-500" />
              Despesas
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              {period ? `Total para ${period}` : 'Total das saídas'}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-3 md:px-6 pb-3 md:pb-6">
            <p className="text-xl md:text-2xl font-bold text-red-600">{totalExpenses.toLocaleString('fr-FR', {
              style: 'currency',
              currency: 'EUR'
            })}</p>
            <div className={`flex items-center text-xs md:text-sm mt-1 ${expensesChange >= 0 ? 'text-red-600' : 'text-green-600'}`}>
              <span>{expensesChange >= 0 ? '↑' : '↓'}</span>
              <span className="ml-1">{Math.abs(expensesChange).toFixed(1)}%</span>
              <span className="ml-1">vs período anterior</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="px-3 md:px-6 pt-3 md:pt-6 pb-2 md:pb-3">
            <CardTitle className="text-base md:text-lg flex items-center">
              <Wallet className="h-4 w-4 md:h-5 md:w-5 mr-1.5 md:mr-2 text-blue-500" />
              Saldo
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              {period ? `Balanço para ${period}` : 'Receitas - Despesas'}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-3 md:px-6 pb-3 md:pb-6">
            <p className={`text-xl md:text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {balance.toLocaleString('fr-FR', {
                style: 'currency',
                currency: 'EUR'
              })}
            </p>
            <div className={`flex items-center text-xs md:text-sm mt-1 ${balanceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              <span>{balanceChange >= 0 ? '↑' : '↓'}</span>
              <span className="ml-1">{Math.abs(balanceChange).toFixed(1)}%</span>
              <span className="ml-1">vs período anterior</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default FinancialSummary;
