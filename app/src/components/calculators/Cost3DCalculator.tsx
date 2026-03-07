import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  RotateCcw, 
  Calculator, 
  Zap, 
  Clock, 
  Scale, 
  DollarSign,
  Wrench,
  AlertTriangle,
  Camera,
  Save,
  Package,
  CheckCircle2,
  ImageIcon
} from 'lucide-react';
import { use3DCostCalculator } from '@/hooks/use3DCostCalculator';
import { use3DProducts, type Product3D } from '@/hooks/use3DProducts';
import { formatCurrency } from '@/lib/utils';

interface Cost3DCalculatorProps {
  onProductSaved?: (product: Product3D) => void;
}

export function Cost3DCalculator({ onProductSaved }: Cost3DCalculatorProps) {
  const {
    filament,
    printer,
    energy,
    depreciation,
    waste,
    calculation,
    updateFilament,
    updatePrinter,
    updateEnergy,
    updateDepreciation,
    updateWaste,
    resetAll,
  } = use3DCostCalculator();

  const { createProduct, products, deleteProduct } = use3DProducts();

  // Estados para cadastro do produto
  const [productName, setProductName] = useState('');
  const [productPhoto, setProductPhoto] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showProductsList, setShowProductsList] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handler para upload de foto
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handler para salvar produto
  const handleSaveProduct = async () => {
    if (!productName.trim()) {
      alert('Digite o nome do produto');
      return;
    }

    try {
      const newProduct = await createProduct({
        name: productName.trim(),
        photo: productPhoto,
        filamentPrice: filament.price,
        filamentWeight: filament.weight,
        powerConsumption: printer.powerConsumption,
        printTimeHours: printer.printTimeHours,
        printTimeMinutes: printer.printTimeMinutes,
        filamentWeightUsed: printer.filamentWeightUsed,
        kwhPrice: energy.kwhPrice,
        printerValue: depreciation.printerValue,
        printerLifeHours: depreciation.totalLifeHours,
        wastePercentage: waste.wastePercentage,
        totalCost: calculation.totalManufacturingCost,
      });

      setSaveSuccess(true);
      if (onProductSaved) {
        onProductSaved(newProduct);
      }

      // Limpar campos após salvar
      setProductName('');
      setProductPhoto('');

      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save product', error);
      alert('Erro ao salvar produto');
    }
  };

  // Handler para carregar produto salvo
  const handleLoadProduct = (product: Product3D) => {
    updateFilament({ price: product.filamentPrice, weight: product.filamentWeight });
    updatePrinter({
      powerConsumption: product.powerConsumption,
      printTimeHours: product.printTimeHours,
      printTimeMinutes: product.printTimeMinutes,
      filamentWeightUsed: product.filamentWeightUsed,
    });
    updateEnergy({ kwhPrice: product.kwhPrice });
    updateDepreciation({
      printerValue: product.printerValue,
      totalLifeHours: product.printerLifeHours,
    });
    updateWaste({ wastePercentage: product.wastePercentage });
    setProductName(product.name);
    setProductPhoto(product.photo || '');
    setShowProductsList(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Calculadora de Custo 3D</h2>
          <p className="text-slate-500">Calcule o custo real de fabricação das suas peças</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowProductsList(!showProductsList)}
            className="gap-2"
          >
            <Package className="h-4 w-4" />
            {showProductsList ? 'Ocultar' : 'Ver'} Produtos ({products.length})
          </Button>
          <Button variant="outline" onClick={resetAll} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Resetar
          </Button>
        </div>
      </div>

      {/* Lista de Produtos Salvos */}
      {showProductsList && (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-emerald-800">
              <Package className="h-5 w-5" />
              Produtos Cadastrados
            </CardTitle>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <p className="text-emerald-700 text-center py-4">
                Nenhum produto cadastrado ainda. Preencha os dados abaixo e salve seu primeiro produto!
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {products.map((product) => (
                  <div 
                    key={product.id} 
                    className="bg-white rounded-lg p-3 border border-emerald-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      {product.photo ? (
                        <img 
                          src={product.photo} 
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-slate-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">{product.name}</p>
                        <p className="text-sm text-emerald-600 font-semibold">
                          {formatCurrency(product.totalCost)}
                        </p>
                        <p className="text-xs text-slate-500">
                          {product.filamentWeightUsed}g • {product.printTimeHours}h {product.printTimeMinutes}min
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => handleLoadProduct(product)}
                      >
                        Carregar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => deleteProduct(product.id)}
                      >
                        Excluir
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dados do Produto - NOVO */}
      <Card className="border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-blue-700">
            <Package className="h-5 w-5" />
            Dados do Produto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {saveSuccess && (
            <Alert className="bg-emerald-50 border-emerald-200">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <AlertDescription className="text-emerald-800">
                Produto salvo com sucesso! Você pode selecioná-lo na tela de Precificação.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome do Produto */}
            <div className="space-y-2">
              <Label htmlFor="product-name">Nome do Produto *</Label>
              <Input
                id="product-name"
                placeholder="Ex: Suporte para Celular"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
            </div>

            {/* Foto do Produto */}
            <div className="space-y-2">
              <Label>Foto do Produto</Label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2"
                >
                  <Camera className="h-4 w-4" />
                  {productPhoto ? 'Trocar Foto' : 'Adicionar Foto'}
                </Button>
                {productPhoto && (
                  <div className="relative">
                    <img 
                      src={productPhoto} 
                      alt="Preview"
                      className="w-12 h-12 object-cover rounded-lg border"
                    />
                    <button
                      onClick={() => setProductPhoto('')}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Botão Salvar */}
          <div className="flex justify-end">
            <Button
              onClick={handleSaveProduct}
              disabled={!productName.trim()}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              Salvar Produto
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-6">
          {/* Filamento */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Scale className="h-5 w-5 text-amber-600" />
                Filamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="filament-price">Preço do Rolo (R$)</Label>
                  <Input
                    id="filament-price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={filament.price}
                    onChange={(e) => updateFilament({ price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="filament-weight">Peso do Rolo (g)</Label>
                  <Input
                    id="filament-weight"
                    type="number"
                    min="1"
                    value={filament.weight}
                    onChange={(e) => updateFilament({ weight: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Custo por grama:</span>
                <Badge variant="secondary" className="font-mono">
                  {formatCurrency(calculation.filamentCostPerGram)}/g
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Impressora e Tempo */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Impressão
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="filament-used">Filamento Usado (g)</Label>
                  <Input
                    id="filament-used"
                    type="number"
                    step="0.1"
                    min="0"
                    value={printer.filamentWeightUsed}
                    onChange={(e) => updatePrinter({ filamentWeightUsed: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="power">Consumo (W)</Label>
                  <Input
                    id="power"
                    type="number"
                    min="0"
                    value={printer.powerConsumption}
                    onChange={(e) => updatePrinter({ powerConsumption: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hours">Horas</Label>
                  <Input
                    id="hours"
                    type="number"
                    min="0"
                    value={printer.printTimeHours}
                    onChange={(e) => updatePrinter({ printTimeHours: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minutes">Minutos</Label>
                  <Input
                    id="minutes"
                    type="number"
                    min="0"
                    max="59"
                    value={printer.printTimeMinutes}
                    onChange={(e) => updatePrinter({ printTimeMinutes: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Energia */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Energia
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="kwh-price">Preço do kWh (R$)</Label>
                <Input
                  id="kwh-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={energy.kwhPrice}
                  onChange={(e) => updateEnergy({ kwhPrice: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Custo energia/hora:</span>
                <Badge variant="secondary" className="font-mono">
                  {formatCurrency(calculation.energyCostPerHour)}/h
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Depreciação */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Wrench className="h-5 w-5 text-slate-600" />
                Depreciação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="printer-value">Valor da Impressora (R$)</Label>
                  <Input
                    id="printer-value"
                    type="number"
                    step="0.01"
                    min="0"
                    value={depreciation.printerValue}
                    onChange={(e) => updateDepreciation({ printerValue: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="life-hours">Vida Útil (horas)</Label>
                  <Input
                    id="life-hours"
                    type="number"
                    min="1"
                    value={depreciation.totalLifeHours}
                    onChange={(e) => updateDepreciation({ totalLifeHours: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Custo depreciação/hora:</span>
                <Badge variant="secondary" className="font-mono">
                  {formatCurrency(calculation.depreciationCostPerHour)}/h
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Margem de Segurança */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Margem de Segurança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="waste">% para Falhas e Suportes</Label>
                <Input
                  id="waste"
                  type="number"
                  min="0"
                  max="100"
                  value={waste.wastePercentage}
                  onChange={(e) => updateWaste({ wastePercentage: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <p className="text-xs text-slate-500">
                Adicione uma margem para cobrir falhas de impressão, suportes descartáveis e retrabalho.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Resultados */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-white">
                <Calculator className="h-5 w-5" />
                Resultado do Cálculo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-slate-700">
                  <span className="text-slate-300">Custo do Filamento:</span>
                  <span className="font-mono font-medium">{formatCurrency(calculation.totalFilamentCost)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-700">
                  <span className="text-slate-300">Custo de Energia:</span>
                  <span className="font-mono font-medium">{formatCurrency(calculation.totalEnergyCost)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-700">
                  <span className="text-slate-300">Depreciação:</span>
                  <span className="font-mono font-medium">{formatCurrency(calculation.totalDepreciationCost)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-700">
                  <span className="text-slate-300">Margem de Segurança ({waste.wastePercentage}%):</span>
                  <span className="font-mono font-medium">{formatCurrency(calculation.wasteCost)}</span>
                </div>
              </div>
              
              <Separator className="bg-slate-700" />
              
              <div className="pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Custo Total de Fabricação:</span>
                  <span className="text-3xl font-bold text-emerald-400">
                    {formatCurrency(calculation.totalManufacturingCost)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resumo por Peça */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-emerald-600" />
                Custo por Peça
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-slate-500 mb-1">Por Grama</p>
                  <p className="text-xl font-bold text-slate-900">
                    {formatCurrency(calculation.filamentCostPerGram)}
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-slate-500 mb-1">Por Hora</p>
                  <p className="text-xl font-bold text-slate-900">
                    {formatCurrency(calculation.energyCostPerHour + calculation.depreciationCostPerHour)}
                  </p>
                </div>
              </div>
              <div className="bg-emerald-50 p-4 rounded-lg text-center border border-emerald-200">
                <p className="text-sm text-emerald-700 mb-1">Custo Total da Peça</p>
                <p className="text-3xl font-bold text-emerald-700">
                  {formatCurrency(calculation.totalManufacturingCost)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Fórmulas */}
          <Card className="bg-slate-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Fórmulas Utilizadas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="p-3 bg-white rounded border">
                <p className="font-medium text-slate-700 mb-1">Custo de Energia:</p>
                <code className="text-xs bg-slate-100 px-2 py-1 rounded block">
                  (Watts ÷ 1000) × Horas × Preço kWh
                </code>
              </div>
              <div className="p-3 bg-white rounded border">
                <p className="font-medium text-slate-700 mb-1">Depreciação:</p>
                <code className="text-xs bg-slate-100 px-2 py-1 rounded block">
                  Valor da Impressora ÷ Horas de Vida Útil
                </code>
              </div>
              <div className="p-3 bg-white rounded border">
                <p className="font-medium text-slate-700 mb-1">Filamento:</p>
                <code className="text-xs bg-slate-100 px-2 py-1 rounded block">
                  (Preço do Rolo ÷ Peso do Rolo) × Gramas Usadas
                </code>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
