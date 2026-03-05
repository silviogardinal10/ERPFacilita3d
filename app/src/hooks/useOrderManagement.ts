import { useState, useCallback, useMemo } from 'react';
import type { Order, OrderStatus, PaymentStatus, DashboardStats } from '@/types';

// Dados mockados iniciais
const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'PED-2024-001',
    customer: {
      id: 'c1',
      name: 'João Silva',
      email: 'joao@email.com',
      phone: '(11) 98765-4321',
      address: {
        street: 'Rua das Flores',
        number: '123',
        complement: 'Apto 45',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01000-000',
      },
    },
    items: [
      {
        productId: '1',
        productName: 'Suporte para Celular',
        quantity: 2,
        unitPrice: 29.90,
        totalPrice: 59.80,
      },
    ],
    subtotal: 59.80,
    shippingCost: 15.00,
    discount: 0,
    total: 74.80,
    status: 'delivered',
    paymentStatus: 'paid',
    shopeeOrderId: '240301ABC123',
    trackingCode: 'BR123456789XX',
    notes: 'Cliente pediu embalagem para presente',
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-05'),
  },
  {
    id: '2',
    orderNumber: 'PED-2024-002',
    customer: {
      id: 'c2',
      name: 'Maria Santos',
      email: 'maria@email.com',
      phone: '(11) 91234-5678',
      address: {
        street: 'Av. Principal',
        number: '456',
        neighborhood: 'Jardim',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '02000-000',
      },
    },
    items: [
      {
        productId: '3',
        productName: 'Chaveiro Personalizado',
        quantity: 3,
        unitPrice: 15.90,
        totalPrice: 47.70,
      },
      {
        productId: '2',
        productName: 'Porta Canetas',
        quantity: 1,
        unitPrice: 39.90,
        totalPrice: 39.90,
      },
    ],
    subtotal: 87.60,
    shippingCost: 12.00,
    discount: 8.76,
    total: 90.84,
    status: 'shipped',
    paymentStatus: 'paid',
    shopeeOrderId: '240302DEF456',
    trackingCode: 'BR987654321XX',
    notes: '',
    createdAt: new Date('2024-03-02'),
    updatedAt: new Date('2024-03-04'),
  },
  {
    id: '3',
    orderNumber: 'PED-2024-003',
    customer: {
      id: 'c3',
      name: 'Pedro Costa',
      email: 'pedro@email.com',
      phone: '(11) 94567-8901',
      address: {
        street: 'Rua do Comércio',
        number: '789',
        neighborhood: 'Bela Vista',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '03000-000',
      },
    },
    items: [
      {
        productId: '1',
        productName: 'Suporte para Celular',
        quantity: 1,
        unitPrice: 29.90,
        totalPrice: 29.90,
      },
    ],
    subtotal: 29.90,
    shippingCost: 15.00,
    discount: 0,
    total: 44.90,
    status: 'processing',
    paymentStatus: 'paid',
    notes: 'Aguardando impressão',
    createdAt: new Date('2024-03-05'),
    updatedAt: new Date('2024-03-05'),
  },
  {
    id: '4',
    orderNumber: 'PED-2024-004',
    customer: {
      id: 'c4',
      name: 'Ana Oliveira',
      email: 'ana@email.com',
      phone: '(11) 97890-1234',
      address: {
        street: 'Rua das Palmeiras',
        number: '321',
        neighborhood: 'Vila Nova',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '04000-000',
      },
    },
    items: [
      {
        productId: '2',
        productName: 'Porta Canetas',
        quantity: 2,
        unitPrice: 39.90,
        totalPrice: 79.80,
      },
    ],
    subtotal: 79.80,
    shippingCost: 12.00,
    discount: 7.98,
    total: 83.82,
    status: 'pending',
    paymentStatus: 'pending',
    notes: '',
    createdAt: new Date('2024-03-06'),
    updatedAt: new Date('2024-03-06'),
  },
];

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
    
    // Crescimento mensal (simulado)
    const monthlyGrowth = 15.5;

    return {
      totalSales,
      totalRevenue,
      totalProfit,
      pendingOrders,
      lowStockProducts: 0, // Será preenchido pelo useProductManagement
      monthlyGrowth,
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
