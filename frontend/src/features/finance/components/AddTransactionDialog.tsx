import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCRM } from '@/contexts/CRMContext';
import { toast } from 'sonner';

interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const AddTransactionDialog: React.FC<AddTransactionDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const { addData } = useCRM();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'INCOME' as 'INCOME' | 'EXPENSE',
    category: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    fieldId: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category || !formData.amount || !formData.description) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    try {
      setLoading(true);
      const transactionData = {
        type: formData.type,
        category: formData.category,
        amount: parseFloat(formData.amount),
        description: formData.description,
        date: formData.date,
        fieldId: formData.fieldId || null,
      };
      
      // Usar contexto CRM para adicionar transação (sincronização automática)
      await addData('finances', transactionData);
      
      toast.success('Transação adicionada com sucesso!');
      onOpenChange(false);
      
      // Reset form
      setFormData({
        type: 'INCOME',
        category: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        fieldId: '',
      });
      
      // Callback de sucesso (sincronização já é automática)
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error adding transaction:', error);
      const errorMessage = error?.message || error?.error || 'Erro ao adicionar transação';
      toast.error(errorMessage);
      // Don't close dialog on error so user can fix and retry
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar Transação Financeira</DialogTitle>
          <DialogDescription>
            Preencha os dados da nova transação financeira
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="type">Tipo *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as 'INCOME' | 'EXPENSE' })}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INCOME">Receita</SelectItem>
                  <SelectItem value="EXPENSE">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Categoria *</Label>
              <Input
                id="category"
                placeholder="Ex: Venda de produtos, Insumos, Mão de obra..."
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="amount">Valor (R$) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Descrição *</Label>
              <Textarea
                id="description"
                placeholder="Descreva a transação..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="date">Data *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="fieldId">Parcela (opcional)</Label>
              <Input
                id="fieldId"
                placeholder="ID da parcela (opcional)"
                value={formData.fieldId}
                onChange={(e) => setFormData({ ...formData, fieldId: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTransactionDialog;

