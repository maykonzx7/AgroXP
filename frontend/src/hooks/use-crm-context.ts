import { useState, useEffect, useCallback } from "react";
import {
  exportToCSV,
  exportToExcel,
  exportToPDF,
  importFromCSV,
  printData,
} from "../utils/crm-data-operations";
import {
  parcelsApi,
  cropsApi,
  livestockApi,
  feedingApi,
  vaccinationApi,
  reproductionApi,
  veterinarySupplyApi,
  supplyUsageApi,
  inventoryApi,
  financeApi,
  harvestApi
} from "../services/apiService";
import { CRMContextType } from "../contexts/CRMContext";

// Hook personalizado para gerenciar o contexto global do CRM
export const useCRMContext = (): CRMContextType => {
  const [lastSync, setLastSync] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [moduleData, setModuleData] = useState<Record<string, any>>({});
  const [activeModules] = useState<string[]>([
    "parcelles",
    "cultures",
    "livestock",
    "finances",
    "statistiques",
    "inventaire",
    "harvest",
  ]);

  // Nome da empresa
  const companyName = "AgroXP";

  // Fetch data from backend
  const fetchData = useCallback(async () => {
    setIsRefreshing(true);

    try {
      // Fetch all module data with Promise.allSettled to handle potential errors
      const results = await Promise.allSettled([
        parcelsApi.getAll(),
        cropsApi.getAll(),
        livestockApi.getAll(),
        feedingApi.getAll(),
        vaccinationApi.getAll(),
        reproductionApi.getAll(),
        veterinarySupplyApi.getAll(),
        supplyUsageApi.getAll(),
        inventoryApi.getAll(),
        financeApi.getAll(),
        harvestApi.getAll(),
      ]);

      // Process results individually to handle possible errors
      const [
        parcelsResult, cropsResult, livestockResult, feedingResult, vaccinationResult,
        reproductionResult, veterinarySuppliesResult, supplyUsageResult, inventoryResult, financesResult, harvestResult
      ] = results;

      // Extract values or defaults if promises were rejected
      const parcels = parcelsResult.status === 'fulfilled' ? parcelsResult.value : [];
      const crops = cropsResult.status === 'fulfilled' ? cropsResult.value : [];
      const livestock = livestockResult.status === 'fulfilled' ? livestockResult.value : [];
      const feeding = feedingResult.status === 'fulfilled' ? feedingResult.value : [];
      const vaccination = vaccinationResult.status === 'fulfilled' ? vaccinationResult.value : [];
      const reproduction = reproductionResult.status === 'fulfilled' ? reproductionResult.value : [];
      const veterinarySupplies = veterinarySuppliesResult.status === 'fulfilled' ? veterinarySuppliesResult.value : [];
      const supplyUsage = supplyUsageResult.status === 'fulfilled' ? supplyUsageResult.value : [];
      const inventory = inventoryResult.status === 'fulfilled' ? inventoryResult.value : [];
      const finances = financesResult.status === 'fulfilled' ? financesResult.value : [];
      const harvest = harvestResult.status === 'fulfilled' ? harvestResult.value : [];

      // Update state with real data
      setModuleData({
        parcelles: {
          items: parcels,
          columns: [
            { key: "id", header: "ID" },
            { key: "name", header: "Nom" },
            { key: "size", header: "Surface (ha)" },
            { key: "location", header: "Localisation" },
          ],
        },
        cultures: {
          items: crops,
          columns: [
            { key: "id", header: "ID" },
            { key: "name", header: "Culture" },
            { key: "variety", header: "Variété" },
            { key: "plantingDate", header: "Date de début" },
            { key: "harvestDate", header: "Date de fin" },
          ],
        },
        livestock: {
          items: livestock,
          columns: [
            { key: "id", header: "ID" },
            { key: "name", header: "Animal" },
            { key: "breed", header: "Raça" },
            { key: "quantity", header: "Quantidade" },
            { key: "category", header: "Categoria" },
            { key: "status", header: "Status" },
          ],
        },
        finances: {
          items: finances,
          columns: [
            { key: "id", header: "ID" },
            { key: "date", header: "Date" },
            { key: "type", header: "Type" },
            { key: "description", header: "Description" },
            { key: "amount", header: "Montant (R$) " },
          ],
        },
        inventaire: {
          items: inventory,
          columns: [
            { key: "id", header: "ID" },
            { key: "itemName", header: "Nom" },
            { key: "category", header: "Catégorie" },
            { key: "quantity", header: "Quantité" },
            { key: "unit", header: "Unité" },
            { key: "cost", header: "Prix unitaire (R$)" },
          ],
        },
        harvest: {
          items: harvest,
          columns: [
            { key: "id", header: "ID" },
            { key: "crop", header: "Cultura" },
            { key: "date", header: "Data da Colheita" },
            { key: "yield", header: "Rendimento (t/ha)" },
            { key: "expectedYield", header: "Esperado (t/ha)" },
            { key: "harvestArea", header: "Área Colhida (ha)" },
            { key: "quality", header: "Qualidade" },
          ],
        },
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      // Fallback to empty data if API fails
      setModuleData({
        parcelles: {
          items: [],
          columns: [
            { key: "id", header: "ID" },
            { key: "name", header: "Nom" },
            { key: "size", header: "Surface (ha)" },
            { key: "location", header: "Localisation" },
          ],
        },
        cultures: {
          items: [],
          columns: [
            { key: "id", header: "ID" },
            { key: "name", header: "Culture" },
            { key: "variety", header: "Variété" },
            { key: "plantingDate", header: "Date de début" },
            { key: "harvestDate", header: "Date de fin" },
          ],
        },
        livestock: {
          items: [],
          columns: [
            { key: "id", header: "ID" },
            { key: "name", header: "Animal" },
            { key: "breed", header: "Raça" },
            { key: "quantity", header: "Quantidade" },
            { key: "category", header: "Categoria" },
            { key: "status", header: "Status" },
          ],
        },
        finances: {
          items: [],
          columns: [
            { key: "id", header: "ID" },
            { key: "date", header: "Date" },
            { key: "type", header: "Type" },
            { key: "description", header: "Description" },
            { key: "amount", header: "Montant (R$) " },
          ],
        },
        inventaire: {
          items: [],
          columns: [
            { key: "id", header: "ID" },
            { key: "itemName", header: "Nom" },
            { key: "category", header: "Catégorie" },
            { key: "quantity", header: "Quantité" },
            { key: "unit", header: "Unité" },
            { key: "cost", header: "Prix unitaire (R$)" },
          ],
        },
        harvest: {
          items: [],
          columns: [
            { key: "id", header: "ID" },
            { key: "crop", header: "Cultura" },
            { key: "date", header: "Data da Colheita" },
            { key: "yield", header: "Rendimento (t/ha)" },
            { key: "expectedYield", header: "Esperado (t/ha)" },
            { key: "harvestArea", header: "Área Colhida (ha)" },
            { key: "quality", header: "Qualidade" },
          ],
        },
      });
    } finally {
      setIsRefreshing(false);
      setLastSync(new Date());
    }
  }, []);

  // Synchronisation des données à travers tous les modules du CRM
  const syncDataAcrossCRM = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // Mettre à jour les données d'un module spécifique
  const updateModuleData = useCallback((moduleName: string, data: any) => {
    setModuleData((prevData) => ({
      ...prevData,
      [moduleName]: {
        ...prevData[moduleName],
        ...data,
      },
    }));

    // Mettre à jour la date de dernière synchronisation
    setLastSync(new Date());
  }, []);

  // Récupérer les données d'un module spécifique
  const getModuleData = useCallback(
    (moduleName: string) => {
      return moduleData[moduleName] || {};
    },
    [moduleData]
  );

  // Export module data to specified format
  const exportModuleData = useCallback(
    async (
      moduleName: string,
      format: "csv" | "excel" | "pdf",
      customData?: any[]
    ): Promise<boolean> => {
      // Use custom data if provided, otherwise get from module
      const data = customData || getModuleData(moduleName)?.items;

      if (!data || !Array.isArray(data) || data.length === 0) {
        return false;
      }

      try {
        let success = false;

        // Handle special cases like technical sheets and guides
        if (moduleName === "fiche_technique") {
          return await exportToPDF(data, `${companyName}_ficha_tecnica`, {
            title: `${companyName} - Ficha Técnica`,
            landscape: false,
            template: "technical_sheet",
          });
        } else if (moduleName === "guide_cultures") {
          return true;
        }

        // Standard formats
        switch (format) {
          case "csv":
            success = exportToCSV(data, `${companyName}_${moduleName}`);
            break;
          case "excel":
            success = exportToExcel(data, `${companyName}_${moduleName}`);
            break;
          case "pdf":
            success = await exportToPDF(data, `${companyName}_${moduleName}`);
            break;
          default:
            return false;
        }

        return success;
      } catch (error) {
        console.error(`Error exporting ${moduleName} data:`, error);
        return false;
      }
    },
    [getModuleData, companyName]
  );

  // Import module data
  const importModuleData = useCallback(
    async (moduleName: string, file: File): Promise<boolean> => {
      try {
        const importedData = await importFromCSV(file);

        if (importedData && importedData.length > 0) {
          updateModuleData(moduleName, {
            items: importedData,
          });

          return true;
        }

        return false;
      } catch (error) {
        console.error(`Error importing ${moduleName} data:`, error);
        return false;
      }
    },
    [updateModuleData]
  );

  // Print module data
  const printModuleData = useCallback(
    async (moduleName: string, options?: any): Promise<boolean> => {
      const data = getModuleData(moduleName);

      if (
        !data ||
        !data.items ||
        !Array.isArray(data.items) ||
        data.items.length === 0
      ) {
        return false;
      }

      const moduleNames: Record<string, string> = {
        parcelles: "Parcelles",
        cultures: "Cultures",
        livestock: "Pecuária",
        finances: "Finances",
        statistiques: "Statistiques",
        inventaire: "Inventaire",
        fiche_technique: "Ficha Técnica",
      };

      const title = `${companyName} - ${moduleNames[moduleName] || moduleName}`;

      try {
        return await printData(
          data.items,
          title,
          data.columns ||
            Object.keys(data.items[0]).map((key) => ({ key, header: key })),
          options
        );
      } catch (error) {
        console.error(`Error printing ${moduleName} data:`, error);
        return false;
      }
    },
    [getModuleData, companyName]
  );

  // Métodos genéricos para operações CRUD
  const addData = useCallback(async <T,>(moduleName: string, item: T) => {
    let newItem: T & { id: string };
    let apiCallSuccess = false;

    // Try to save to backend first
    try {
      switch(moduleName) {
        case 'harvest':
          const harvestResponse = await harvestApi.create(item);
          newItem = harvestResponse;
          apiCallSuccess = true;
          break;
        case 'parcelles':
          const parcelResponse = await parcelsApi.create(item);
          newItem = parcelResponse;
          apiCallSuccess = true;
          break;
        case 'cultures':
          const cropResponse = await cropsApi.create(item);
          newItem = cropResponse;
          apiCallSuccess = true;
          break;
        case 'livestock':
          const livestockResponse = await livestockApi.create(item);
          newItem = livestockResponse;
          apiCallSuccess = true;
          break;
        case 'finances':
          const financeResponse = await financeApi.create(item);
          newItem = financeResponse;
          apiCallSuccess = true;
          break;
        case 'inventaire':
          const inventoryResponse = await inventoryApi.create(item);
          newItem = inventoryResponse;
          apiCallSuccess = true;
          break;
        default:
          // Fallback: add to local state with generated ID
          newItem = {
            ...item,
            id: Date.now().toString(),
          } as T & { id: string };
      }
    } catch (error) {
      console.error(`Error creating ${moduleName} item:`, error);
      // Fallback: add to local state with generated ID
      newItem = {
        ...item,
        id: Date.now().toString(),
      } as T & { id: string };
    }

    // Update local state
    setModuleData(prev => {
      const module = prev[moduleName];
      if (!module || !module.items) {
        return prev;
      }

      return {
        ...prev,
        [moduleName]: {
          ...module,
          items: [...module.items, newItem]
        }
      };
    });

    // Atualizar a data de última sincronização
    setLastSync(new Date());
  }, []);

  const updateData = useCallback(async <T,>(moduleName: string, id: string | number, updates: Partial<T>) => {
    let updatedItem: T;
    let apiCallSuccess = false;

    // Try to update in backend first
    try {
      switch(moduleName) {
        case 'harvest':
          const harvestResponse = await harvestApi.update(id.toString(), updates);
          updatedItem = harvestResponse;
          apiCallSuccess = true;
          break;
        case 'parcelles':
          const parcelResponse = await parcelsApi.update(id.toString(), updates);
          updatedItem = parcelResponse;
          apiCallSuccess = true;
          break;
        case 'cultures':
          const cropResponse = await cropsApi.update(id.toString(), updates);
          updatedItem = cropResponse;
          apiCallSuccess = true;
          break;
        case 'livestock':
          const livestockResponse = await livestockApi.update(id.toString(), updates);
          updatedItem = livestockResponse;
          apiCallSuccess = true;
          break;
        case 'finances':
          const financeResponse = await financeApi.update(id.toString(), updates);
          updatedItem = financeResponse;
          apiCallSuccess = true;
          break;
        case 'inventaire':
          const inventoryResponse = await inventoryApi.update(id.toString(), updates);
          updatedItem = inventoryResponse;
          apiCallSuccess = true;
          break;
        default:
          // Fallback: return updates
          updatedItem = { ...updates } as T;
      }
    } catch (error) {
      console.error(`Error updating ${moduleName} item:`, error);
      // Fallback: return updates
      updatedItem = { ...updates } as T;
    }

    // Update local state
    setModuleData(prev => {
      const module = prev[moduleName];
      if (!module || !module.items) {
        return prev;
      }

      return {
        ...prev,
        [moduleName]: {
          ...module,
          items: module.items.map((item: any) =>
            item.id === id || item._id === id ? { ...item, ...updatedItem } : item
          )
        }
      };
    });

    // Atualizar a data de última sincronização
    setLastSync(new Date());
  }, []);

  const deleteData = useCallback(async (moduleName: string, id: string | number) => {
    let apiCallSuccess = false;

    // Try to delete from backend first
    try {
      switch(moduleName) {
        case 'harvest':
          await harvestApi.delete(id.toString());
          apiCallSuccess = true;
          break;
        case 'parcelles':
          await parcelsApi.delete(id.toString());
          apiCallSuccess = true;
          break;
        case 'cultures':
          await cropsApi.delete(id.toString());
          apiCallSuccess = true;
          break;
        case 'livestock':
          await livestockApi.delete(id.toString());
          apiCallSuccess = true;
          break;
        case 'finances':
          await financeApi.delete(id.toString());
          apiCallSuccess = true;
          break;
        case 'inventaire':
          await inventoryApi.delete(id.toString());
          apiCallSuccess = true;
          break;
        default:
          // Continue with local deletion
          apiCallSuccess = true;
      }
    } catch (error) {
      console.error(`Error deleting ${moduleName} item:`, error);
      // Continue with local deletion even if API fails
    }

    // Update local state
    setModuleData(prev => {
      const module = prev[moduleName];
      if (!module || !module.items) {
        return prev;
      }

      return {
        ...prev,
        [moduleName]: {
          ...module,
          items: module.items.filter((item: any) =>
            item.id !== id && item._id !== id
          )
        }
      };
    });

    // Atualizar a data de última sincronização
    setLastSync(new Date());
  }, []);

  const findData = useCallback(<T,>(moduleName: string, id: string | number): T | undefined => {
    const module = moduleData[moduleName];
    if (!module || !module.items) {
      return undefined;
    }

    return module.items.find((item: any) =>
      item.id === id || item._id === id
    );
  }, [moduleData]);

  const filterData = useCallback(<T,>(moduleName: string, predicate: (item: T) => boolean): T[] => {
    const module = moduleData[moduleName];
    if (!module || !module.items) {
      return [];
    }

    return module.items.filter(predicate);
  }, [moduleData]);

  // Function to clear all module data
  const clearModuleData = useCallback(() => {
    setModuleData({});
    setLastSync(new Date());
  }, []);

  // Listen for logout events to clear data
  useEffect(() => {
    const handleLogout = () => {
      // Clear all module data when user logs out
      setModuleData({});
      setLastSync(new Date());
    };

    window.addEventListener('userLoggedOut', handleLogout);

    // Cleanup event listener
    return () => {
      window.removeEventListener('userLoggedOut', handleLogout);
    };
  }, []);

  // Synchronisation initiale au chargement
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    lastSync,
    isRefreshing,
    companyName,
    activeModules,
    syncDataAcrossCRM,
    updateModuleData,
    getModuleData,
    exportModuleData,
    importModuleData,
    printModuleData,
    // Novos métodos genéricos
    addData,
    updateData,
    deleteData,
    findData,
    filterData,
    // Multi-tenant support
    clearModuleData,
  };
};

export default useCRMContext;