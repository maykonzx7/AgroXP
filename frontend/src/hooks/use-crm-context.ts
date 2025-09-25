import { useState, useEffect, useCallback } from "react";
import {
  exportToCSV,
  exportToExcel,
  exportToPDF,
  importFromCSV,
  printData,
} from "../utils/crm-data-operations";
import { parcelApi, cropApi, livestockApi, inventoryApi, financeApi } from "../services/api";

// Types for the context CRM global
interface CRMContextState {
  lastSync: Date;
  isRefreshing: boolean;
  companyName: string;
  activeModules: string[];
  syncDataAcrossCRM: () => void;
  updateModuleData: (moduleName: string, data: any) => void;
  getModuleData: (moduleName: string) => any;
  exportModuleData: (
    moduleName: string,
    format: "csv" | "excel" | "pdf",
    customData?: any[]
  ) => Promise<boolean>;
  importModuleData: (moduleName: string, file: File) => Promise<boolean>;
  printModuleData: (moduleName: string, options?: any) => Promise<boolean>;
}

// Hook personnalisé pour gérer le contexte global du CRM
export const useCRMContext = (): CRMContextState => {
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
  ]);

  // Nom de l'entreprise
  const companyName = "AgroXP";

  // Fetch data from backend
  const fetchData = useCallback(async () => {
    setIsRefreshing(true);
    
    try {
      // Fetch all module data
      const [parcels, crops, livestock, inventory, finances] = await Promise.all([
        parcelApi.getAll(),
        cropApi.getAll(),
        livestockApi.getAll(),
        inventoryApi.getAll(),
        financeApi.getAll(),
      ]);
      
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
  };
};

export default useCRMContext;
