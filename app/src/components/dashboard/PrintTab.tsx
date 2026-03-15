import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ShoppingBag, 
  Printer,
  PrinterIcon,
  Store,
  Smartphone,
  ShoppingBasket
} from 'lucide-react';
import { useOrderManagement } from '@/hooks/useOrderManagement';
import { formatCurrency } from '@/lib/utils';
import type { OrderStatus } from '@/types';

interface PrintTabProps {
  onPrintLabel: (orderId: string) => void;
  onBulkPrint: () => void;
}

type Platform = 'all' | 'shopee' | 'tiktok' | 'temu';

export function PrintTab({ onPrintLabel, onBulkPrint }: PrintTabProps) {
  const { recentOrders, updateOrderStatus } = useOrderManagement();
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('all');

  // Filter orders by platform - Here we simulate it since original type may not have 'platform' field yet
  // We'll treat all as shopee for now, but UI will have the filters ready for backend integration
  const filteredOrders = useMemo(() => {
    if (selectedPlatform === 'all') return recentOrders;
    
    return recentOrders.filter(order => {
       // Assumindo que num futuro o pedido terá `platform` definido
      const platform = (order as any).platform || 'shopee';
      return platform === selectedPlatform;
    });
  }, [recentOrders, selectedPlatform]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Impressão de Etiquetas</h2>
        <p className="text-slate-500">Selecione a conta e imprima suas etiquetas de envio</p>
      </div>

      {/* Account Selection */}
      <div className="flex gap-4 flex-wrap">
        <Button 
          variant={selectedPlatform === 'all' ? 'default' : 'outline'}
          onClick={() => setSelectedPlatform('all')}
          className="gap-2"
        >
          Todas as Contas
        </Button>
        <Button 
          variant={selectedPlatform === 'shopee' ? 'default' : 'outline'}
          onClick={() => setSelectedPlatform('shopee')}
          className="gap-2"
        >
          <Store className="h-4 w-4" />
          Shopee
        </Button>
        <Button 
          variant={selectedPlatform === 'tiktok' ? 'default' : 'outline'}
          onClick={() => setSelectedPlatform('tiktok')}
          className="gap-2"
        >
          <Smartphone className="h-4 w-4" />
          TikTok Shop
        </Button>
        <Button 
          variant={selectedPlatform === 'temu' ? 'default' : 'outline'}
          onClick={() => setSelectedPlatform('temu')}
          className="gap-2"
        >
          <ShoppingBasket className="h-4 w-4" />
          Temu
        </Button>
      </div>

      {/* Orders Table for Printing */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <PrinterIcon className="h-5 w-5" />
            Pedidos Pendentes de Impressão
          </CardTitle>
          <Button 
            variant="default" 
            size="sm" 
            onClick={onBulkPrint}
            className="gap-2"
          >
            <PrinterIcon className="h-4 w-4" />
            Imprimir Seleção
          </Button>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              Nenhum pedido encontrado para esta conta.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-slate-500">Pedido</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-500">Cliente</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-500">Conta/Plataforma</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-500">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-500">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => {
                    const platform = (order as any).platform || 'Shopee';
                    
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
                            <Badge variant="outline" className="capitalize">{platform}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={order.status === 'pending' ? 'default' : 'secondary'}>
                            {order.status === 'pending' ? 'Pendente' : 'Processando'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                updateOrderStatus(order.id, 'processing');
                                onPrintLabel(order.id);
                              }}
                              className="gap-2"
                            >
                              <Printer className="h-4 w-4" />
                              Imprimir
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
