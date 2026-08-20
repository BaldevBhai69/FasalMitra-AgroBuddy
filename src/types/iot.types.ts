export interface IoTTelemetryPayload {
  soilMoisturePct: number;
  nitrogenMgKg: number;
  phosphorusMgKg: number;
  potassiumMgKg: number;
  magnesiumMgKg?: number;
  calciumMgKg?: number;
  sulfurMgKg?: number;
  soilPh: number;
  soilTemperatureC?: number;
  organicCarbonPct?: number;
  electricalConductivityDsM?: number;
}

export type IoTSimulationPreset =
  | 'DROUGHT'
  | 'MONSOON'
  | 'NUTRIENT_DEPLETION'
  | 'OPTIMAL'
  | 'SALINITY_SPIKE'
  | 'ACIDIC_SHOCK';

export interface IoTAgronomicStatus {
  moistureStatus: 'CRITICALLY_DRY' | 'LOW' | 'OPTIMAL' | 'WATERLOGGED';
  nitrogenStatus: 'DEFICIENT' | 'OPTIMAL' | 'EXCESS';
  phosphorusStatus: 'DEFICIENT' | 'OPTIMAL' | 'EXCESS';
  potassiumStatus: 'DEFICIENT' | 'OPTIMAL' | 'EXCESS';
  phStatus: 'ACIDIC' | 'OPTIMAL' | 'ALKALINE';
  overallHealthScore: number; // 0 to 100
  alerts: string[];
}
