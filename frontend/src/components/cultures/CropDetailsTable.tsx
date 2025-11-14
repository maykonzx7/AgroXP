import React, { useState, useEffect } from "react";
import { EditableTable, Column } from "@/components/ui/editable-table";
import {
  Trash2,
  X,
  Save,
  Plus,
  ExternalLink,
  Download,
  FileText,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useCRM } from "../../contexts/CRMContext";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Interface para os dados de cultura
interface CultureData {
  id: number;
  name: string;
  scientificName?: string;
  family?: string;
  origin?: string;
  growingSeason?: string;
  soilType?: string;
  waterNeeds?: string;
  fertilization?: string;
  pests?: string;
  diseases?: string;
  notes?: string;
  type?: string;
  harvestPeriod?: string;
  yieldPerHectare?: string;
  variety?: string;
  plantingDate?: string;
  harvestDate?: string;
}

interface CultureDetailTableProps {
  showAddForm?: boolean;
  setShowAddForm?: (show: boolean) => void;
  searchTerm?: string;
  filterType?: string;
}

export const CultureDetailTable = ({
  showAddForm,
  setShowAddForm,
  searchTerm = "",
  filterType = "all",
}: CultureDetailTableProps) => {
  const { toast: shadowToast } = useToast();
  const { getModuleData, syncDataAcrossCRM, addData, updateData, deleteData, isRefreshing } = useCRM();
  const [cultureData, setCultureData] = useState<CultureData[]>([]);
  const [isAddFormVisible, setIsAddFormVisible] = useState(false);
  const [selectedCulture, setSelectedCulture] = useState<null | CultureData>(null);
  const { exportModuleData } = useCRM();
  const [newCulture, setNewCulture] = useState({
    name: "",
    scientificName: "",
    family: "",
    origin: "",
    growingSeason: "",
    soilType: "",
    waterNeeds: "",
    fertilization: "",
    pests: "",
    diseases: "",
    notes: "",
    type: "vegetables",
    harvestPeriod: "",
    yieldPerHectare: "",
  });

  // Obter dados de culturas do contexto CRM
  const culturesModuleData = getModuleData('cultures').items || [];
  
  // Converter dados do backend para o formato esperado
  useEffect(() => {
    const convertedCultures = culturesModuleData
      .filter(item => item !== null && item !== undefined) // Filtrar itens nulos
      .map((item: any) => {
        if (!item) return null; // Mais proteção contra itens nulos
        
        return {
          id: item?.id,
          name: item?.name || '',
          variety: item?.variety || '',
          scientificName: item?.scientificName || '', // TODO: Adicionar campo no backend
          family: item?.family || '', // TODO: Adicionar campo no backend
          origin: item?.origin || '', // TODO: Adicionar campo no backend
          growingSeason: item?.growingSeason || '', // TODO: Adicionar campo no backend
          soilType: item?.soilType || '', // TODO: Adicionar campo no backend
          waterNeeds: item?.waterNeeds || '', // TODO: Adicionar campo no backend
          fertilization: item?.fertilization || '', // TODO: Adicionar campo no backend
          pests: item?.pests || '', // TODO: Adicionar campo no backend
          diseases: item?.diseases || '', // TODO: Adicionar campo no backend
          notes: item?.notes || '', // TODO: Adicionar campo no backend
          type: item?.type || 'vegetables', // TODO: Adicionar campo no backend
          harvestPeriod: item?.harvestPeriod || '', // TODO: Adicionar campo no backend
          yieldPerHectare: item?.yieldPerHectare || '', // TODO: Adicionar campo no backend
          plantingDate: item?.plantingDate ? new Date(item.plantingDate).toISOString().split('T')[0] : '',
          harvestDate: item?.harvestDate ? new Date(item.harvestDate).toISOString().split('T')[0] : '',
        };
      })
      .filter(item => item !== null); // Remover itens nulos após mapeamento

    setCultureData(convertedCultures);
  }, [culturesModuleData]);
  
  const handleRefresh = () => {
    syncDataAcrossCRM();
    toast.success('Dados de culturas atualizados');
  };

  const localShowAddForm =
    showAddForm !== undefined ? showAddForm : isAddFormVisible;
  const localSetShowAddForm = setShowAddForm || setIsAddFormVisible;

  const filteredCultures = cultureData.filter((culture) => {
    const matchesSearch =
      culture.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (culture.scientificName && culture.scientificName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (culture.family && culture.family.toLowerCase().includes(searchTerm.toLowerCase()));

    if (filterType === "all") return matchesSearch;
    return matchesSearch && culture.type === filterType;
  });

  const handleUpdateCulture = async (
    rowIndex: number,
    columnId: string,
    value: any
  ) => {
    const updatedCulture = filteredCultures[rowIndex];
    const cultureId = updatedCulture.id;

    try {
      // Atualizar no banco de dados
      await updateData('cultures', cultureId, { [columnId]: value });

      // Atualizar a interface
      syncDataAcrossCRM();

      shadowToast({
        description: `Informações atualizadas para ${updatedCulture.name}`,
      });
    } catch (error) {
      shadowToast({
        description: `Erro ao atualizar informações para ${updatedCulture.name}`,
      });
    }
  };

  const handleAddCulture = async () => {
    if (!newCulture.name) {
      toast.error("Erro", {
        description: "O nome da cultura é obrigatório",
      });
      return;
    }

    try {
      // Adicionar ao banco de dados
      await addData('cultures', {
        ...newCulture,
        id: Date.now() // Gerar ID temporário, o backend pode gerar um definitivo
      });

      // Atualizar a interface
      syncDataAcrossCRM();
      
      localSetShowAddForm(false);

      setNewCulture({
        name: "",
        scientificName: "",
        family: "",
        origin: "",
        growingSeason: "",
        soilType: "",
        waterNeeds: "",
        fertilization: "",
        pests: "",
        diseases: "",
        notes: "",
        type: "vegetables",
        harvestPeriod: "",
        yieldPerHectare: "",
      });

      toast.success("Cultura adicionada", {
        description: `${newCulture.name} foi adicionada ao banco de dados`,
      });
    } catch (error) {
      toast.error("Erro ao adicionar cultura", {
        description: "Não foi possível adicionar a cultura ao banco de dados",
      });
    }
  };

  const handleDeleteCulture = async (rowIndex: number) => {
    const cultureToDelete = filteredCultures[rowIndex];

    try {
      // Excluir do banco de dados
      await deleteData('cultures', cultureToDelete.id);

      // Atualizar a interface
      syncDataAcrossCRM();

      toast.success("Cultura removida", {
        description: `${cultureToDelete.name} foi removida do banco de dados`,
      });
    } catch (error) {
      toast.error("Erro ao remover cultura", {
        description: `Não foi possível remover ${cultureToDelete.name} do banco de dados`,
      });
    }
  };

  const handleViewDetails = (rowIndex: number) => {
    setSelectedCulture(filteredCultures[rowIndex]);
  };

  const downloadTechnicalSheet = async (culture: any) => {
    toast.info("Geração da ficha técnica", {
      description: `Preparação da ficha para ${culture.name}`,
    });

    const techSheetData = [
      {
        nom: culture.name,
        nomScientifique: culture.scientificName,
        famille: culture.family,
        origine: culture.origin,
        saisonCulture: culture.growingSeason,
        typeSol: culture.soilType,
        besoinEau: culture.waterNeeds,
        fertilisation: culture.fertilization,
        ravageurs: culture.pests,
        maladies: culture.diseases,
        notes: culture.notes,
        type: culture.type,
        periodeRecolte: culture.harvestPeriod,
        rendementHectare: culture.yieldPerHectare,
      },
    ];

    const success = await exportModuleData(
      "fiche_technique",
      "pdf",
      techSheetData
    );

    if (success) {
      toast.success("Ficha técnica gerada", {
        description: `A ficha técnica para ${culture.name} foi baixada`,
      });
    }
  };

  const columns: Column[] = [
    { id: "name", header: "Nome", accessorKey: "name", isEditable: true },
    {
      id: "scientificName",
      header: "Nome Científico",
      accessorKey: "scientificName",
      isEditable: true,
    },
    {
      id: "growingSeason",
      header: "Estação de Cultivo",
      accessorKey: "growingSeason",
      isEditable: true,
    },
    {
      id: "soilType",
      header: "Tipo de Solo",
      accessorKey: "soilType",
      isEditable: true,
    },
    {
      id: "waterNeeds",
      header: "Necessidade de Água",
      accessorKey: "waterNeeds",
      isEditable: true,
    },
  ];

  const renderDetailView = () => {
    if (!selectedCulture) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-card rounded-xl p-6 max-w-3xl w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              Detalhes da Cultura: {selectedCulture.name}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedCulture(null)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label>Nome</Label>
              <Input
                value={selectedCulture.name}
                onChange={(e) => {
                  const newName = e.target.value;
                  setSelectedCulture({ ...selectedCulture, name: newName });

                  const updatedData = [...cultureData];
                  const index = updatedData.findIndex(
                    (c) => c.id === selectedCulture.id
                  );
                  if (index !== -1) {
                    updatedData[index].name = newName;
                    setCultureData(updatedData);
                  }
                }}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Nome Científico</Label>
              <Input
                value={selectedCulture.scientificName}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setSelectedCulture({
                    ...selectedCulture,
                    scientificName: newValue,
                  });

                  const updatedData = [...cultureData];
                  const index = updatedData.findIndex(
                    (c) => c.id === selectedCulture.id
                  );
                  if (index !== -1) {
                    updatedData[index].scientificName = newValue;
                    setCultureData(updatedData);
                  }
                }}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Tipo de Cultura</Label>
              <Select value={selectedCulture.type} onValueChange={(value) => {
                const newValue = value;
                setSelectedCulture({ ...selectedCulture, type: newValue });

                const updatedData = [...cultureData];
                const index = updatedData.findIndex(
                  (c) => c.id === selectedCulture.id
                );
                if (index !== -1) {
                  updatedData[index].type = newValue;
                  setCultureData(updatedData);
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vegetables">Vegetais</SelectItem>
                  <SelectItem value="fruits">Frutas</SelectItem>
                  <SelectItem value="tubers">Tubérculos</SelectItem>
                  <SelectItem value="cash">Culturas Comerciais</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Família</Label>
              <Input
                value={selectedCulture.family}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setSelectedCulture({ ...selectedCulture, family: newValue });

                  const updatedData = [...cultureData];
                  const index = updatedData.findIndex(
                    (c) => c.id === selectedCulture.id
                  );
                  if (index !== -1) {
                    updatedData[index].family = newValue;
                    setCultureData(updatedData);
                  }
                }}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Origem</Label>
              <Input
                value={selectedCulture.origin}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setSelectedCulture({ ...selectedCulture, origin: newValue });

                  const updatedData = [...cultureData];
                  const index = updatedData.findIndex(
                    (c) => c.id === selectedCulture.id
                  );
                  if (index !== -1) {
                    updatedData[index].origin = newValue;
                    setCultureData(updatedData);
                  }
                }}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Estação de Cultivo</Label>
              <Input
                value={selectedCulture.growingSeason}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setSelectedCulture({
                    ...selectedCulture,
                    growingSeason: newValue,
                  });

                  const updatedData = [...cultureData];
                  const index = updatedData.findIndex(
                    (c) => c.id === selectedCulture.id
                  );
                  if (index !== -1) {
                    updatedData[index].growingSeason = newValue;
                    setCultureData(updatedData);
                  }
                }}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Período de Colheita</Label>
              <Input
                value={selectedCulture.harvestPeriod}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setSelectedCulture({
                    ...selectedCulture,
                    harvestPeriod: newValue,
                  });

                  const updatedData = [...cultureData];
                  const index = updatedData.findIndex(
                    (c) => c.id === selectedCulture.id
                  );
                  if (index !== -1) {
                    updatedData[index].harvestPeriod = newValue;
                    setCultureData(updatedData);
                  }
                }}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Rendimento por Hectare</Label>
              <Input
                value={selectedCulture.yieldPerHectare}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setSelectedCulture({
                    ...selectedCulture,
                    yieldPerHectare: newValue,
                  });

                  const updatedData = [...cultureData];
                  const index = updatedData.findIndex(
                    (c) => c.id === selectedCulture.id
                  );
                  if (index !== -1) {
                    updatedData[index].yieldPerHectare = newValue;
                    setCultureData(updatedData);
                  }
                }}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Tipo de Solo</Label>
              <Input
                value={selectedCulture.soilType}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setSelectedCulture({
                    ...selectedCulture,
                    soilType: newValue,
                  });

                  const updatedData = [...cultureData];
                  const index = updatedData.findIndex(
                    (c) => c.id === selectedCulture.id
                  );
                  if (index !== -1) {
                    updatedData[index].soilType = newValue;
                    setCultureData(updatedData);
                  }
                }}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Necessidade de Água</Label>
              <Input
                value={selectedCulture.waterNeeds}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setSelectedCulture({
                    ...selectedCulture,
                    waterNeeds: newValue,
                  });

                  const updatedData = [...cultureData];
                  const index = updatedData.findIndex(
                    (c) => c.id === selectedCulture.id
                  );
                  if (index !== -1) {
                    updatedData[index].waterNeeds = newValue;
                    setCultureData(updatedData);
                  }
                }}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Fertilização</Label>
              <Input
                value={selectedCulture.fertilization}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setSelectedCulture({
                    ...selectedCulture,
                    fertilization: newValue,
                  });

                  const updatedData = [...cultureData];
                  const index = updatedData.findIndex(
                    (c) => c.id === selectedCulture.id
                  );
                  if (index !== -1) {
                    updatedData[index].fertilization = newValue;
                    setCultureData(updatedData);
                  }
                }}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label>Pragas</Label>
              <Input
                value={selectedCulture.pests}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setSelectedCulture({ ...selectedCulture, pests: newValue });

                  const updatedData = [...cultureData];
                  const index = updatedData.findIndex(
                    (c) => c.id === selectedCulture.id
                  );
                  if (index !== -1) {
                    updatedData[index].pests = newValue;
                    setCultureData(updatedData);
                  }
                }}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Doenças</Label>
              <Input
                value={selectedCulture.diseases}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setSelectedCulture({
                    ...selectedCulture,
                    diseases: newValue,
                  });

                  const updatedData = [...cultureData];
                  const index = updatedData.findIndex(
                    (c) => c.id === selectedCulture.id
                  );
                  if (index !== -1) {
                    updatedData[index].diseases = newValue;
                    setCultureData(updatedData);
                  }
                }}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label>Notas</Label>
            <Textarea
              value={selectedCulture.notes}
              onChange={(e) => {
                const newValue = e.target.value;
                setSelectedCulture({ ...selectedCulture, notes: newValue });

                const updatedData = [...cultureData];
                const index = updatedData.findIndex(
                  (c) => c.id === selectedCulture.id
                );
                if (index !== -1) {
                  updatedData[index].notes = newValue;
                  setCultureData(updatedData);
                }
              }}
              className="mt-1"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3 mt-5">
            <Button variant="outline" onClick={() => setSelectedCulture(null)}>
              Fechar
            </Button>
            <Button onClick={() => downloadTechnicalSheet(selectedCulture)}>
              <FileText className="mr-2 h-4 w-4" />
              Baixar ficha técnica
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="mb-4 flex justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Atualizando...' : 'Atualizar'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            toast.info("Guia PDF disponível", {
              description: "Download do guia de culturas tropicais iniciado",
            });
            exportModuleData("guide_cultures", "pdf");
          }}
        >
          <Download className="mr-2 h-4 w-4" />
          Guia de culturas
        </Button>
      </div>

      <EditableTable
        data={filteredCultures}
        columns={columns}
        onUpdate={handleUpdateCulture}
        onDelete={handleDeleteCulture}
        onAdd={localShowAddForm ? undefined : () => localSetShowAddForm(true)}
        sortable={true}
        actions={[
          {
            icon: <ExternalLink className="h-4 w-4" />,
            label: "Ver detalhes",
            onClick: handleViewDetails,
          },
        ]}
      />

      {localShowAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-xl p-6 max-w-3xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Adicionar Nova Cultura</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => localSetShowAddForm(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome da Cultura *</Label>
                  <Input
                    id="name"
                    type="text"
                    className="mt-1"
                    value={newCulture.name}
                    onChange={(e) =>
                      setNewCulture({ ...newCulture, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="scientificName">Nome Científico</Label>
                  <Input
                    id="scientificName"
                    type="text"
                    className="mt-1"
                    value={newCulture.scientificName}
                    onChange={(e) =>
                      setNewCulture({
                        ...newCulture,
                        scientificName: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="type">Tipo de Cultura</Label>
                  <Select value={newCulture.type} onValueChange={(value) => setNewCulture({ ...newCulture, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vegetables">Vegetais</SelectItem>
                      <SelectItem value="fruits">Frutas</SelectItem>
                      <SelectItem value="tubers">Tubérculos</SelectItem>
                      <SelectItem value="cash">Culturas Comerciais</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="family">Família</Label>
                  <Input
                    id="family"
                    type="text"
                    className="mt-1"
                    value={newCulture.family}
                    onChange={(e) =>
                      setNewCulture({ ...newCulture, family: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="origin">Origem</Label>
                  <Input
                    id="origin"
                    type="text"
                    className="mt-1"
                    value={newCulture.origin}
                    onChange={(e) =>
                      setNewCulture({ ...newCulture, origin: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="growingSeason">Estação de Cultivo</Label>
                  <Input
                    id="growingSeason"
                    type="text"
                    className="mt-1"
                    value={newCulture.growingSeason}
                    onChange={(e) =>
                      setNewCulture({
                        ...newCulture,
                        growingSeason: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="harvestPeriod">Período de Colheita</Label>
                  <Input
                    id="harvestPeriod"
                    type="text"
                    className="mt-1"
                    value={newCulture.harvestPeriod}
                    onChange={(e) =>
                      setNewCulture({
                        ...newCulture,
                        harvestPeriod: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="yieldPerHectare">
                    Rendimento por Hectare
                  </Label>
                  <Input
                    id="yieldPerHectare"
                    type="text"
                    className="mt-1"
                    value={newCulture.yieldPerHectare}
                    onChange={(e) =>
                      setNewCulture({
                        ...newCulture,
                        yieldPerHectare: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="soilType">Tipo de Solo</Label>
                  <Input
                    id="soilType"
                    type="text"
                    className="mt-1"
                    value={newCulture.soilType}
                    onChange={(e) =>
                      setNewCulture({ ...newCulture, soilType: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="waterNeeds">Necessidade de Água</Label>
                  <Input
                    id="waterNeeds"
                    type="text"
                    className="mt-1"
                    value={newCulture.waterNeeds}
                    onChange={(e) =>
                      setNewCulture({
                        ...newCulture,
                        waterNeeds: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="fertilization">Fertilização</Label>
                  <Input
                    id="fertilization"
                    type="text"
                    className="mt-1"
                    value={newCulture.fertilization}
                    onChange={(e) =>
                      setNewCulture({
                        ...newCulture,
                        fertilization: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="pests">Pragas</Label>
                  <Input
                    id="pests"
                    type="text"
                    className="mt-1"
                    value={newCulture.pests}
                    onChange={(e) =>
                      setNewCulture({ ...newCulture, pests: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="diseases">Doenças</Label>
                  <Input
                    id="diseases"
                    type="text"
                    className="mt-1"
                    value={newCulture.diseases}
                    onChange={(e) =>
                      setNewCulture({ ...newCulture, diseases: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  className="mt-1"
                  rows={3}
                  value={newCulture.notes}
                  onChange={(e) =>
                    setNewCulture({ ...newCulture, notes: e.target.value })
                  }
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => localSetShowAddForm(false)}
                >
                  Cancelar
                </Button>
                <Button type="button" onClick={handleAddCulture}>
                  <Save className="mr-2" />
                  Salvar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedCulture && renderDetailView()}
    </div>
  );
};

export default CultureDetailTable;
