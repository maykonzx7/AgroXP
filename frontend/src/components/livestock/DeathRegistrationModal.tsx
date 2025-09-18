import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, AlertTriangle, Info } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface DeathRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  animal: {
    id: number;
    name: string;
    breed?: string;
    category?: string;
    quantity?: number;
  } | null;
  onRegisterDeath: (deathData: any) => Promise<void>;
}

const DeathRegistrationModal: React.FC<DeathRegistrationModalProps> = ({ 
  isOpen, 
  onClose, 
  animal,
  onRegisterDeath 
}) => {
  const [deathDate, setDeathDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [deathReason, setDeathReason] = useState<string>('');
  const [deathDescription, setDeathDescription] = useState<string>('');
  const [veterinaryReport, setVeterinaryReport] = useState<string>('');
  const [numberOfDeaths, setNumberOfDeaths] = useState<string>('1');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!animal) return;

    // Convert string to number for validation
    const deaths = parseInt(numberOfDeaths);
    
    // Validate number of deaths
    if (isNaN(deaths) || deaths < 1 || deaths > (animal.quantity || 1)) {
      toast.error('Número inválido', {
        description: `O número de óbitos deve ser entre 1 e ${animal.quantity || 1}.`
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const deathData = {
        animalId: animal.id,
        animalName: animal.name,
        deathDate,
        deathReason,
        deathDescription,
        veterinaryReport,
        numberOfDeaths: deaths,
        timestamp: new Date().toISOString()
      };

      await onRegisterDeath(deathData);
      
      // Reset form
      setDeathDate(format(new Date(), 'yyyy-MM-dd'));
      setDeathReason('');
      setDeathDescription('');
      setVeterinaryReport('');
      setNumberOfDeaths('1');
      
      toast.success('Óbito registrado com sucesso', {
        description: deaths === 1 
          ? `O óbito do animal ${animal.name} foi registrado.`
          : `Foram registrados ${deaths} óbitos de ${animal.name}.`
      });
      
      onClose();
    } catch (error) {
      toast.error('Erro ao registrar óbito', {
        description: 'Não foi possível registrar o óbito do animal. Tente novamente.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const commonDeathReasons = [
    'Doenças',
    'Acidentes',
    'Envelhecimento',
    'Parto complicado',
    'Predação',
    'Outros'
  ];

  // Calculate remaining animals after this death registration
  const deaths = parseInt(numberOfDeaths) || 1;
  const remainingAnimals = animal ? (animal.quantity || 0) - deaths : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Óbito</DialogTitle>
        </DialogHeader>
        
        {animal && (
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
              <h3 className="font-medium">Grupo de Animais</h3>
              <p className="text-sm text-muted-foreground">{animal.name}</p>
              {animal.breed && <p className="text-sm">Raça: {animal.breed}</p>}
              {animal.category && <p className="text-sm">Categoria: {animal.category}</p>}
              {animal.quantity && (
                <p className="text-sm">
                  Quantidade: {animal.quantity} 
                  {animal.quantity > 1 ? ' animais' : ' animal'}
                </p>
              )}
            </div>
            
            {remainingAnimals === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">Atenção</h4>
                  <p className="text-sm text-yellow-700">
                    Todos os animais deste grupo serão marcados como mortos.
                  </p>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="numberOfDeaths">Número de Óbitos</Label>
                <Input
                  id="numberOfDeaths"
                  type="number"
                  min="1"
                  max={animal.quantity || 1}
                  value={numberOfDeaths}
                  onChange={(e) => setNumberOfDeaths(e.target.value)}
                  onBlur={(e) => {
                    // Validate and clamp the value when user leaves the field
                    const value = parseInt(e.target.value) || 1;
                    const clampedValue = Math.max(1, Math.min(animal.quantity || 1, value));
                    setNumberOfDeaths(clampedValue.toString());
                  }}
                  required
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1</span>
                  <span>{animal.quantity || 1} animais</span>
                </div>
                {animal.quantity && animal.quantity > 1 && (
                  <div className="flex items-center text-xs text-muted-foreground pt-1">
                    <Info className="h-3 w-3 mr-1" />
                    <span>
                      Após o registro: {remainingAnimals} {remainingAnimals === 1 ? 'animal restante' : 'animais restantes'}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="deathDate">Data do Óbito</Label>
                <div className="relative">
                  <Input
                    id="deathDate"
                    type="date"
                    value={deathDate}
                    onChange={(e) => setDeathDate(e.target.value)}
                    required
                  />
                  <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="deathReason">Motivo do Óbito</Label>
                <select
                  id="deathReason"
                  value={deathReason}
                  onChange={(e) => setDeathReason(e.target.value)}
                  className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                  required
                >
                  <option value="">Selecione um motivo</option>
                  {commonDeathReasons.map((reason) => (
                    <option key={reason} value={reason}>{reason}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="deathDescription">Descrição Detalhada</Label>
                <Textarea
                  id="deathDescription"
                  placeholder="Descreva detalhes sobre as circunstâncias do óbito..."
                  value={deathDescription}
                  onChange={(e) => setDeathDescription(e.target.value)}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="veterinaryReport">Laudo Veterinário (Opcional)</Label>
                <Textarea
                  id="veterinaryReport"
                  placeholder="Informe o laudo veterinário, se disponível..."
                  value={veterinaryReport}
                  onChange={(e) => setVeterinaryReport(e.target.value)}
                  rows={2}
                />
              </div>
              
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Registrando...' : 'Registrar Óbito'}
                </Button>
              </div>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DeathRegistrationModal;