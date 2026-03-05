import { useState, useCallback, useMemo } from 'react';
import type { Product, StockMovement } from '@/types';

// Dados mockados iniciais
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Suporte para Celular',
    description: 'Suporte ajustável para celular',
    sku: 'SUP-001',
    category: 'Acessórios',
    stockQuantity: 15,
    minStockLevel: 5,
    manufacturingCost: 8.50,
    suggestedPrice: 25.90,
    finalPrice: 29.90,
    weight: 80,
    dimensions: { length: 12, width: 8, height: 10 },
    images: [],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    isActive: true,
  },
  {
    id: '2',
    name: 'Porta Canetas',
    description: 'Organizador de mesa para canetas',
    sku: 'PORT-002',
    category: 'Organização',
    stockQuantity: 8,
    minStockLevel: 10,
    manufacturingCost: 12.00,
    suggestedPrice: 35.90,
    finalPrice: 39.90,
    weight: 120,
    dimensions: { length: 15, width: 10, height: 12 },
    images: [],
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
    isActive: true,
  },
  {
    id: '3',
    name: 'Chaveiro Personalizado',
    description: 'Chaveiro com nome personalizado',
    sku: 'CHAV-003',
    category: 'Personalizados',
    stockQuantity: 25,
    minStockLevel: 8,
    manufacturingCost: 3.50,
    suggestedPrice: 12.90,
    finalPrice: 15.90,
    weight: 15,
    dimensions: { length: 6, width: 3, height: 0.5 },
    images: [],
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
    isActive: true,
  },
];

const mockStockMovements: StockMovement[] = [
  {
    id: '1',
    productId: '1',
    productName: 'Suporte para Celular',
    type: 'out',
    quantity: 2,
    reason: 'Venda #1234',
    createdAt: new Date('2024-03-01'),
  },
  {
    id: '2',
    productId: '2',
    productName: 'Porta Canetas',
    type: 'out',
    quantity: 1,
    reason: 'Venda #1235',
    createdAt: new Date('2024-03-01'),
  },
];

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
