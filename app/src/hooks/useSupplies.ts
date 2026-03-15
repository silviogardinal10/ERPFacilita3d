import { useState, useCallback, useEffect } from 'react';
import api from '../lib/api';

export interface Supply {
  id: string;
  name: string;
  type: string;
  pricePaid: number;
  quantity: number;
  unit: string;
  color?: string | null;
  createdAt: string;
  updatedAt: string;
}

export function useSupplies() {
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSupplies = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('/supplies');
      setSupplies(response.data);
    } catch (err: any) {
      console.error('Failed to fetch supplies:', err);
      setError(err.message || 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createSupply = async (supplyData: Omit<Supply, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await api.post('/supplies', supplyData);
      setSupplies(prev => [response.data, ...prev]);
      return response.data;
    } catch (err) {
      console.error('Failed to create supply:', err);
      throw err;
    }
  };

  const updateSupply = async (id: string, supplyData: Partial<Supply>) => {
    try {
      const response = await api.put(`/supplies/${id}`, supplyData);
      setSupplies(prev => prev.map(s => s.id === id ? response.data : s));
      return response.data;
    } catch (err) {
      console.error('Failed to update supply:', err);
      throw err;
    }
  };

  const deleteSupply = async (id: string) => {
    try {
      await api.delete(`/supplies/${id}`);
      setSupplies(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error('Failed to delete supply:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchSupplies();
  }, [fetchSupplies]);

  return {
    supplies,
    isLoading,
    error,
    createSupply,
    updateSupply,
    deleteSupply,
    refreshSupplies: fetchSupplies
  };
}
