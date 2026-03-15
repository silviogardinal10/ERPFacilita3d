import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  DollarSign, 
  Package, 
  ShoppingBag, 
  AlertTriangle,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  RotateCcw
} from 'lucide-react';
import { useOrderManagement } from '@/hooks/useOrderManagement';
import { useProductManagement } from '@/hooks/useProductManagement';
import { formatCurrency } from '@/lib/utils';
import type { OrderStatus } from '@/types';

interface DashboardProps {}

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'Pendente', color: 'bg-amber-100 text-amber-800', icon: Clock },
  processing: { label: 'Processando', color: 'bg-blue-100 text-blue-800', icon: RotateCcw },
  shipped: { label: 'Enviado', color: 'bg-purple-100 text-purple-800', icon: Truck },
  delivered: { label: 'Entregue', color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle2 },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: XCircle },
  returned: { label: 'Devolvido', color: 'bg-slate-100 text-slate-800', icon: RotateCcw },
};

export function Dashboard({ }: DashboardProps) {
  const { stats, recentOrders, pendingOrdersList, updateOrderStatus } = useOrderManagement();
  const { lowStockProducts, totalActiveProducts, totalStockValue } = useProductManagement();
  const [platformFilter, setPlatformFilter] = useState<'all' | 'shopee' | 'tiktok' | 'temu'>('all');

  const combinedStats = {
    ...stats,
    lowStockProducts: lowStockProducts.length,
  };

  const displayStats = platformFilter === 'all' 
    ? combinedStats 
    : {
        totalSales: combinedStats.platforms?.[platformFilter]?.totalSales || 0,
        totalRevenue: combinedStats.platforms?.[platformFilter]?.totalRevenue || 0,
        totalProfit: (combinedStats.platforms?.[platformFilter]?.totalRevenue || 0) * 0.3,
        pendingOrders: combinedStats.platforms?.[platformFilter]?.pendingOrders || 0,
        lowStockProducts: combinedStats.lowStockProducts,
        monthlyGrowth: combinedStats.monthlyGrowth
      };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
          <p className="text-slate-500">Visão geral do seu negócio</p>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-500">Filtrar por Conta:</span>
          <Select value={platformFilter} onValueChange={(val: any) => setPlatformFilter(val)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Todas as Contas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Contas</SelectItem>
              <SelectItem value="shopee">Shopee</SelectItem>
              <SelectItem value="tiktok">TikTok Shop</SelectItem>
              <SelectItem value="temu">Temu</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Vendas Totais</p>
                <p className="text-2xl font-bold">{displayStats.totalSales}</p>
              </div>
              <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-4 text-sm">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              <span className="text-emerald-600 font-medium">+{displayStats.monthlyGrowth}%</span>
              <span className="text-slate-500">este mês</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Receita Total</p>
                <p className="text-2xl font-bold">{formatCurrency(displayStats.totalRevenue)}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-4 text-sm">
              <span className="text-slate-500">Lucro estimado:</span>
              <span className="text-emerald-600 font-medium">{formatCurrency(displayStats.totalProfit)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Pedidos Pendentes</p>
                <p className="text-2xl font-bold">{displayStats.pendingOrders}</p>
              </div>
              <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-4 text-sm">
              <span className="text-slate-500">Precisam de atenção</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Estoque Baixo</p>
                <p className="text-2xl font-bold">{displayStats.lowStockProducts}</p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-4 text-sm">
              <span className="text-slate-500">Produtos abaixo do mínimo</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto">
          <TabsTrigger value="orders">Pedidos</TabsTrigger>
          <TabsTrigger value="stock">Estoque</TabsTrigger>
          <TabsTrigger value="products">Produtos</TabsTrigger>
        </TabsList>

        {/* Pedidos Tab */}
        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Pedidos Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-slate-500">Pedido</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-500">Cliente</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-500">Total</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-500">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-500">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => {
                      const StatusIcon = statusConfig[order.status].icon;
                      return (
                        <tr key={order.id} className="border-b hover:bg-slate-50">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium">{order.orderNumber}</p>
                              <p className="text-xs text-slate-500">{order.shopeeOrderId}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium">{order.customer.name}</p>
                              <p className="text-xs text-slate-500">{order.customer.phone}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-medium">{formatCurrency(order.total)}</p>
                            <p className="text-xs text-slate-500">
                              {order.items.reduce((acc, i) => acc + i.quantity, 0)} itens
                            </p>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={statusConfig[order.status].color}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusConfig[order.status].label}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              {order.status === 'pending' && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => updateOrderStatus(order.id, 'processing')}
                                >
                                  Processar
                                </Button>
                              )}
                              {order.status === 'processing' && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => updateOrderStatus(order.id, 'shipped')}
                                >
                                  Enviar
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Pedidos Pendentes */}
          {pendingOrdersList.length > 0 && (
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-amber-800">
                  <AlertTriangle className="h-5 w-5" />
                  Pedidos Pendentes de Ação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingOrdersList.map((order) => (
                    <div key={order.id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                      <div>
                        <p className="font-medium">{order.orderNumber}</p>
                        <p className="text-sm text-slate-500">{order.customer.name}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={statusConfig[order.status].color}>
                          {statusConfig[order.status].label}
                        </Badge>
                        <Button 
                          size="sm"
                          onClick={() => updateOrderStatus(
                            order.id, 
                            order.status === 'pending' ? 'processing' : 'shipped'
                          )}
                        >
                          {order.status === 'pending' ? 'Processar' : 'Enviar'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Estoque Tab */}
        <TabsContent value="stock" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-slate-500">Produtos Ativos</p>
                <p className="text-3xl font-bold">{totalActiveProducts}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-slate-500">Valor em Estoque</p>
                <p className="text-3xl font-bold">{formatCurrency(totalStockValue)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-slate-500">Produtos com Estoque Baixo</p>
                <p className="text-3xl font-bold text-red-600">{lowStockProducts.length}</p>
              </CardContent>
            </Card>
          </div>

          {lowStockProducts.length > 0 && (
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-red-800">
                  <AlertTriangle className="h-5 w-5" />
                  Produtos com Estoque Baixo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-slate-500">Produto</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-500">SKU</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-500">Estoque Atual</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-500">Mínimo</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-500">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lowStockProducts.map((product) => (
                        <tr key={product.id} className="border-b hover:bg-slate-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 bg-slate-200 rounded-lg flex items-center justify-center">
                                <Package className="h-5 w-5 text-slate-500" />
                              </div>
                              <div>
                                <p className="font-medium">{product.name}</p>
                                <p className="text-xs text-slate-500">{product.category}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono text-sm">{product.sku}</td>
                          <td className="py-3 px-4">
                            <span className="text-red-600 font-bold">{product.stockQuantity}</span>
                          </td>
                          <td className="py-3 px-4">{product.minStockLevel}</td>
                          <td className="py-3 px-4">
                            <Badge variant="destructive">Estoque Baixo</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Produtos Tab */}
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Todos os Produtos</CardTitle>
              <Button>Adicionar Produto</Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-slate-500">Produto</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-500">SKU</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-500">Estoque</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-500">Custo</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-500">Preço</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Aqui você pode mapear os produtos reais */}
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        Funcionalidade de gerenciamento completo de produtos em desenvolvimento
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
