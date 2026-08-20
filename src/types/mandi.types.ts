export interface MandiPriceRecord {
  id: string;
  state: string;
  district: string;
  marketName: string;
  commodity: string;
  variety: string;
  arrivalDate: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  source: string;
}

export interface MandiPriceTrendPoint {
  date: string;
  modalPrice: number;
  minPrice: number;
  maxPrice: number;
  marketCount: number;
}

export interface SellVsHoldAdvice {
  recommendation: 'SELL_NOW' | 'HOLD_AND_STORE' | 'MODERATE_HOLD';
  badgeTitle: string;
  headline: string;
  reasoning: string;
  currentModalPricePerQuintal: number;
  mspBenchmarkPerQuintal?: number | null;
  priceVersusMspDiffPct?: number | null;
  forecastedPrice45Days: number;
  projectedGrossGainPct: number;
  estimatedStorageCostPerMonthPerQuintal: number;
  estimatedStorageDurationDays: number;
  estimatedPerishabilityLossPct: number;
  projectedNetGainPct: number;
  confidenceScorePct: number;
  isPerishable: boolean;
  maxRecommendedHoldDays: number;
  nearestMandis: {
    marketName: string;
    district: string;
    state: string;
    modalPrice: number;
    arrivalDate: string;
  }[];
}
