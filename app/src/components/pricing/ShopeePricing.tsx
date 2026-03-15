import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  RotateCcw,
  Tag,
  Package,
  Percent,
  Gift,
  TrendingUp,
  ShoppingCart,
  AlertCircle,
  CheckCircle2,
  Search,
  ImageIcon,
  ChevronDown,
  Box
} from 'lucide-react';
import { useShopeePricing } from '@/hooks/useShopeePricing';
import { use3DProducts, type Product3D } from '@/hooks/use3DProducts';
import { useSupplies } from '@/hooks/useSupplies';
import { formatCurrency } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ShopeePricingProps {
  manufacturingCost: number;
  onSelectProduct?: (product: Product3D) => void;
}

export function ShopeePricing({ manufacturingCost, onSelectProduct }: ShopeePricingProps) {
  const {
    shopeeFees,
    packaging,
    pricingConfig,
    calculation,
    updateShopeeFees,
    updatePackaging,
    updatePricingConfig,
    resetAll,
    setManufacturingCost,
  } = useShopeePricing(manufacturingCost);

  const { products } = use3DProducts();
  const { supplies } = useSupplies();
  
  const packagingSupplies = supplies.filter(s => s.type === 'embalagem');

  const [selectedProduct, setSelectedProduct] = useState<Product3D | null>(null);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isProfitable = calculation.suggestedPrice > calculation.breakEvenPrice;

  // Handler para selecionar produto
  const handleSelectProduct = (product: Product3D) => {
    setSelectedProduct(product);
    setManufacturingCost(product.totalCost);
    setShowProductSelector(false);
    if (onSelectProduct) {
      onSelectProduct(product);
    }
  };

  // Filtrar produtos pela busca
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Precificação Shopee</h2>
          <p className="text-slate-500">Calcule o preço de venda ideal para a Shopee</p>
        </div>
        <Button variant="outline" onClick={resetAll} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Resetar
        </Button>
      </div>

      {/* Seletor de Produto - NOVO */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-blue-700">
            <Box className="h-5 w-5" />
            Selecionar Produto Cadastrado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {products.length === 0 ? (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800">Nenhum produto cadastrado</p>
                <p className="text-sm text-amber-700">
                  Vá até a calculadora de custo 3D para cadastrar seus produtos.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Produto Selecionado */}
              {selectedProduct ? (
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-4">
                    {selectedProduct.photo ? (
                      <img
                        src={selectedProduct.photo}
                        alt={selectedProduct.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-slate-100 rounded-lg flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-slate-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-lg text-slate-900">{selectedProduct.name}</p>
                      <p className="text-emerald-600 font-bold text-xl">
                        {formatCurrency(selectedProduct.totalCost)}
                      </p>
                      <p className="text-sm text-slate-500">
                        {selectedProduct.filamentWeightUsed}g • {selectedProduct.printTimeHours}h {selectedProduct.printTimeMinutes}min
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setShowProductSelector(!showProductSelector)}
                    >
                      Trocar Produto
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setShowProductSelector(!showProductSelector)}
                  className="w-full gap-2"
                >
                  <Search className="h-4 w-4" />
                  Buscar Produto Cadastrado
                  <ChevronDown className={`h-4 w-4 transition-transform ${showProductSelector ? 'rotate-180' : ''}`} />
                </Button>
              )}

              {/* Lista de Produtos */}
              {showProductSelector && (
                <div className="bg-white rounded-lg border border-blue-200 p-4">
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Buscar produto..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-auto">
                      {filteredProducts.map((product) => (
                        <button
                          key={product.id}
                          onClick={() => handleSelectProduct(product)}
                          className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-colors hover:bg-slate-50 ${selectedProduct?.id === product.id
                              ? 'border-emerald-500 bg-emerald-50'
                              : 'border-slate-200'
                            }`}
                        >
                          {product.photo ? (
                            <img
                              src={product.photo}
                              alt={product.name}
                              className="w-14 h-14 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-14 h-14 bg-slate-100 rounded-lg flex items-center justify-center">
                              <ImageIcon className="h-6 w-6 text-slate-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-900 truncate">{product.name}</p>
                            <p className="text-emerald-600 font-semibold">
                              {formatCurrency(product.totalCost)}
                            </p>
                            <p className="text-xs text-slate-500">
                              {product.filamentWeightUsed}g • {product.printTimeHours}h {product.printTimeMinutes}min
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>

                    {filteredProducts.length === 0 && (
                      <p className="text-center text-slate-500 py-4">
                        Nenhum produto encontrado
                      </p>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Custo Manual (se não selecionou produto) */}
          {!selectedProduct && (
            <div className="space-y-2">
              <Label htmlFor="manual-cost">Ou informe o custo manualmente (R$)</Label>
              <Input
                id="manual-cost"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={manufacturingCost || ''}
                onChange={(e) => setManufacturingCost(parseFloat(e.target.value) || 0)}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alerta de custo */}
      {manufacturingCost === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
          <div>
            <p className="font-medium text-amber-800">Custo de fabricação não definido</p>
            <p className="text-sm text-amber-700">
              Selecione um produto cadastrado ou informe o custo manualmente.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-6">
          {/* Taxas Shopee */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-orange-500" />
                Taxas Shopee
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="commission">% Comissão Shopee</Label>
                  <Input
                    id="commission"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={shopeeFees.commissionPercentage}
                    onChange={(e) => updateShopeeFees({ commissionPercentage: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fixed-fee">Taxa Fixa (R$)</Label>
                  <Input
                    id="fixed-fee"
                    type="number"
                    step="0.01"
                    min="0"
                    value={shopeeFees.fixedFee}
                    onChange={(e) => updateShopeeFees({ fixedFee: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Comissão no preço final:</span>
                <Badge variant="secondary" className="font-mono">
                  {formatCurrency(calculation.shopeeCommission)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Embalagem */}
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                Custo de Embalagem
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {packagingSupplies.length > 0 && (
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-4">
                  <Label className="text-blue-800 mb-2 block">Puxar do Estoque</Label>
                  <Select onValueChange={(val) => {
                    const selected = packagingSupplies.find(p => p.id === val);
                    if (selected) {
                      // Assume the unit cost is the pricePaid divided by quantity of items
                      const unitCost = selected.pricePaid / selected.quantity;
                      
                      // Identify type broadly by name to fill the correct field
                      const name = selected.name.toLowerCase();
                      if (name.includes('caixa')) updatePackaging({ box: unitCost });
                      else if (name.includes('fita')) updatePackaging({ tape: unitCost });
                      else if (name.includes('bolha')) updatePackaging({ bubbleWrap: unitCost });
                      else updatePackaging({ other: unitCost });
                    }
                  }}>
                    <SelectTrigger className="h-9 bg-white">
                      <SelectValue placeholder="Selecione uma embalagem..." />
                    </SelectTrigger>
                    <SelectContent>
                      {packagingSupplies.map(p => {
                        const unitCost = p.pricePaid / p.quantity;
                        return (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name} - {formatCurrency(unitCost)}/{p.unit}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-blue-600 mt-2">
                    Selecionar um item do estoque irá preencher automaticamente um dos campos abaixo baseado no nome da embalagem.
                  </p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="box">Caixa (R$)</Label>
                  <Input
                    id="box"
                    type="number"
                    step="0.01"
                    min="0"
                    value={packaging.box}
                    onChange={(e) => updatePackaging({ box: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tape">Fita (R$)</Label>
                  <Input
                    id="tape"
                    type="number"
                    step="0.01"
                    min="0"
                    value={packaging.tape}
                    onChange={(e) => updatePackaging({ tape: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bubble">Plástico Bolha (R$)</Label>
                  <Input
                    id="bubble"
                    type="number"
                    step="0.01"
                    min="0"
                    value={packaging.bubbleWrap}
                    onChange={(e) => updatePackaging({ bubbleWrap: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="other">Outros (R$)</Label>
                  <Input
                    id="other"
                    type="number"
                    step="0.01"
                    min="0"
                    value={packaging.other}
                    onChange={(e) => updatePackaging({ other: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Total embalagem:</span>
                <Badge variant="secondary" className="font-mono">
                  {formatCurrency(calculation.totalPackagingCost)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Margem e Desconto */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
                Lucro e Desconto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="margin">% Margem de Lucro</Label>
                  <Input
                    id="margin"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={pricingConfig.profitMargin}
                    onChange={(e) => updatePricingConfig({ profitMargin: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discount">% Desconto Ofertas</Label>
                  <Input
                    id="discount"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={pricingConfig.discountPercentage}
                    onChange={(e) => updatePricingConfig({ discountPercentage: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <p className="text-xs text-slate-500">
                O desconto é calculado sobre o preço sugerido para ofertas relâmpago e cupons.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Resultados */}
        <div className="space-y-6">
          {/* Preço Sugerido */}
          <Card className={`${isProfitable ? 'bg-gradient-to-br from-emerald-600 to-emerald-700' : 'bg-gradient-to-br from-red-600 to-red-700'} text-white`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-white">
                <Tag className="h-5 w-5" />
                Preço de Venda Sugerido
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-4">
                <p className="text-emerald-100 mb-2">Preço Final Recomendado</p>
                <p className="text-5xl font-bold">{formatCurrency(calculation.suggestedPrice)}</p>
              </div>

              <Separator className="bg-white/20" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-emerald-100">Custo de Fabricação:</span>
                  <span className="font-mono">{formatCurrency(calculation.manufacturingCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-100">Embalagem:</span>
                  <span className="font-mono">{formatCurrency(calculation.totalPackagingCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-100">Taxa Fixa Shopee:</span>
                  <span className="font-mono">{formatCurrency(calculation.shopeeFixedFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-100">Comissão Shopee ({shopeeFees.commissionPercentage}%):</span>
                  <span className="font-mono">{formatCurrency(calculation.shopeeCommission)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-100">Seu Lucro ({pricingConfig.profitMargin}%):</span>
                  <span className="font-mono">{formatCurrency(calculation.profitAmount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Análise de Preços */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Percent className="h-5 w-5 text-purple-600" />
                Análise de Preços
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-slate-500 mb-1">Preço com Desconto Somado</p>
                  <p className="text-xl font-bold text-slate-900">
                    {formatCurrency(calculation.priceWithDiscount)}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    -{pricingConfig.discountPercentage}% ({formatCurrency(calculation.discountAmount)})
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-slate-500 mb-1">Ponto de Equilíbrio</p>
                  <p className="text-xl font-bold text-slate-900">
                    {formatCurrency(calculation.breakEvenPrice)}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Sem lucro, apenas custos
                  </p>
                </div>
              </div>

              <div className={`p-4 rounded-lg ${isProfitable ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {isProfitable ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className={`font-medium ${isProfitable ? 'text-emerald-800' : 'text-red-800'}`}>
                    {isProfitable ? 'Precificação Viável' : 'Precificação Invável'}
                  </span>
                </div>
                <p className={`text-sm ${isProfitable ? 'text-emerald-700' : 'text-red-700'}`}>
                  {isProfitable
                    ? `Seu preço está ${formatCurrency(calculation.suggestedPrice - calculation.breakEvenPrice)} acima do ponto de equilíbrio.`
                    : 'Seu preço está abaixo do custo total. Aumente a margem ou reduza custos.'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Simulação de Oferta */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Gift className="h-5 w-5 text-pink-600" />
                Simulação de Oferta Relâmpago
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-slate-600">Preço Original:</span>
                  <span className="font-mono line-through text-slate-400">
                    {formatCurrency(calculation.suggestedPrice)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-slate-600">Desconto ({pricingConfig.discountPercentage}%):</span>
                  <span className="font-mono text-red-600">
                    -{formatCurrency(calculation.discountAmount)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-slate-600">Preço Promocional:</span>
                  <span className="font-mono font-bold text-emerald-600">
                    {formatCurrency(calculation.priceWithDiscount)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-600">Lucro com Desconto:</span>
                  <span className={`font-mono font-medium ${calculation.priceWithDiscount > calculation.breakEvenPrice ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                    {formatCurrency(calculation.priceWithDiscount - calculation.breakEvenPrice)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
