import React, { useState } from 'react';
import { Leaf } from 'lucide-react';
import { useCRM } from '@/contexts/CRMContext';
import { CropDetailsTable } from './CropDetailsTable';
import { DateRange } from 'react-day-picker';
import { motion } from 'framer-motion';
import MainCropsCard from '@/components/organisms/crops/MainCropsCard';

interface SpecificCropsProps {
  searchTerm?: string;
  dateRange?: DateRange;
  showAddForm?: boolean;
  setShowAddForm?: (show: boolean) => void;
}

const SpecificCrops: React.FC<SpecificCropsProps> = ({ 
  searchTerm: externalSearchTerm = '', 
  dateRange,
  showAddForm: externalShowAddForm,
  setShowAddForm: externalSetShowAddForm
}) => {
  const [internalShowAddForm, setInternalShowAddForm] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const { getModuleData } = useCRM();
  
  // Usar showAddForm externo se fornecido, senão usar interno
  const showAddForm = externalShowAddForm !== undefined ? externalShowAddForm : internalShowAddForm;
  const setShowAddForm = externalSetShowAddForm || setInternalShowAddForm;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Principais Culturas */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <MainCropsCard maxCrops={5} showArea={true} />
      </motion.div>

      {/* Tabela de Culturas */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-card rounded-xl border p-6 mb-6 shadow-sm"
      >
        <CropDetailsTable 
          showAddForm={showAddForm} 
          setShowAddForm={setShowAddForm} 
          searchTerm={externalSearchTerm}
          filterType={filterType}
        />
      </motion.div>
    </motion.div>
  );
};

export default SpecificCrops;
