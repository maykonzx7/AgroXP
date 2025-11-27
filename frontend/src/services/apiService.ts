// apiService.ts
// Avoid calling React hooks from non-component modules. Read token from localStorage.
// Using direct backend URL to bypass gateway timeout issues
const API_BASE_URL = "http://localhost:3001/api";

// Generic fetch function with authentication
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("authToken");

  const defaultOptions: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  };

  const fullUrl = `${API_BASE_URL}${url}`;
  const requestBody = options.body ? JSON.parse(options.body as string) : null;
  
  // Log request details in development (sem dados sensíveis)
  if (process.env.NODE_ENV === 'development') {
    // Remove dados sensíveis do log
    const sanitizedBody = requestBody ? Object.keys(requestBody).reduce((acc: any, key) => {
      const lowerKey = key.toLowerCase();
      if (lowerKey.includes('password') || lowerKey.includes('token') || lowerKey.includes('secret')) {
        acc[key] = '[REDACTED]';
      } else {
        acc[key] = requestBody[key];
      }
      return acc;
    }, {}) : null;
    
    console.log(`[API Request] ${options.method || 'GET'} ${fullUrl}`, {
      hasToken: !!token,
      body: sanitizedBody,
    });
  }

  const response = await fetch(fullUrl, {
    ...defaultOptions,
    ...options,
  });

  if (!response.ok) {
    const json = await response.json().catch(() => ({}));
    const errorMessage = json.error || json.message || `HTTP error! status: ${response.status}`;
    
    // Se for erro de autenticação, limpar token e redirecionar
    if (response.status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("authUser");
      window.dispatchEvent(new CustomEvent('userLoggedOut'));
    }
    
    // Para erros 404 em endpoints opcionais (feeding, vaccination, etc), não logar como erro crítico
    // Esses endpoints podem não ter dados ainda e isso é normal
    const isOptionalEndpoint = url.includes('/feeding') || 
                               url.includes('/vaccination') || 
                               url.includes('/reproduction') || 
                               url.includes('/supplies') || 
                               url.includes('/supply-usage') ||
                               url.includes('/harvest');
    
    if (response.status === 404 && isOptionalEndpoint) {
      // Para endpoints opcionais que retornam 404, retornar array vazio silenciosamente
      // Isso evita logs de erro desnecessários quando não há dados
      if (process.env.NODE_ENV === 'development') {
        console.log(`[API] Endpoint opcional sem dados: ${fullUrl} (404 - normal se não houver dados)`);
      }
      return [];
    }
    
    // Remove dados sensíveis do log de erro
    const sanitizedDetails = json ? Object.keys(json).reduce((acc: any, key) => {
      const lowerKey = key.toLowerCase();
      if (lowerKey.includes('password') || lowerKey.includes('token') || lowerKey.includes('secret')) {
        acc[key] = '[REDACTED]';
      } else {
        acc[key] = json[key];
      }
      return acc;
    }, {}) : json;
    
    console.error(`❌ API Error [${response.status}]:`, {
      url: fullUrl,
      method: options.method || 'GET',
      error: errorMessage,
      details: sanitizedDetails,
    });
    throw new Error(errorMessage);
  }

  const responseData = await response.json();
  
  // Log successful response in development (sem dados sensíveis)
  if (process.env.NODE_ENV === 'development') {
    // Remove dados sensíveis do log
    const sanitizedData = responseData ? Object.keys(responseData).reduce((acc: any, key) => {
      const lowerKey = key.toLowerCase();
      if (lowerKey.includes('password') || lowerKey.includes('token') || lowerKey.includes('secret')) {
        acc[key] = '[REDACTED]';
      } else if (Array.isArray(responseData[key])) {
        // Para arrays, limita tamanho e sanitiza
        acc[key] = responseData[key].slice(0, 5).map((item: any) => {
          if (typeof item === 'object') {
            return Object.keys(item).reduce((itemAcc: any, itemKey) => {
              const lowerItemKey = itemKey.toLowerCase();
              if (lowerItemKey.includes('password') || lowerItemKey.includes('token') || lowerItemKey.includes('secret')) {
                itemAcc[itemKey] = '[REDACTED]';
              } else {
                itemAcc[itemKey] = item[itemKey];
              }
              return itemAcc;
            }, {});
          }
          return item;
        });
      } else {
        acc[key] = responseData[key];
      }
      return acc;
    }, {}) : null;
    
    console.log(`✅ API Success [${response.status}]:`, {
      url: fullUrl,
      method: options.method || 'GET',
      data: sanitizedData,
    });
  }

  return responseData;
};

// Parcels API
export const parcelsApi = {
  getAll: () => fetchWithAuth("/parcels"),
  getById: (id: string) => fetchWithAuth(`/parcels/${id}`),
  create: (data: any) =>
    fetchWithAuth("/parcels", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    fetchWithAuth(`/parcels/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchWithAuth(`/parcels/${id}`, {
      method: "DELETE",
    }),
};

// Crops API
export const cropsApi = {
  getAll: () => fetchWithAuth("/crops"),
  getById: (id: string) => fetchWithAuth(`/crops/${id}`),
  create: (data: any) =>
    fetchWithAuth("/crops", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    fetchWithAuth(`/crops/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchWithAuth(`/crops/${id}`, {
      method: "DELETE",
    }),
};

// Livestock API
export const livestockApi = {
  getAll: () => fetchWithAuth("/livestock"),
  getById: (id: string) => fetchWithAuth(`/livestock/${id}`),
  create: (data: any) =>
    fetchWithAuth("/livestock", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    fetchWithAuth(`/livestock/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchWithAuth(`/livestock/${id}`, {
      method: "DELETE",
    }),
};

// Feeding API
export const feedingApi = {
  getAll: () => fetchWithAuth("/livestock/feeding"),
  getByLivestock: (livestockId: string) =>
    fetchWithAuth(`/livestock/feeding/livestock/${livestockId}`),
  create: (data: any) =>
    fetchWithAuth("/livestock/feeding", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    fetchWithAuth(`/livestock/feeding/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchWithAuth(`/livestock/feeding/${id}`, {
      method: "DELETE",
    }),
};

// Vaccination API
export const vaccinationApi = {
  getAll: () => fetchWithAuth("/livestock/vaccination"),
  getByLivestock: (livestockId: string) =>
    fetchWithAuth(`/livestock/vaccination/livestock/${livestockId}`),
  create: (data: any) =>
    fetchWithAuth("/livestock/vaccination", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    fetchWithAuth(`/livestock/vaccination/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchWithAuth(`/livestock/vaccination/${id}`, {
      method: "DELETE",
    }),
};

// Reproduction API
export const reproductionApi = {
  getAll: () => fetchWithAuth("/livestock/reproduction"),
  getByLivestock: (livestockId: string) =>
    fetchWithAuth(`/livestock/reproduction/livestock/${livestockId}`),
  create: (data: any) =>
    fetchWithAuth("/livestock/reproduction", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    fetchWithAuth(`/livestock/reproduction/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchWithAuth(`/livestock/reproduction/${id}`, {
      method: "DELETE",
    }),
};

// Veterinary Supply API
export const veterinarySupplyApi = {
  getAll: () => fetchWithAuth("/livestock/supplies"),
  getById: (id: string) => fetchWithAuth(`/livestock/supplies/${id}`),
  create: (data: any) =>
    fetchWithAuth("/livestock/supplies", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    fetchWithAuth(`/livestock/supplies/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchWithAuth(`/livestock/supplies/${id}`, {
      method: "DELETE",
    }),
};

// Supply Usage API
export const supplyUsageApi = {
  getAll: () => fetchWithAuth("/livestock/supply-usage"),
  getByLivestock: (livestockId: string) =>
    fetchWithAuth(`/livestock/supply-usage/livestock/${livestockId}`),
  create: (data: any) =>
    fetchWithAuth("/livestock/supply-usage", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    fetchWithAuth(`/livestock/supply-usage/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchWithAuth(`/livestock/supply-usage/${id}`, {
      method: "DELETE",
    }),
};

// Inventory API
export const inventoryApi = {
  getAll: () => fetchWithAuth("/inventory"),
  getById: (id: string) => fetchWithAuth(`/inventory/${id}`),
  create: (data: any) =>
    fetchWithAuth("/inventory", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    fetchWithAuth(`/inventory/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchWithAuth(`/inventory/${id}`, {
      method: "DELETE",
    }),
};

// Finance API
export const financeApi = {
  getAll: () => fetchWithAuth("/finance"),
  getById: (id: string) => fetchWithAuth(`/finance/${id}`),
  create: (data: any) =>
    fetchWithAuth("/finance", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    fetchWithAuth(`/finance/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchWithAuth(`/finance/${id}`, {
      method: "DELETE",
    }),
};

// Harvest API
export const harvestApi = {
  getAll: () => fetchWithAuth("/harvest"),
  getById: (id: string) => fetchWithAuth(`/harvest/${id}`),
  create: (data: any) =>
    fetchWithAuth("/harvest", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    fetchWithAuth(`/harvest/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchWithAuth(`/harvest/${id}`, {
      method: "DELETE",
    }),
};
