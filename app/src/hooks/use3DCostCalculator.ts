import { useState, useCallback, useMemo } from 'react';
import type {
  FilamentData,
  PrinterData,
  EnergyData,
  DepreciationData,
  WasteConfig,
  Cost3DCalculation,
} from '@/types';

const defaultFilament: FilamentData = {
  price: 70,    // R$ 70,00 por rolo
  weight: 1000, // 1kg = 1000g
};

const defaultPrinter: PrinterData = {
  powerConsumption: 150, // 150W
  printTimeHours: 0,
  printTimeMinutes: 0,
  filamentWeightUsed: 50, // 50g
};

const defaultEnergy: EnergyData = {
  kwhPrice: 0.75, // R$ 0,75 por kWh
};

const defaultDepreciation: DepreciationData = {
  printerValue: 2500,  // R$ 2.500,00
  totalLifeHours: 5000, // 5.000 horas de vida útil
};

const defaultWaste: WasteConfig = {
  wastePercentage: 10, // 10% de margem de segurança
};

export function use3DCostCalculator() {
  const [filament, setFilament] = useState<FilamentData>(defaultFilament);
  const [printer, setPrinter] = useState<PrinterData>(defaultPrinter);
  const [energy, setEnergy] = useState<EnergyData>(defaultEnergy);
  const [depreciation, setDepreciation] = useState<DepreciationData>(defaultDepreciation);
  const [waste, setWaste] = useState<WasteConfig>(defaultWaste);

  // Cálculo do custo do filamento por grama
  const filamentCostPerGram = useMemo(() => {
    if (filament.weight <= 0) return 0;
    return filament.price / filament.weight;
  }, [filament.price, filament.weight]);

  // Cálculo do custo de energia por hora
  const energyCostPerHour = useMemo(() => {
    if (energy.kwhPrice < 0) return 0;
    // (Watts / 1000) * Preço do kWh
    return (printer.powerConsumption / 1000) * energy.kwhPrice;
  }, [printer.powerConsumption, energy.kwhPrice]);

  // Cálculo do custo de depreciação por hora
  const depreciationCostPerHour = useMemo(() => {
    if (depreciation.totalLifeHours <= 0) return 0;
    return depreciation.printerValue / depreciation.totalLifeHours;
  }, [depreciation.printerValue, depreciation.totalLifeHours]);

  // Tempo total de impressão em horas (incluindo minutos)
  const totalPrintTimeHours = useMemo(() => {
    return printer.printTimeHours + (printer.printTimeMinutes / 60);
  }, [printer.printTimeHours, printer.printTimeMinutes]);

  // Cálculos totais
  const calculation: Cost3DCalculation = useMemo(() => {
    // Custo do filamento usado
    const totalFilamentCost = filamentCostPerGram * printer.filamentWeightUsed;
    
    // Custo de energia
    const totalEnergyCost = energyCostPerHour * totalPrintTimeHours;
    
    // Custo de depreciação
    const totalDepreciationCost = depreciationCostPerHour * totalPrintTimeHours;
    
    // Custo de desperdício (falhas e suportes)
    const subtotal = totalFilamentCost + totalEnergyCost + totalDepreciationCost;
    const wasteCost = subtotal * (waste.wastePercentage / 100);
    
    // Custo total de fabricação
    const totalManufacturingCost = subtotal + wasteCost;

    return {
      filamentCostPerGram,
      energyCostPerHour,
      depreciationCostPerHour,
      totalFilamentCost,
      totalEnergyCost,
      totalDepreciationCost,
      wasteCost,
      totalManufacturingCost,
    };
  }, [
    filamentCostPerGram,
    energyCostPerHour,
    depreciationCostPerHour,
    totalPrintTimeHours,
    printer.filamentWeightUsed,
    waste.wastePercentage,
  ]);

  // Atualizadores
  const updateFilament = useCallback((data: Partial<FilamentData>) => {
    setFilament(prev => ({ ...prev, ...data }));
  }, []);

  const updatePrinter = useCallback((data: Partial<PrinterData>) => {
    setPrinter(prev => ({ ...prev, ...data }));
  }, []);

  const updateEnergy = useCallback((data: Partial<EnergyData>) => {
    setEnergy(prev => ({ ...prev, ...data }));
  }, []);

  const updateDepreciation = useCallback((data: Partial<DepreciationData>) => {
    setDepreciation(prev => ({ ...prev, ...data }));
  }, []);

  const updateWaste = useCallback((data: Partial<WasteConfig>) => {
    setWaste(prev => ({ ...prev, ...data }));
  }, []);

  const resetAll = useCallback(() => {
    setFilament(defaultFilament);
    setPrinter(defaultPrinter);
    setEnergy(defaultEnergy);
    setDepreciation(defaultDepreciation);
    setWaste(defaultWaste);
  }, []);

  return {
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
  };
}
