import { useState, useCallback, useMemo } from 'react';
import type { Product, StockMovement } from '@/types';

const mockProducts: Product[] = [];

const mockStockMovements: StockMovement[] = [];

export function useProductManagement() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(mockStockMovements);

  // Produtos com estoque baixo
  const lowStockProducts = useMemo(() => {
    return products.filter(p => p.stockQuantity <= p.minStockLevel && p.isActive);
  }, [products]);

  // Total de produtos ativos
  const totalActiveProducts = useMemo(() => {
    return products.filter(p => p.isActive).length;
  }, [products]);

  // Valor total em estoque
  const totalStockValue = useMemo(() => {
    return products.reduce((acc, p) => acc + (p.manufacturingCost * p.stockQuantity), 0);
  }, [products]);

  // Criar novo produto
  const createProduct = useCallback((productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProduct: Product = {
      ...productData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setProducts(prev => [...prev, newProduct]);
    return newProduct;
  }, []);

  // Atualizar produto
  const updateProduct = useCallback((id: string, data: Partial<Product>) => {
    setProducts(prev => prev.map(p => 
      p.id === id ? { ...p, ...data, updatedAt: new Date() } : p
    ));
  }, []);

  // Deletar produto (soft delete)
  const deleteProduct = useCallback((id: string) => {
    setProducts(prev => prev.map(p => 
      p.id === id ? { ...p, isActive: false, updatedAt: new Date() } : p
    ));
  }, []);

  // Atualizar estoque (entrada ou saída)
  const updateStock = useCallback((productId: string, quantity: number, type: 'in' | 'out', reason: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return false;

    const newQuantity = type === 'in' 
      ? product.stockQuantity + quantity 
      : product.stockQuantity - quantity;

    if (newQuantity < 0) return false;

    // Atualizar produto
    setProducts(prev => prev.map(p => 
      p.id === productId 
        ? { ...p, stockQuantity: newQuantity, updatedAt: new Date() } 
        : p
    ));

    // Registrar movimentação
    const movement: StockMovement = {
      id: Date.now().toString(),
      productId,
      productName: product.name,
      type,
      quantity,
      reason,
      createdAt: new Date(),
    };
    setStockMovements(prev => [movement, ...prev]);

    return true;
  }, [products]);

  // Buscar produto por ID
  const getProductById = useCallback((id: string) => {
    return products.find(p => p.id === id);
  }, [products]);

  // Buscar produtos por categoria
  const getProductsByCategory = useCallback((category: string) => {
    return products.filter(p => p.category === category && p.isActive);
  }, [products]);

  return {
    products,
    stockMovements,
    lowStockProducts,
    totalActiveProducts,
    totalStockValue,
    createProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    getProductById,
    getProductsByCategory,
  };
}
