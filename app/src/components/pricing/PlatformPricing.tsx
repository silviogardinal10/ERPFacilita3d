import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  RotateCcw,
  Tag,
  Package,
  TrendingUp,
  ShoppingCart,
  AlertCircle,
  CheckCircle2,
  Search,
  ImageIcon,
  ChevronDown,
  Box,
  Save,
  Store,
  Smartphone
} from 'lucide-react';
import { useMultiPlatformPricing } from '@/hooks/useMultiPlatformPricing';
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

interface PlatformPricingProps {
  manufacturingCost: number;
  onSelectProduct?: (product: Product3D) => void;
}

export function PlatformPricing({ manufacturingCost, onSelectProduct }: PlatformPricingProps) {
  const {
    shopeeFees,
    tiktokFees,
    temuFees,
    packaging,
    pricingConfig,
    calculation,
    updateShopeeFees,
    updateTikTokFees,
    updateTemuFees,
    updatePackaging,
    updatePricingConfig,
    resetAll,
    setManufacturingCost,
  } = useMultiPlatformPricing(manufacturingCost);

  const { products, updateProduct } = use3DProducts();
  const { supplies } = useSupplies();

  const packagingSupplies = supplies.filter(s => s.type === 'embalagem');
  const labelSupplies = supplies.filter(s => s.type === 'etiqueta');

  const [selectedProduct, setSelectedProduct] = useState<Product3D | null>(null);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Handler para selecionar produto
  const handleSelectProduct = (product: Product3D) => {
    setSelectedProduct(product);
    setManufacturingCost(product.totalCost);
    setShowProductSelector(false);
    if (onSelectProduct) {
      onSelectProduct(product);
    }
  };

  // Salvar a precificação calculada no BD para o produto selecionado
  const handleSavePricing = async () => {
    if (!selectedProduct) return;
    setIsSaving(true);
    try {
      await updateProduct(selectedProduct.id, {
        shopeePrice: calculation.shopeeSuggestedPrice,
        tiktokPrice: calculation.tiktokSuggestedPrice,
        temuPrice: calculation.temuSuggestedPrice,
        packagingCost: calculation.totalPackagingCost
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      
      // Update local state to reflect saved status
      setSelectedProduct(prev => prev ? {
        ...prev,
        shopeePrice: calculation.shopeeSuggestedPrice,
        tiktokPrice: calculation.tiktokSuggestedPrice,
        temuPrice: calculation.temuSuggestedPrice,
        packagingCost: calculation.totalPackagingCost
      } : null);

    } catch (err) {
      console.error(err);
      alert("Erro ao salvar a precificação.");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Precificação Multi-Plataforma</h2>
          <p className="text-slate-500">Calcule e compare preços para Shopee, TikTok Shop e Temu</p>
        </div>
        <div className="flex gap-2">
          {selectedProduct && (
            <Button 
                onClick={handleSavePricing} 
                className="gap-2" 
                disabled={isSaving || saveSuccess}
                variant={saveSuccess ? "outline" : "default"}
            >
                {saveSuccess ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Save className="h-4 w-4" />}
                {saveSuccess ? 'Salvo!' : 'Salvar Precificação'}
            </Button>
          )}
          <Button variant="outline" onClick={resetAll} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Resetar
          </Button>
        </div>
      </div>

      {/* Seletor de Produto */}
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
                        {formatCurrency(selectedProduct.totalCost)} <span className="text-sm font-normal text-slate-500">(custo de fabricação)</span>
                      </p>
                      
                      {selectedProduct.shopeePrice && (
                          <div className="flex gap-2 mt-2 text-xs font-medium text-slate-600">
                              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Shopee: {formatCurrency(selectedProduct.shopeePrice)}</Badge>
                              {selectedProduct.tiktokPrice && <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">TikTok: {formatCurrency(selectedProduct.tiktokPrice)}</Badge>}
                              {selectedProduct.temuPrice && <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200" style={{borderColor: '#E86424', color: '#E86424', backgroundColor: '#FFF2EC'}}>Temu: {formatCurrency(selectedProduct.temuPrice)}</Badge>}
                          </div>
                      )}
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
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {!selectedProduct && (
            <div className="space-y-2">
              <Label htmlFor="manual-cost">Ou informe o custo de fabricação manualmente (R$)</Label>
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* PARTE ESQUERDA: Configurações unificadas */}
        <div className="lg:col-span-5 space-y-6">
            
          {/* Custo de Embalagem (Global) */}
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                Embalagem e Variáveis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {packagingSupplies.length > 0 && (
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-4">
                  <Label className="text-blue-800 mb-2 block">Puxar do Estoque</Label>
                  <Select onValueChange={(val) => {
                    const selected = packagingSupplies.find(p => p.id === val);
                    if (selected) {
                      const unitCost = selected.pricePaid / selected.quantity;
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
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="box">Caixa (R$)</Label>
                  <Input id="box" type="number" step="0.01" min="0" value={packaging.box} onChange={(e) => updatePackaging({ box: parseFloat(e.target.value) || 0 })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tape">Fita (R$)</Label>
                  <Input id="tape" type="number" step="0.01" min="0" value={packaging.tape} onChange={(e) => updatePackaging({ tape: parseFloat(e.target.value) || 0 })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bubble">Plástico Bolha (R$)</Label>
                  <Input id="bubble" type="number" step="0.01" min="0" value={packaging.bubbleWrap} onChange={(e) => updatePackaging({ bubbleWrap: parseFloat(e.target.value) || 0 })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="label">Etiqueta (R$)</Label>
                  <Input id="label" type="number" step="0.01" min="0" value={packaging.label} onChange={(e) => updatePackaging({ label: parseFloat(e.target.value) || 0 })} />
                </div>
              </div>
              
              {labelSupplies.length > 0 && (
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mt-4 mb-4">
                  <Label className="text-slate-800 mb-2 block">Puxar Etiquetas do Estoque</Label>
                  <Select onValueChange={(val) => {
                    const selected = labelSupplies.find(p => p.id === val);
                    if (selected) {
                      const unitCost = selected.pricePaid / selected.quantity;
                      updatePackaging({ label: unitCost });
                    }
                  }}>
                    <SelectTrigger className="h-9 bg-white">
                      <SelectValue placeholder="Selecione uma etiqueta..." />
                    </SelectTrigger>
                    <SelectContent>
                      {labelSupplies.map(p => {
                        const unitCost = p.pricePaid / p.quantity;
                        return (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name} - {formatCurrency(unitCost)}/{p.unit}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="flex items-center justify-between text-sm mt-4 pt-4 border-t border-slate-100">
                <span className="text-slate-500">Total embalagem:</span>
                <Badge variant="secondary" className="font-mono">
                  {formatCurrency(calculation.totalPackagingCost)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Margem e Desconto Global */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
                Estratégia de Venda (Global)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="margin">% Margem Limpa</Label>
                  <Input id="margin" type="number" step="0.1" min="0" max="100" value={pricingConfig.profitMargin} onChange={(e) => updatePricingConfig({ profitMargin: parseFloat(e.target.value) || 0 })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discount">% Desconto Ofertas</Label>
                  <Input id="discount" type="number" step="0.1" min="0" max="100" value={pricingConfig.discountPercentage} onChange={(e) => updatePricingConfig({ discountPercentage: parseFloat(e.target.value) || 0 })} />
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* PARTE DIREITA: Abas de Plataformas lado a lado */}
        <div className="lg:col-span-7">
            <Tabs defaultValue="shopee" className="w-full">
                <TabsList className="w-full grid-cols-3 grid">
                    <TabsTrigger value="shopee" className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700"><ShoppingCart className="w-4 h-4 mr-2"/> Shopee</TabsTrigger>
                    <TabsTrigger value="tiktok" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white"><Smartphone className="w-4 h-4 mr-2"/> TikTok Shop</TabsTrigger>
                    <TabsTrigger value="temu" className="data-[state=active]:bg-orange-50 data-[state=active]:text-[#E86424]"><Store className="w-4 h-4 mr-2"/> Temu</TabsTrigger>
                </TabsList>
                
                {/* SHOPEE TAB */}
                <TabsContent value="shopee" className="mt-4 space-y-4">
                     <Card>
                        <CardHeader className="pb-3 border-b">
                            <CardTitle className="text-lg flex items-center gap-2 text-orange-600">
                                Taxas Praticadas - Shopee
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>% Comissão</Label>
                                <Input type="number" step="0.1" min="0" value={shopeeFees.commissionPercentage} onChange={(e) => updateShopeeFees({ commissionPercentage: parseFloat(e.target.value) || 0 })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Taxa Fixa (R$)</Label>
                                <Input type="number" step="0.01" min="0" value={shopeeFees.fixedFee} onChange={(e) => updateShopeeFees({ fixedFee: parseFloat(e.target.value) || 0 })} />
                            </div>
                        </CardContent>
                     </Card>
                     
                     <PricingResultCard 
                        name="Shopee"
                        theme="emerald" 
                        suggestedPrice={calculation.shopeeSuggestedPrice} 
                        commission={calculation.shopeeCommission} 
                        fixedFee={calculation.shopeeFixedFee} 
                        breakEven={calculation.shopeeBreakEven}
                        profit={calculation.profitAmount}
                        mfgCost={calculation.manufacturingCost}
                        pkgCost={calculation.totalPackagingCost}
                     />
                </TabsContent>

                {/* TIKTOK TAB */}
                <TabsContent value="tiktok" className="mt-4 space-y-4">
                     <Card>
                        <CardHeader className="pb-3 border-b">
                            <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                                Taxas Praticadas - TikTok Shop
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>% Comissão</Label>
                                <Input type="number" step="0.1" min="0" value={tiktokFees.commissionPercentage} onChange={(e) => updateTikTokFees({ commissionPercentage: parseFloat(e.target.value) || 0 })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Taxa Fixa (R$)</Label>
                                <Input type="number" step="0.01" min="0" value={tiktokFees.fixedFee} onChange={(e) => updateTikTokFees({ fixedFee: parseFloat(e.target.value) || 0 })} />
                            </div>
                        </CardContent>
                     </Card>
                     
                     <PricingResultCard 
                        name="TikTok Shop"
                        theme="slate" 
                        suggestedPrice={calculation.tiktokSuggestedPrice} 
                        commission={calculation.tiktokCommission} 
                        fixedFee={calculation.tiktokFixedFee} 
                        breakEven={calculation.tiktokBreakEven}
                        profit={calculation.profitAmount}
                        mfgCost={calculation.manufacturingCost}
                        pkgCost={calculation.totalPackagingCost}
                     />
                </TabsContent>

                {/* TEMU TAB */}
                <TabsContent value="temu" className="mt-4 space-y-4">
                     <Card>
                        <CardHeader className="pb-3 border-b">
                            <CardTitle className="text-lg flex items-center gap-2 text-[#E86424]">
                                Taxas Praticadas - Temu
                            </CardTitle>
                            <p className="text-xs text-slate-500">A Temu geralmente opera baseada em margem de negociação (Markup) em vez de comissão direta, mas você pode usar esta tela para simular.</p>
                        </CardHeader>
                        <CardContent className="pt-4 grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>% Comissão (Markup Temu)</Label>
                                <Input type="number" step="0.1" min="0" value={temuFees.commissionPercentage} onChange={(e) => updateTemuFees({ commissionPercentage: parseFloat(e.target.value) || 0 })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Taxa Fixa (R$)</Label>
                                <Input type="number" step="0.01" min="0" value={temuFees.fixedFee} onChange={(e) => updateTemuFees({ fixedFee: parseFloat(e.target.value) || 0 })} />
                            </div>
                        </CardContent>
                     </Card>
                     
                     <PricingResultCard 
                        name="Temu"
                        theme="orange" 
                        suggestedPrice={calculation.temuSuggestedPrice} 
                        commission={calculation.temuCommission} 
                        fixedFee={calculation.temuFixedFee} 
                        breakEven={calculation.temuBreakEven}
                        profit={calculation.profitAmount}
                        mfgCost={calculation.manufacturingCost}
                        pkgCost={calculation.totalPackagingCost}
                     />
                </TabsContent>

            </Tabs>
        </div>
      </div>
    </div>
  );
}

// Componente auxiliar para os resultados
function PricingResultCard({ name, theme, suggestedPrice, commission, fixedFee, breakEven, profit, mfgCost, pkgCost }: any) {
    const isProfitable = suggestedPrice > breakEven;
    
    // Theme configurations
    const themes = {
        emerald: {
            bg: 'bg-emerald-600',
            bgLight: 'bg-emerald-50 border-emerald-200',
            textLight: 'text-emerald-100',
            textDark: 'text-emerald-800'
        },
        slate: {
            bg: 'bg-slate-800',
            bgLight: 'bg-slate-100 border-slate-300',
            textLight: 'text-slate-300',
            textDark: 'text-slate-900'
        },
        orange: {
            bg: 'bg-[#E86424]',
            bgLight: 'bg-orange-50 border-orange-200',
            textLight: 'text-orange-100',
            textDark: 'text-[#E86424]'
        }
    };

    const t = themes[theme as keyof typeof themes];

    return (
        <div className="space-y-4">
            <Card className={`${isProfitable ? t.bg : 'bg-red-600'} text-white`}>
                <CardHeader className="pb-3 border-b border-white/10">
                    <CardTitle className="text-lg flex items-center gap-2 text-white">
                        <Tag className="h-5 w-5" />
                        Preço Sugerido - {name}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                    <div className="text-center py-2">
                        <p className={`${t.textLight} mb-1 opacity-90`}>Para ganhar {formatCurrency(profit)} de lucro limpo:</p>
                        <p className="text-5xl font-bold">{formatCurrency(suggestedPrice)}</p>
                    </div>

                    <Separator className="bg-white/20" />

                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className={t.textLight}>Custo 3D + Embalagens base:</span>
                            <span className="font-mono">{formatCurrency(mfgCost + pkgCost)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className={t.textLight}>Taxas {name}:</span>
                            <span className="font-mono">{formatCurrency(commission + fixedFee)}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className={isProfitable ? t.bgLight : 'bg-red-50 border-red-200'}>
                <CardContent className="p-4 flex flex-col justify-center">
                    <div className="flex justify-between items-center mb-1">
                        <p className="text-sm font-medium text-slate-500">Ponto de Equilíbrio (0x0)</p>
                        {isProfitable ? <CheckCircle2 className={`h-5 w-5 ${t.textDark}`} /> : <AlertCircle className="h-5 w-5 text-red-600" />}
                    </div>
                    <p className={`text-2xl font-bold ${isProfitable ? t.textDark : 'text-red-700'}`}>
                        {formatCurrency(breakEven)}
                    </p>
                    <p className={`text-xs mt-1 ${isProfitable ? 'text-slate-500' : 'text-red-600'}`}>
                        {isProfitable ? "Abaixo desse valor, você terá prejuízo vendendo nessa plataforma." : "Custo é maior que a soma de taxas e lucro."}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
