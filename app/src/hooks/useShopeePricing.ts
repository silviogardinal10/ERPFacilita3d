import { useState, useCallback, useMemo } from 'react';
import type {
  ShopeeFees,
  PackagingCosts,
  PricingConfig,
  PricingCalculation,
} from '@/types';

const defaultShopeeFees: ShopeeFees = {
  commissionPercentage: 14, // 14% de comissão Shopee
  fixedFee: 4,              // R$ 4,00 fixo por item
};

const defaultPackaging: PackagingCosts = {
  box: 2.50,       // Caixa
  tape: 0.50,      // Fita
  bubbleWrap: 1.00, // Plástico bolha
  label: 0.15,     // Etiqueta
  other: 0.50,     // Outros
};

const defaultPricingConfig: PricingConfig = {
  profitMargin: 50,    // 50% de margem de lucro
  discountPercentage: 15, // 15% de desconto para ofertas
};

export function useShopeePricing(initialManufacturingCost: number = 0) {
  const [manufacturingCost, setManufacturingCost] = useState(initialManufacturingCost);
  const [shopeeFees, setShopeeFees] = useState<ShopeeFees>(defaultShopeeFees);
  const [packaging, setPackaging] = useState<PackagingCosts>(defaultPackaging);
  const [pricingConfig, setPricingConfig] = useState<PricingConfig>(defaultPricingConfig);

  // Custo total de embalagem
  const totalPackagingCost = useMemo(() => {
    return packaging.box + packaging.tape + packaging.bubbleWrap + packaging.label + packaging.other;
  }, [packaging]);

  // Cálculo completo de precificação
  const calculation: PricingCalculation = useMemo(() => {
    // Custo base = custo de fabricação + embalagem
    const baseCost = manufacturingCost + totalPackagingCost;

    // Calcular preço de venda considerando comissão Shopee
    // Fórmula: Preço = (Custo + Taxa Fixa) / (1 - % Comissão - % Margem)
    const commissionRate = shopeeFees.commissionPercentage / 100;
    const marginRate = pricingConfig.profitMargin / 100;

    // Preço sugerido (sem desconto)
    // Precisa cobrir: custo + taxa fixa + comissão percentual + margem de lucro
    // Preço = (Custo + Taxa Fixa) / (1 - Comissão - Margem)
    const denominator = 1 - commissionRate - marginRate;
    let suggestedPrice = 0;

    if (denominator > 0) {
      suggestedPrice = (baseCost + shopeeFees.fixedFee) / denominator;
    } else {
      // Se a margem + comissão for >= 100%, não é viável
      suggestedPrice = baseCost * 3; // Fallback
    }

    // Calcular valores
    const shopeeCommission = suggestedPrice * commissionRate;
    const profitAmount = suggestedPrice * marginRate;

    // Preço com desconto (para ofertas relâmpago) - ADICIONADO ao invés de subtraído
    const discountAmount = suggestedPrice * (pricingConfig.discountPercentage / 100);
    const priceWithDiscount = suggestedPrice + discountAmount;

    // Preço de equilíbrio (sem lucro, apenas cobrir custos)
    const breakEvenDenominator = 1 - commissionRate;
    const breakEvenPrice = breakEvenDenominator > 0
      ? (baseCost + shopeeFees.fixedFee) / breakEvenDenominator
      : baseCost * 2;

    return {
      manufacturingCost,
      shopeeCommission,
      shopeeFixedFee: shopeeFees.fixedFee,
      totalPackagingCost,
      subtotal: baseCost,
      profitAmount,
      discountAmount,
      suggestedPrice,
      priceWithDiscount,
      breakEvenPrice,
    };
  }, [
    manufacturingCost,
    totalPackagingCost,
    shopeeFees.commissionPercentage,
    shopeeFees.fixedFee,
    pricingConfig.profitMargin,
    pricingConfig.discountPercentage,
  ]);

  // Atualizadores
  const updateShopeeFees = useCallback((data: Partial<ShopeeFees>) => {
    setShopeeFees(prev => ({ ...prev, ...data }));
  }, []);

  const updatePackaging = useCallback((data: Partial<PackagingCosts>) => {
    setPackaging(prev => ({ ...prev, ...data }));
  }, []);

  const updatePricingConfig = useCallback((data: Partial<PricingConfig>) => {
    setPricingConfig(prev => ({ ...prev, ...data }));
  }, []);

  const resetAll = useCallback(() => {
    setManufacturingCost(initialManufacturingCost);
    setShopeeFees(defaultShopeeFees);
    setPackaging(defaultPackaging);
    setPricingConfig(defaultPricingConfig);
  }, [initialManufacturingCost]);

  return {
    shopeeFees,
    packaging,
    pricingConfig,
    calculation,
    updateShopeeFees,
    updatePackaging,
    updatePricingConfig,
    setManufacturingCost,
    resetAll,
  };
}
