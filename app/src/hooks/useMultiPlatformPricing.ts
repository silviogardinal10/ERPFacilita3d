import { useState, useCallback, useMemo } from 'react';
import type { PackagingCosts, PricingConfig } from '@/types';

// Default Fees based on market averages
const defaultShopeeFees = {
  commissionPercentage: 14,
  fixedFee: 4,
};

const defaultTikTokFees = {
  commissionPercentage: 12,
  fixedFee: 3, // Example realistic value
};

const defaultTemuFees = {
  commissionPercentage: 10,
  fixedFee: 0, // Temu primarily relies on margin markups, but using 0 fixed fee as baseline
};

const defaultPackaging: PackagingCosts = {
  box: 2.50,
  tape: 0.50,
  bubbleWrap: 1.00,
  label: 0.15,
  other: 0.00,
};

const defaultPricingConfig: PricingConfig = {
  profitMargin: 50,
  discountPercentage: 15,
};

export interface PlatformCalculation {
  shopeeCommission: number;
  shopeeFixedFee: number;
  shopeeSuggestedPrice: number;
  shopeePriceWithDiscount: number;
  shopeeBreakEven: number;
  shopeeProfit: number;
  
  tiktokCommission: number;
  tiktokFixedFee: number;
  tiktokSuggestedPrice: number;
  tiktokPriceWithDiscount: number;
  tiktokBreakEven: number;
  tiktokProfit: number;
  
  temuCommission: number;
  temuFixedFee: number;
  temuSuggestedPrice: number;
  temuPriceWithDiscount: number;
  temuBreakEven: number;
  temuProfit: number;

  manufacturingCost: number;
  totalPackagingCost: number;
  subtotal: number;
  profitAmount: number;
  discountAmount: number;
}

export function useMultiPlatformPricing(initialManufacturingCost: number = 0) {
  const [manufacturingCost, setManufacturingCost] = useState(initialManufacturingCost);
  
  const [shopeeFees, setShopeeFees] = useState(defaultShopeeFees);
  const [tiktokFees, setTikTokFees] = useState(defaultTikTokFees);
  const [temuFees, setTemuFees] = useState(defaultTemuFees);
  
  const [packaging, setPackaging] = useState<PackagingCosts>(defaultPackaging);
  const [pricingConfig, setPricingConfig] = useState<PricingConfig>(defaultPricingConfig);

  const totalPackagingCost = useMemo(() => {
    return packaging.box + packaging.tape + packaging.bubbleWrap + packaging.label + packaging.other;
  }, [packaging]);

  const calculation = useMemo((): PlatformCalculation => {
    const baseCost = manufacturingCost + totalPackagingCost;
    const marginRate = pricingConfig.profitMargin / 100;

    // Helper to calculate price for a specific platform
    const calcForPlatform = (commissionRate: number, fixedFee: number) => {
      const denominator = 1 - commissionRate - marginRate;
      let suggestedPrice = 0;
      
      if (denominator > 0) {
        suggestedPrice = (baseCost + fixedFee) / denominator;
      } else {
        suggestedPrice = baseCost * 3; // Fallback if margin+comission >= 100%
      }

      const commissionSize = suggestedPrice * commissionRate;
      const profitSize = suggestedPrice * marginRate;
      const breakEvenDenominator = 1 - commissionRate;
      const breakEvenPrice = breakEvenDenominator > 0 
        ? (baseCost + fixedFee) / breakEvenDenominator 
        : baseCost * 2;
      
      return { suggestedPrice, commissionSize, breakEvenPrice, profitSize };
    };

    // Shopee
    const shopeeObj = calcForPlatform(shopeeFees.commissionPercentage / 100, shopeeFees.fixedFee);
    
    // TikTok
    const tiktokObj = calcForPlatform(tiktokFees.commissionPercentage / 100, tiktokFees.fixedFee);
    
    // Temu
    const temuObj = calcForPlatform(temuFees.commissionPercentage / 100, temuFees.fixedFee);

    // Common
    const discountRate = pricingConfig.discountPercentage / 100;
    const calculateWithDiscount = (price: number) => {
      // Divide by (1 - discountRate) to get the correct original price
      // so that (Original * (1 - discount)) = Final Price
      if (discountRate >= 1) return price * 2;
      return price / (1 - discountRate);
    };

    const discountAmount = calculateWithDiscount(shopeeObj.suggestedPrice) - shopeeObj.suggestedPrice;

    return {
      manufacturingCost,
      totalPackagingCost,
      subtotal: baseCost,
      profitAmount: shopeeObj.suggestedPrice * marginRate, // Base profit indicator on shopee size
      discountAmount,
      
      shopeeCommission: shopeeObj.commissionSize,
      shopeeFixedFee: shopeeFees.fixedFee,
      shopeeSuggestedPrice: shopeeObj.suggestedPrice,
      shopeePriceWithDiscount: calculateWithDiscount(shopeeObj.suggestedPrice),
      shopeeBreakEven: shopeeObj.breakEvenPrice,
      shopeeProfit: shopeeObj.profitSize,

      tiktokCommission: tiktokObj.commissionSize,
      tiktokFixedFee: tiktokFees.fixedFee,
      tiktokSuggestedPrice: tiktokObj.suggestedPrice,
      tiktokPriceWithDiscount: calculateWithDiscount(tiktokObj.suggestedPrice),
      tiktokBreakEven: tiktokObj.breakEvenPrice,
      tiktokProfit: tiktokObj.profitSize,

      temuCommission: temuObj.commissionSize,
      temuFixedFee: temuFees.fixedFee,
      temuSuggestedPrice: temuObj.suggestedPrice,
      temuPriceWithDiscount: calculateWithDiscount(temuObj.suggestedPrice),
      temuBreakEven: temuObj.breakEvenPrice,
      temuProfit: temuObj.profitSize,
    };
  }, [
    manufacturingCost,
    totalPackagingCost,
    shopeeFees,
    tiktokFees,
    temuFees,
    pricingConfig
  ]);

  const updateShopeeFees = useCallback((data: Partial<typeof defaultShopeeFees>) => setShopeeFees(p => ({ ...p, ...data })), []);
  const updateTikTokFees = useCallback((data: Partial<typeof defaultTikTokFees>) => setTikTokFees(p => ({ ...p, ...data })), []);
  const updateTemuFees = useCallback((data: Partial<typeof defaultTemuFees>) => setTemuFees(p => ({ ...p, ...data })), []);
  const updatePackaging = useCallback((data: Partial<PackagingCosts>) => setPackaging(p => ({ ...p, ...data })), []);
  const updatePricingConfig = useCallback((data: Partial<PricingConfig>) => setPricingConfig(p => ({ ...p, ...data })), []);

  const resetAll = useCallback(() => {
    setManufacturingCost(initialManufacturingCost);
    setShopeeFees(defaultShopeeFees);
    setTikTokFees(defaultTikTokFees);
    setTemuFees(defaultTemuFees);
    setPackaging(defaultPackaging);
    setPricingConfig(defaultPricingConfig);
  }, [initialManufacturingCost]);

  return {
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
    setManufacturingCost,
    resetAll,
  };
}
