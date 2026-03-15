import { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Printer, X } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { Order } from '@/types';

interface LabelPrinterProps {
  order: Order | null;
  onClose: () => void;
}

type PrintLayout = '10x15-label-only' | '10x15-both' | 'a4-both';

export function LabelPrinter({ order, onClose }: LabelPrinterProps) {
  const [layout, setLayout] = useState<PrintLayout>('10x15-label-only');
  const labelRef = useRef<HTMLDivElement>(null);
  const declRef = useRef<HTMLDivElement>(null);

  if (!order) return null;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow || !labelRef.current || !declRef.current) return;

    const labelContent = labelRef.current.innerHTML;
    const declContent = declRef.current.innerHTML;
    
    let htmlContent = '';

    if (layout === '10x15-label-only') {
      htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Etiqueta ${order.orderNumber}</title>
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
              width: 100mm;
              height: 150mm;
              font-family: Arial, sans-serif;
              font-size: 10pt;
              line-height: 1.3;
            }
            .label-container {
              width: 100mm;
              height: 150mm;
              padding: 4mm;
              border: 1px solid #000;
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
          </style>
        </head>
        <body>
          ${labelContent}
        </body>
      </html>
      `;
    } else if (layout === '10x15-both') {
      htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Etiqueta e Declaração ${order.orderNumber}</title>
            <style>
              @page { size: 100mm 150mm; margin: 0; }
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: Arial, sans-serif; font-size: 10pt; line-height: 1.3; }
              .page { width: 100mm; height: 150mm; padding: 4mm; page-break-after: always; }
              .page:last-child { page-break-after: auto; }
              /* Add all specific classes from your generated HTML */
              .label-container { border: 1px solid #000; height: 100%; }
              /* The rest of the custom styles for the declaration... */
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #000; padding: 2px; text-align: left; }
              .text-right { text-align: right; }
              .text-center { text-align: center; }
              .font-bold { font-weight: bold; }
              .text-sm { font-size: 0.875rem; }
              .text-lg { font-size: 1.125rem; }
              .my-3 { margin-top: 0.75rem; margin-bottom: 0.75rem; }
              .mb-4 { margin-bottom: 1rem; }
              .border-b { border-bottom: 1px solid #e2e8f0; }
              .border-b-2 { border-bottom: 2px solid #000; }
              .bg-slate-100 { background-color: #f1f5f9; }
              .pb-2 { padding-bottom: 0.5rem; }
              @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
            </style>
          </head>
          <body>
            <div class="page">${labelContent}</div>
            <div class="page">${declContent}</div>
          </body>
        </html>
      `;
    } else if (layout === 'a4-both') {
      htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Etiqueta e Declaração ${order.orderNumber} (A4)</title>
            <style>
              @page { size: A4; margin: 10mm; }
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: Arial, sans-serif; font-size: 10pt; line-height: 1.3; }
              .a4-container { display: flex; flex-direction: column; gap: 10mm; height: 100%; }
              @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
              
              /* Utilities for generated content */
              .label-box { border: 1px dashed #ccc; padding: 4mm; display: flex; justify-content: center; margin-bottom: 20px;}
              .label-content { width: 100mm; height: 150mm; transform: scale(0.9); transform-origin: top center; border: 1px solid #000; padding: 4mm;}
              .decl-box { padding: 4mm; font-size: 11pt; border: 1px dashed #ccc;}
              
              table { width: 100%; border-collapse: collapse; margin-top: 10px; }
              th, td { border: 1px solid #000; padding: 4px; text-align: left; }
              th { background-color: #f1f5f9; }
              .text-right { text-align: right; }
              .text-center { text-align: center; }
              .font-bold { font-weight: bold; }
              .border-b { border-bottom: 1px solid #e2e8f0; }
              .border-b-2 { border-bottom: 2px solid #000; }
              .mb-4 { margin-bottom: 1rem; }
            </style>
          </head>
          <body>
            <div class="a4-container">
              <div class="label-box">
                <div class="label-content">
                  ${labelContent}
                </div>
              </div>
              <div class="decl-box">
                ${declContent}
              </div>
            </div>
          </body>
        </html>
      `;
    }

    printWindow.document.write(htmlContent);
    
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold">Imprimir Etiqueta</h3>
            <Select value={layout} onValueChange={(val: PrintLayout) => setLayout(val)}>
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Formato de Impressão" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10x15-label-only">Apenas Etiqueta (Térmica 10x15)</SelectItem>
                <SelectItem value="10x15-both">Etiqueta + Declaração (Seq. Térmica 10x15)</SelectItem>
                <SelectItem value="a4-both">Etiqueta + Declaração (Folha A4)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4 space-y-4">
          {/* Preview da Etiqueta */}
          <Card className="border-2 border-dashed">
            <CardHeader>
              <CardTitle className="text-sm">Preview (10x15cm)</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center bg-slate-100 p-4">
              {/* Etiqueta em escala reduzida para preview */}
              <div 
                ref={labelRef}
                className="label-container"
                style={{
                  width: '100mm',
                  height: '150mm',
                  padding: '4mm',
                  border: '1px solid #000',
                  background: 'white',
                  fontFamily: 'Arial, sans-serif',
                  fontSize: '10pt',
                  lineHeight: 1.3,
                  transform: 'scale(0.6)',
                  transformOrigin: 'top center',
                }}
              >
                {/* Header */}
                <div style={{
                  textAlign: 'center',
                  borderBottom: '2px solid #000',
                  paddingBottom: '2mm',
                  marginBottom: '3mm',
                }}>
                  <div style={{ fontSize: '14pt', fontWeight: 'bold' }}>
                    {order.orderNumber}
                  </div>
                  {order.shopeeOrderId && (
                    <div style={{ fontSize: '9pt', color: '#666' }}>
                      Shopee: {order.shopeeOrderId}
                    </div>
                  )}
                </div>

                {/* Destinatário */}
                <div style={{ marginBottom: '3mm' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '9pt', borderBottom: '1px solid #ccc', marginBottom: '1mm' }}>
                    DESTINATÁRIO
                  </div>
                  <div style={{ fontSize: '12pt', fontWeight: 'bold' }}>
                    {order.customer.name}
                  </div>
                  <div style={{ fontSize: '9pt' }}>
                    {order.customer.phone}
                  </div>
                  <div style={{ fontSize: '9pt', marginTop: '1mm' }}>
                    {order.customer.address.street}, {order.customer.address.number}
                    {order.customer.address.complement && ` - ${order.customer.address.complement}`}
                  </div>
                  <div style={{ fontSize: '9pt' }}>
                    {order.customer.address.neighborhood}
                  </div>
                  <div style={{ fontSize: '9pt' }}>
                    {order.customer.address.city} - {order.customer.address.state}
                  </div>
                  <div style={{ fontSize: '10pt', fontWeight: 'bold' }}>
                    CEP: {order.customer.address.zipCode}
                  </div>
                </div>

                {/* Produtos */}
                <div style={{ marginBottom: '3mm' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '9pt', borderBottom: '1px solid #ccc', marginBottom: '1mm' }}>
                    CONTEÚDO
                  </div>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '9pt',
                  }}>
                    <thead>
                      <tr>
                        <th style={{ border: '1px solid #000', padding: '1mm', textAlign: 'left', background: '#f0f0f0' }}>Qtd</th>
                        <th style={{ border: '1px solid #000', padding: '1mm', textAlign: 'left', background: '#f0f0f0' }}>Produto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item, index) => (
                        <tr key={index}>
                          <td style={{ border: '1px solid #000', padding: '1mm' }}>{item.quantity}x</td>
                          <td style={{ border: '1px solid #000', padding: '1mm' }}>{item.productName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* QR Code Placeholder */}
                <div style={{
                  width: '20mm',
                  height: '20mm',
                  border: '1px solid #000',
                  margin: '2mm auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '8pt',
                }}>
                  QR CODE
                </div>

                {/* Footer */}
                <div style={{
                  marginTop: '3mm',
                  paddingTop: '2mm',
                  borderTop: '1px solid #000',
                  fontSize: '8pt',
                  textAlign: 'center',
                }}>
                  <p>Obrigado pela compra!</p>
                  {order.notes && <p>Obs: {order.notes}</p>}
                  {order.trackingCode && <p>Rastreio: {order.trackingCode}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Nota de Conteúdo */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Declaração de Conteúdo</CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                ref={declRef}
                className="border p-4 bg-white"
                style={{
                  width: '100%',
                  maxWidth: '100mm',
                  margin: '0 auto',
                  fontSize: '10pt',
                }}
              >
                <div className="text-center border-b-2 border-black pb-2 mb-3">
                  <p className="text-lg font-bold">NOTA DE CONTEÚDO</p>
                  <p className="text-sm text-slate-600">Pedido: {order.orderNumber}</p>
                </div>

                <div className="mb-4">
                  <p className="font-bold text-sm border-b mb-1">REMETENTE</p>
                  <p className="font-semibold">3D Print Shop</p>
                  <p className="text-sm">CNPJ: 00.000.000/0001-00</p>
                  <p className="text-sm">Endereço do remetente</p>
                </div>

                <div className="mb-4">
                  <p className="font-bold text-sm border-b mb-1">DESTINATÁRIO</p>
                  <p className="font-semibold">{order.customer.name}</p>
                  <p className="text-sm">{order.customer.address.street}, {order.customer.address.number}</p>
                  <p className="text-sm">{order.customer.address.neighborhood}</p>
                  <p className="text-sm">{order.customer.address.city} - {order.customer.address.state}</p>
                  <p className="text-sm font-semibold">CEP: {order.customer.address.zipCode}</p>
                </div>

                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border p-1 text-left">Qtd</th>
                      <th className="border p-1 text-left">Descrição</th>
                      <th className="border p-1 text-right">Valor Unit.</th>
                      <th className="border p-1 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, index) => (
                      <tr key={index}>
                        <td className="border p-1">{item.quantity}</td>
                        <td className="border p-1">{item.productName}</td>
                        <td className="border p-1 text-right">{formatCurrency(item.unitPrice)}</td>
                        <td className="border p-1 text-right">{formatCurrency(item.totalPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="font-bold">
                      <td colSpan={3} className="border p-1 text-right">Subtotal:</td>
                      <td className="border p-1 text-right">{formatCurrency(order.subtotal)}</td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="border p-1 text-right">Frete:</td>
                      <td className="border p-1 text-right">{formatCurrency(order.shippingCost)}</td>
                    </tr>
                    {order.discount > 0 && (
                      <tr>
                        <td colSpan={3} className="border p-1 text-right">Desconto:</td>
                        <td className="border p-1 text-right text-red-600">-{formatCurrency(order.discount)}</td>
                      </tr>
                    )}
                    <tr className="font-bold text-lg">
                      <td colSpan={3} className="border p-1 text-right">TOTAL:</td>
                      <td className="border p-1 text-right">{formatCurrency(order.total)}</td>
                    </tr>
                  </tfoot>
                </table>

                <div className="mt-4 text-center text-xs text-slate-500">
                  <p>Documento sem valor fiscal</p>
                  <p>Obrigado pela preferência!</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botões */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handlePrint} className="gap-2">
              <Printer className="h-4 w-4" />
              Imprimir Etiqueta
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Removido export no bottom
