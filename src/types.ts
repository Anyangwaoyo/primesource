/**
 * PrimeSource Farm - Domain Types & Database Models
 */

export type UserRole = 'FARM_MANAGER' | 'ADMIN' | 'FIELD_TECH';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  farmName: string;
  title: string;
}

export type ProductionStage =
  | 'POND_PREPARATION'
  | 'STOCKED'
  | 'GROW_OUT'
  | 'HARVEST_READY'
  | 'HARVESTED';

export type PondStatus = 'HEALTHY' | 'ATTENTION_NEEDED' | 'CRITICAL';

export interface Pond {
  id: string;
  name: string;
  fishSpecies: string;
  dateStocked: string;
  initialFishStocked: number;
  currentFishCount: number;
  averageFishWeightGrams: number;
  productionStage: ProductionStage;
  expectedHarvestDate: string;
  status: PondStatus;
  pondType: string;
  waterCapacityLitres: number;
  notes?: string;
}

export type ReadingSource = 'PROTOTYPE_SIMULATED' | 'MANUAL_TESTING' | 'IOT_API';

export type WaterQualityStatus = 'NORMAL' | 'ATTENTION_NEEDED' | 'CRITICAL';

export interface WaterReading {
  id: string;
  pondId: string;
  temperatureC: number;
  pH: number;
  dissolvedOxygenMgL: number;
  timestamp: string;
  readingSource: ReadingSource;
  status: WaterQualityStatus;
  notes?: string;
}

export interface WaterThresholds {
  tempMin: number;
  tempMax: number;
  phMin: number;
  phMax: number;
  doMin: number;
}

export interface Alert {
  id: string;
  pondId: string;
  problemDetected: string;
  currentReading: string;
  timestamp: string;
  status: 'ATTENTION_NEEDED' | 'CRITICAL';
  parameterType?: string;
  recommendedAction?: string;
  resolved: boolean;
  resolvedAt?: string;
  actionTaken?: string;
  resolvedBy?: string;
}

export interface FeedingRecord {
  id: string;
  pondId: string;
  date: string;
  feedType: string;
  quantityKg: number;
  feedingTime: string;
  recordedBy: string;
  notes?: string;
}

export interface GrowthRecord {
  id: string;
  pondId: string;
  date: string;
  fishSampledCount: number;
  averageWeightGrams: number;
  notes?: string;
}

export interface MortalityRecord {
  id: string;
  pondId: string;
  date: string;
  deadFishCount: number;
  possibleObservation: string;
  actionTaken: string;
  recordedBy: string;
}

export interface ProductionCycle {
  id: string;
  pondId: string;
  cycleName: string;
  stage: ProductionStage;
  startDate: string;
  targetHarvestDate: string;
  actualHarvestDate?: string;
  targetWeightGrams: number;
  notes?: string;
  status: 'ACTIVE' | 'COMPLETED';
}

export interface HarvestRecord {
  id: string;
  pondId: string;
  cycleId: string;
  harvestDate: string;
  fishHarvestedCount: number;
  totalWeightKg: number;
  sellingPricePerKg: number;
  totalSales: number;
  buyerCustomer: string;
  notes?: string;
}

export interface ExpenseRecord {
  id: string;
  pondId: string;
  cycleId?: string;
  category: 'FEED' | 'FINGERLINGS' | 'WATER_TREATMENT' | 'EQUIPMENT' | 'LABOR' | 'OTHER';
  amount: number;
  date: string;
  description: string;
}

export type ActivityEventType =
  | 'WATER_READING'
  | 'FEEDING'
  | 'ALERT_TRIGGERED'
  | 'ALERT_RESOLVED'
  | 'MORTALITY'
  | 'GROWTH_SAMPLE'
  | 'STAGE_CHANGE'
  | 'HARVEST'
  | 'EXPENSE';

export interface FarmActivityEvent {
  id: string;
  pondId: string;
  timestamp: string;
  type: ActivityEventType;
  title: string;
  description: string;
  severity?: 'NORMAL' | 'ATTENTION_NEEDED' | 'CRITICAL';
}
