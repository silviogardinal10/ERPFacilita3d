import { useState, useCallback, useEffect } from 'react';
import api from '../lib/api';

export interface Product3D {
  id: string;
  name: string;
  photo?: string;
  filamentPrice: number;
  filamentWeight: number;
  powerConsumption: number;
  printTimeHours: number;
  printTimeMinutes: number;
  filamentWeightUsed: number;
  kwhPrice: number;
  printerValue: number;
  printerLifeHours: number;
  wastePercentage: number;
  totalCost: number;
  shopeePrice?: number;
  tiktokPrice?: number;
  temuPrice?: number;
  packagingCost?: number;
  createdAt: Date;
  updatedAt: Date;
}

export function use3DProducts() {
  const [products, setProducts] = useState<Product3D[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const createProduct = useCallback(async (productData: Omit<Product3D, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await api.post('/products', productData);
      setProducts(prev => [response.data, ...prev]);
      return response.data;
    } catch (error) {
      console.error('Failed to create product', error);
      throw error;
    }
  }, []);

  const updateProduct = useCallback(async (id: string, data: Partial<Product3D>) => {
    try {
      const response = await api.put(`/products/${id}`, data);
      setProducts(prev => prev.map(p =>
        p.id === id ? response.data : p
      ));
    } catch (error) {
      console.error('Failed to update product', error);
      throw error;
    }
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    try {
      await api.delete(`/products/${id}`);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Failed to delete product', error);
      throw error;
    }
  }, []);

  const getProductById = useCallback((id: string) => {
    return products.find(p => p.id === id);
  }, [products]);

  const searchProducts = useCallback((query: string) => {
    if (!query.trim()) return products;
    const lowerQuery = query.toLowerCase();
    return products.filter(p =>
      p.name.toLowerCase().includes(lowerQuery)
    );
  }, [products]);

  return {
    products,
    isLoading,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    searchProducts,
    refreshProducts: fetchProducts
  };
}
