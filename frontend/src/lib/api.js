// Use Vite environment variables (Vite exposes them under import.meta.env)
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

export const fetchParcels = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/parcels`);
    if (!response.ok) {
      throw new Error("Failed to fetch parcels");
    }
    return await response.json();
  } catch (error) {
    // Tratar erro ao buscar parcelas se necessário
    throw error;
  }
};

export const fetchCrops = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/crops`);
    if (!response.ok) {
      throw new Error("Failed to fetch crops");
    }
    return await response.json();
  } catch (error) {
    // Tratar erro ao buscar culturas se necessário
    throw error;
  }
};

export const fetchInventory = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/inventory`);
    if (!response.ok) {
      throw new Error("Failed to fetch inventory");
    }
    return await response.json();
  } catch (error) {
    // Tratar erro ao buscar inventário se necessário
    throw error;
  }
};

export const fetchFinanceRecords = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/finance`);
    if (!response.ok) {
      throw new Error("Failed to fetch finance records");
    }
    return await response.json();
  } catch (error) {
    // Tratar erro ao buscar registros financeiros se necessário
    throw error;
  }
};
