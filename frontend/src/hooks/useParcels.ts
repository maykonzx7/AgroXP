import { useEffect, useState } from 'react';
import { fetchParcels } from '@/lib/api';

interface Parcel {
  _id: string;
  name: string;
  size: number;
  location: string;
  createdAt: string;
}

export const useParcels = () => {
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadParcels = async () => {
      try {
        setLoading(true);
        const data = await fetchParcels();
        setParcels(data);
      } catch (err) {
        setError('Failed to fetch parcels');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadParcels();
  }, []);

  return { parcels, loading, error };
};