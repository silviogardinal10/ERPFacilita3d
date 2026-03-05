import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Printer, 
  X, 
  Package, 
  CheckSquare,
  Square,
  Loader2,
  FileDown,
  CheckCircle2
} from 'lucide-react';
import type { Order, OrderStatus } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface BulkLabelPrinterProps {
  orders: Order[];
  onClose: () => void;
}

const statusConfig: Record<OrderStatus, { label: string; color: string }> = {
  pending: { label: 'Pendente', color: 'bg-amber-100 text-amber-800' },
  processing: { label: 'Processando', color: 'bg-blue-100 text-blue-800' },
  shipped: { label: 'Enviado', color: 'bg-purple-100 text-purple-800' },
  delivered: { label: 'Entregue', color: 'bg-emerald-100 text-emerald-800' },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
  returned: { label: 'Devolvido', color: 'bg-slate-100 text-slate-800' },
};

export function BulkLabelPrinter({ orders, onClose }: BulkLabelPrinterProps) {
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [isPrinting, setIsPrinting] = useState(false);
  const [printProgress, setPrintProgress] = useState(0);
  const [printComplete, setPrintComplete] = useState(false);
  const labelContainerRef = useRef<HTMLDivElement>(null);

  // Selecionar/deselecionar todos
  const toggleSelectAll = () => {
    if (selectedOrders.size === orders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(orders.map(o => o.id)));
    }
  };

  // Selecionar/deselecionar um pedido
  const toggleOrder = (orderId: string) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
  };

  // Imprimir etiquetas selecionadas
  const handlePrint = async () => {
    if (selectedOrders.size === 0) return;

    setIsPrinting(true);
    setPrintProgress(0);

    const selectedOrdersList = orders.filter(o => selectedOrders.has(o.id));
    const total = selectedOrdersList.length;

    // Simular progresso de impressão
    for (let i = 0; i < total; i++) {
      await new Promise(resolve => setTimeout(resolve, 300));
      setPrintProgress(Math.round(((i + 1) / total) * 100));
    }

    // Abrir janela de impressão
    const printWindow = window.open('', '_blank');
    if (printWindow && labelContainerRef.current) {
      const labelsHtml = selectedOrdersList.map(order => generateLabelHtml(order)).join('');
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Etiquetas - ${selectedOrders.size} pedidos</title>
            <style>
              @page {
                size: 100mm 150mm;
                margin: 0;
              }
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              body {
                font-family: Arial, sans-serif;
                font-size: 10pt;
                line-height: 1.3;
              }
              .label-page {
                width: 100mm;
                height: 150mm;
                padding: 4mm;
                border: 1px solid #000;
                page-break-after: always;
                page-break-inside: avoid;
              }
              .label-page:last-child {
                page-break-after: auto;
              }
              .header {
                text-align: center;
                border-bottom: 2px solid #000;
                padding-bottom: 2mm;
                margin-bottom: 3mm;
              }
              .order-number {
                font-size: 14pt;
                font-weight: bold;
              }
              .shopee-id {
                font-size: 9pt;
                color: #666;
              }
              .section {
                margin-bottom: 3mm;
              }
              .section-title {
                font-weight: bold;
                font-size: 9pt;
                border-bottom: 1px solid #ccc;
                margin-bottom: 1mm;
              }
              .customer-name {
                font-size: 12pt;
                font-weight: bold;
              }
              .address {
                font-size: 9pt;
              }
              .products-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 9pt;
              }
              .products-table th,
              .products-table td {
                border: 1px solid #000;
                padding: 1mm;
                text-align: left;
              }
              .products-table th {
                background: #f0f0f0;
              }
              .footer {
                margin-top: 3mm;
                padding-top: 2mm;
                border-top: 1px solid #000;
                font-size: 8pt;
                text-align: center;
              }
              .qr-placeholder {
                width: 20mm;
                height: 20mm;
                border: 1px solid #000;
                margin: 2mm auto;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 8pt;
              }
              @media print {
                body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
              }
            </style>
          </head>
          <body>
            ${labelsHtml}
          </body>
        </html>
      `);
      
      printWindow.document.close();
      printWindow.focus();
      
      setTimeout(() => {
        printWindow.print();
        setIsPrinting(false);
        setPrintComplete(true);
      }, 500);
    }
  };

  // Gerar HTML de uma etiqueta
  const generateLabelHtml = (order: Order) => {
    return `
      <div class="label-page">
        <div class="header">
          <div class="order-number">${order.orderNumber}</div>
          ${order.shopeeOrderId ? `<div class="shopee-id">Shopee: ${order.shopeeOrderId}</div>` : ''}
        </div>

        <div class="section">
          <div class="section-title">DESTINATÁRIO</div>
          <div class="customer-name">${order.customer.name}</div>
          <div>${order.customer.phone}</div>
          <div style="margin-top: 1mm;">
            ${order.customer.address.street}, ${order.customer.address.number}
            ${order.customer.address.complement ? ` - ${order.customer.address.complement}` : ''}
          </div>
          <div>${order.customer.address.neighborhood}</div>
          <div>${order.customer.address.city} - ${order.customer.address.state}</div>
          <div style="font-weight: bold;">CEP: ${order.customer.address.zipCode}</div>
        </div>

        <div class="section">
          <div class="section-title">CONTEÚDO</div>
          <table class="products-table">
            <thead>
              <tr>
                <th>Qtd</th>
                <th>Produto</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>${item.quantity}x</td>
                  <td>${item.productName}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="qr-placeholder">QR CODE</div>

        <div class="footer">
          <p>Obrigado pela compra!</p>
          ${order.notes ? `<p>Obs: ${order.notes}</p>` : ''}
          ${order.trackingCode ? `<p>Rastreio: ${order.trackingCode}</p>` : ''}
        </div>
      </div>
    `;
  };

  // Exportar lista de pedidos
  const handleExportList = () => {
    const selectedOrdersList = orders.filter(o => selectedOrders.has(o.id));
    const csvContent = [
      ['Pedido', 'Cliente', 'Telefone', 'Cidade/UF', 'Itens', 'Total'].join(';'),
      ...selectedOrdersList.map(order => [
        order.orderNumber,
        order.customer.name,
        order.customer.phone,
        `${order.customer.address.city}/${order.customer.address.state}`,
        order.items.reduce((acc, i) => acc + i.quantity, 0),
        order.total.toFixed(2).replace('.', ',')
      ].join(';'))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `pedidos_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
          <div>
            <h3 className="text-lg font-semibold">Impressão em Massa</h3>
            <p className="text-sm text-slate-500">
              {selectedOrders.size} de {orders.length} pedidos selecionados
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4 space-y-4">
          {/* Alertas */}
          {printComplete && (
            <Alert className="bg-emerald-50 border-emerald-200">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <AlertDescription className="text-emerald-800">
                Etiquetas enviadas para impressão com sucesso!
              </AlertDescription>
            </Alert>
          )}

          {/* Ações em massa */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={toggleSelectAll}
              className="gap-2"
            >
              {selectedOrders.size === orders.length ? (
                <CheckSquare className="h-4 w-4" />
              ) : (
                <Square className="h-4 w-4" />
              )}
              {selectedOrders.size === orders.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
            </Button>

            {selectedOrders.size > 0 && (
              <>
                <Button
                  onClick={handlePrint}
                  disabled={isPrinting}
                  className="gap-2"
                >
                  {isPrinting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Printer className="h-4 w-4" />
                  )}
                  Imprimir ({selectedOrders.size})
                </Button>

                <Button
                  variant="outline"
                  onClick={handleExportList}
                  className="gap-2"
                >
                  <FileDown className="h-4 w-4" />
                  Exportar Lista
                </Button>
              </>
            )}
          </div>

          {/* Barra de progresso */}
          {isPrinting && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Preparando impressão...</span>
                <span>{printProgress}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-emerald-600 h-2 rounded-full transition-all"
                  style={{ width: `${printProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Lista de pedidos */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Selecione os pedidos para impressão</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-auto">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                      selectedOrders.has(order.id)
                        ? 'bg-emerald-50 border-emerald-200'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Checkbox
                      checked={selectedOrders.has(order.id)}
                      onCheckedChange={() => toggleOrder(order.id)}
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-slate-400" />
                        <span className="font-medium">{order.orderNumber}</span>
                        <Badge className={statusConfig[order.status].color}>
                          {statusConfig[order.status].label}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 truncate">
                        {order.customer.name} - {order.customer.address.city}/{order.customer.address.state}
                      </p>
                      <p className="text-xs text-slate-500">
                        {order.items.reduce((acc, i) => acc + i.quantity, 0)} itens - {formatCurrency(order.total)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Preview container (hidden) */}
          <div ref={labelContainerRef} className="hidden" />
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t bg-slate-50">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
}
