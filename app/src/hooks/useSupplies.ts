import { useState, useCallback, useEffect } from 'react';

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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function useSupplies() {
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const fetchSupplies = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/supplies`, {
        headers: getHeaders()
      });
      if (!response.ok) throw new Error('Falha ao buscar suprimentos');
      const data = await response.json();
      setSupplies(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createSupply = async (supplyData: Omit<Supply, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch(`${API_URL}/supplies`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(supplyData)
      });
      if (!response.ok) throw new Error('Falha ao criar suprimento');
      const newSupply = await response.json();
      setSupplies(prev => [newSupply, ...prev]);
      return newSupply;
    } catch (err) {
      throw err;
    }
  };

  const updateSupply = async (id: string, supplyData: Partial<Supply>) => {
    try {
      const response = await fetch(`${API_URL}/supplies/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(supplyData)
      });
      if (!response.ok) throw new Error('Falha ao atualizar suprimento');
      const updatedSupply = await response.json();
      setSupplies(prev => prev.map(s => s.id === id ? updatedSupply : s));
      return updatedSupply;
    } catch (err) {
      throw err;
    }
  };

  const deleteSupply = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/supplies/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (!response.ok) throw new Error('Falha ao deletar suprimento');
      setSupplies(prev => prev.filter(s => s.id !== id));
    } catch (err) {
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
