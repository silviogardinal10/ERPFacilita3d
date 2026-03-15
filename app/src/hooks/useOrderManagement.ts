import { useState, useCallback, useMemo } from 'react';
import type { Order, OrderStatus, PaymentStatus, DashboardStats } from '@/types';

const mockOrders: Order[] = [];

export function useOrderManagement() {
  const [orders, setOrders] = useState<Order[]>(mockOrders);

  // Estatísticas do dashboard
  const stats: DashboardStats = useMemo(() => {
    const totalSales = orders.filter(o => o.status === 'delivered').length;
    const totalRevenue = orders
      .filter(o => o.paymentStatus === 'paid')
      .reduce((acc, o) => acc + o.total, 0);
    const totalProfit = orders
      .filter(o => o.paymentStatus === 'paid')
      .reduce((acc, o) => acc + (o.total * 0.3), 0); // Estimativa de 30% lucro
    const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'processing').length;
    
    // Estatísticas por plataforma
    const getPlatformStats = (platformName: 'shopee' | 'tiktok' | 'temu') => {
      const platformOrders = orders.filter(o => o.platform === platformName);
      return {
        totalSales: platformOrders.filter(o => o.status === 'delivered').length,
        totalRevenue: platformOrders.filter(o => o.paymentStatus === 'paid').reduce((acc, o) => acc + o.total, 0),
        pendingOrders: platformOrders.filter(o => o.status === 'pending' || o.status === 'processing').length,
      };
    };

    const platforms = {
      shopee: getPlatformStats('shopee'),
      tiktok: getPlatformStats('tiktok'),
      temu: getPlatformStats('temu'),
    };

    // Crescimento mensal (simulado)
    const monthlyGrowth = 15.5;

    return {
      totalSales,
      totalRevenue,
      totalProfit,
      pendingOrders,
      lowStockProducts: 0, // Será preenchido pelo useProductManagement
      monthlyGrowth,
      platforms,
    };
  }, [orders]);

  // Pedidos pendentes
  const pendingOrdersList = useMemo(() => {
    return orders.filter(o => o.status === 'pending' || o.status === 'processing');
  }, [orders]);

  // Pedidos recentes
  const recentOrders = useMemo(() => {
    return [...orders].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ).slice(0, 10);
  }, [orders]);

  // Criar novo pedido
  const createOrder = useCallback((orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>) => {
    const newOrder: Order = {
      ...orderData,
      id: Date.now().toString(),
      orderNumber: `PED-${new Date().getFullYear()}-${String(orders.length + 1).padStart(3, '0')}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  }, [orders.length]);

  // Atualizar status do pedido
  const updateOrderStatus = useCallback((orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => 
      o.id === orderId ? { ...o, status, updatedAt: new Date() } : o
    ));
  }, []);

  // Atualizar status de pagamento
  const updatePaymentStatus = useCallback((orderId: string, paymentStatus: PaymentStatus) => {
    setOrders(prev => prev.map(o => 
      o.id === orderId ? { ...o, paymentStatus, updatedAt: new Date() } : o
    ));
  }, []);

  // Adicionar código de rastreio
  const addTrackingCode = useCallback((orderId: string, trackingCode: string) => {
    setOrders(prev => prev.map(o => 
      o.id === orderId ? { ...o, trackingCode, updatedAt: new Date() } : o
    ));
  }, []);

  // Cancelar pedido
  const cancelOrder = useCallback((orderId: string, reason: string) => {
    setOrders(prev => prev.map(o => 
      o.id === orderId 
        ? { ...o, status: 'cancelled', notes: reason, updatedAt: new Date() } 
        : o
    ));
  }, []);

  // Buscar pedido por ID
  const getOrderById = useCallback((id: string) => {
    return orders.find(o => o.id === id);
  }, [orders]);

  // Buscar pedidos por status
  const getOrdersByStatus = useCallback((status: OrderStatus) => {
    return orders.filter(o => o.status === status);
  }, [orders]);

  return {
    orders,
    stats,
    pendingOrdersList,
    recentOrders,
    createOrder,
    updateOrderStatus,
    updatePaymentStatus,
    addTrackingCode,
    cancelOrder,
    getOrderById,
    getOrdersByStatus,
  };
}
