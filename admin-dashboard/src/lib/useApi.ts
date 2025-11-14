// useApi.ts
// Hook personalizado para fazer chamadas à API de forma padronizada
import { useState, useEffect } from 'react';
import api from './api';

interface ApiHook<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const useApi = <T,>(url: string, deps: React.DependencyList = []): ApiHook<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(url);
      setData(response.data);
    } catch (err) {
      console.error(`Erro ao buscar dados de ${url}:`, err);
      setError('Falha ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, refetch: fetchData };
};

export { useApi };