// Tipos para o ERP de Impressão 3D e Gestão Shopee

// ==================== MÓDULO DE CUSTO 3D ====================

export interface FilamentData {
  price: number;           // Preço do rolo de filamento (R$)
  weight: number;          // Peso do rolo (g)
}

export interface PrinterData {
  powerConsumption: number;    // Consumo da impressora (W)
  printTimeHours: number;      // Tempo de impressão (horas)
  printTimeMinutes: number;    // Tempo de impressão (minutos)
  filamentWeightUsed: number;  // Peso do filamento usado (g)
}

export interface EnergyData {
  kwhPrice: number;        // Preço do kWh (R$)
}

export interface DepreciationData {
  printerValue: number;    // Valor da impressora (R$)
  totalLifeHours: number;  // Horas de vida útil estimada
}

export interface WasteConfig {
  wastePercentage: number; // % de margem de segurança para falhas
}

export interface Cost3DCalculation {
  filamentCostPerGram: number;
  energyCostPerHour: number;
  depreciationCostPerHour: number;
  totalFilamentCost: number;
  totalEnergyCost: number;
  totalDepreciationCost: number;
  wasteCost: number;
  totalManufacturingCost: number;
}

// ==================== MÓDULO DE PRECIFICAÇÃO SHOPEE ====================

export interface ShopeeFees {
  commissionPercentage: number;  // % de comissão da Shopee
  fixedFee: number;              // Valor fixo por item (R$)
}

export interface PackagingCosts {
  box: number;           // Custo da caixa (R$)
  tape: number;          // Custo da fita (R$)
  bubbleWrap: number;    // Custo do plástico bolha (R$)
  label: number;         // Custo da etiqueta (R$)
  other: number;         // Outros custos (R$)
}

export interface PricingConfig {
  profitMargin: number;      // % de margem de lucro desejada
  discountPercentage: number; // % de desconto para ofertas
}

export interface PricingCalculation {
  manufacturingCost: number;
  shopeeCommission: number;
  shopeeFixedFee: number;
  totalPackagingCost: number;
  subtotal: number;
  profitAmount: number;
  discountAmount: number;
  suggestedPrice: number;
  priceWithDiscount: number;
  breakEvenPrice: number;
}

// ==================== GESTÃO DE PRODUTOS ====================

export interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  category: string;
  stockQuantity: number;
  minStockLevel: number;
  manufacturingCost: number;
  suggestedPrice: number;
  finalPrice: number;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  images: string[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

// ==================== GESTÃO DE VENDAS ====================

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: Customer;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  shopeeOrderId?: string;
  trackingCode?: string;
  platform?: 'shopee' | 'tiktok' | 'temu';
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: Address;
}

export interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

// ==================== ETIQUETAS ====================

export interface LabelData {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  address: Address;
  products: {
    name: string;
    quantity: number;
  }[];
  weight: number;
  shippingMethod: string;
  notes: string;
}

// ==================== DASHBOARD ====================

export interface PlatformStats {
  totalSales: number;
  totalRevenue: number;
  pendingOrders: number;
}

export interface DashboardStats {
  totalSales: number;
  totalRevenue: number;
  totalProfit: number;
  pendingOrders: number;
  lowStockProducts: number;
  monthlyGrowth: number;
  platforms: {
    shopee: PlatformStats;
    tiktok: PlatformStats;
    temu: PlatformStats;
  };
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'in' | 'out';
  quantity: number;
  reason: string;
  createdAt: Date;
}
