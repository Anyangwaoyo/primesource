import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  User,
  Pond,
  WaterReading,
  Alert,
  FeedingRecord,
  GrowthRecord,
  MortalityRecord,
  ProductionCycle,
  HarvestRecord,
  ExpenseRecord,
  FarmActivityEvent,
  ProductionStage,
  PondStatus,
  WaterQualityStatus,
  ReadingSource,
} from '../types';
import {
  INITIAL_USER,
  INITIAL_PONDS,
  INITIAL_WATER_READINGS,
  INITIAL_ALERTS,
  INITIAL_FEEDING_RECORDS,
  INITIAL_GROWTH_RECORDS,
  INITIAL_MORTALITY_RECORDS,
  INITIAL_PRODUCTION_CYCLES,
  INITIAL_HARVEST_RECORDS,
  INITIAL_EXPENSES,
  INITIAL_ACTIVITIES,
  DEFAULT_THRESHOLDS,
} from '../data/mockData';

interface FarmContextType {
  user: User | null;
  login: (email: string) => boolean;
  logout: () => void;
  ponds: Pond[];
  waterReadings: WaterReading[];
  alerts: Alert[];
  feedingRecords: FeedingRecord[];
  growthRecords: GrowthRecord[];
  mortalityRecords: MortalityRecord[];
  productionCycles: ProductionCycle[];
  harvestRecords: HarvestRecord[];
  expenses: ExpenseRecord[];
  activities: FarmActivityEvent[];
  isLiveSimulationActive: boolean;
  toggleLiveSimulation: () => void;
  
  // Actions
  addPond: (pond: Omit<Pond, 'id' | 'currentFishCount' | 'status'>) => Pond;
  updatePond: (id: string, updates: Partial<Pond>) => void;
  addWaterReading: (reading: {
    pondId: string;
    temperatureC: number;
    pH: number;
    dissolvedOxygenMgL: number;
    readingSource: ReadingSource;
    notes?: string;
  }) => WaterReading;
  resolveAlert: (alertId: string, actionTaken: string) => void;
  addFeedingRecord: (feed: Omit<FeedingRecord, 'id' | 'recordedBy'>) => FeedingRecord;
  addGrowthRecord: (growth: Omit<GrowthRecord, 'id'>) => GrowthRecord;
  addMortalityRecord: (mortality: Omit<MortalityRecord, 'id' | 'recordedBy'>) => MortalityRecord;
  advanceCycleStage: (cycleId: string, newStage: ProductionStage) => void;
  addHarvestRecord: (harvest: Omit<HarvestRecord, 'id' | 'totalSales'>) => HarvestRecord;
  addExpense: (expense: Omit<ExpenseRecord, 'id'>) => ExpenseRecord;
  simulateSensorPacket: (pondId: string, abnormal?: boolean) => void;
  resetToDefaults: () => void;
}

const FarmContext = createContext<FarmContextType | undefined>(undefined);

const STORAGE_KEY = 'primesource_farm_state_v1';

export function determineWaterQualityStatus(
  temperatureC: number,
  pH: number,
  dissolvedOxygenMgL: number
): { status: WaterQualityStatus; issueDescription?: string } {
  // Safe limits
  // pH safe: 6.5 - 8.5
  // DO safe: >= 5.0
  // Temp safe: 26.0 - 30.0
  const issues: string[] = [];

  if (pH < 5.5) {
    issues.push(`Severely acidic pH (${pH.toFixed(1)})`);
  } else if (pH < 6.5) {
    issues.push(`Low pH (${pH.toFixed(1)})`);
  } else if (pH > 9.0) {
    issues.push(`Severely alkaline pH (${pH.toFixed(1)})`);
  } else if (pH > 8.5) {
    issues.push(`High pH (${pH.toFixed(1)})`);
  }

  if (dissolvedOxygenMgL < 3.5) {
    issues.push(`Critical low oxygen (${dissolvedOxygenMgL.toFixed(1)} mg/L)`);
  } else if (dissolvedOxygenMgL < 5.0) {
    issues.push(`Low oxygen (${dissolvedOxygenMgL.toFixed(1)} mg/L)`);
  }

  if (temperatureC < 24.0) {
    issues.push(`Water temperature low (${temperatureC.toFixed(1)}°C)`);
  } else if (temperatureC > 32.0) {
    issues.push(`High water temperature (${temperatureC.toFixed(1)}°C)`);
  } else if (temperatureC < 26.0 || temperatureC > 30.0) {
    issues.push(`Sub-optimal temperature (${temperatureC.toFixed(1)}°C)`);
  }

  if (issues.some(i => i.includes('Critical') || i.includes('Severely'))) {
    return { status: 'CRITICAL', issueDescription: issues.join(', ') };
  }
  if (issues.length > 0) {
    return { status: 'ATTENTION_NEEDED', issueDescription: issues.join(', ') };
  }
  return { status: 'NORMAL' };
}

export const FarmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial state with local storage fallback
  const [user, setUser] = useState<User | null>(INITIAL_USER);
  const [ponds, setPonds] = useState<Pond[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_ponds`);
      return saved ? JSON.parse(saved) : INITIAL_PONDS;
    } catch {
      return INITIAL_PONDS;
    }
  });

  const [waterReadings, setWaterReadings] = useState<WaterReading[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_readings`);
      return saved ? JSON.parse(saved) : INITIAL_WATER_READINGS;
    } catch {
      return INITIAL_WATER_READINGS;
    }
  });

  const [alerts, setAlerts] = useState<Alert[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_alerts`);
      return saved ? JSON.parse(saved) : INITIAL_ALERTS;
    } catch {
      return INITIAL_ALERTS;
    }
  });

  const [feedingRecords, setFeedingRecords] = useState<FeedingRecord[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_feeds`);
      return saved ? JSON.parse(saved) : INITIAL_FEEDING_RECORDS;
    } catch {
      return INITIAL_FEEDING_RECORDS;
    }
  });

  const [growthRecords, setGrowthRecords] = useState<GrowthRecord[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_growth`);
      return saved ? JSON.parse(saved) : INITIAL_GROWTH_RECORDS;
    } catch {
      return INITIAL_GROWTH_RECORDS;
    }
  });

  const [mortalityRecords, setMortalityRecords] = useState<MortalityRecord[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_mortality`);
      return saved ? JSON.parse(saved) : INITIAL_MORTALITY_RECORDS;
    } catch {
      return INITIAL_MORTALITY_RECORDS;
    }
  });

  const [productionCycles, setProductionCycles] = useState<ProductionCycle[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_cycles`);
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTION_CYCLES;
    } catch {
      return INITIAL_PRODUCTION_CYCLES;
    }
  });

  const [harvestRecords, setHarvestRecords] = useState<HarvestRecord[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_harvest`);
      return saved ? JSON.parse(saved) : INITIAL_HARVEST_RECORDS;
    } catch {
      return INITIAL_HARVEST_RECORDS;
    }
  });

  const [expenses, setExpenses] = useState<ExpenseRecord[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_expenses`);
      return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
    } catch {
      return INITIAL_EXPENSES;
    }
  });

  const [activities, setActivities] = useState<FarmActivityEvent[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_activities`);
      return saved ? JSON.parse(saved) : INITIAL_ACTIVITIES;
    } catch {
      return INITIAL_ACTIVITIES;
    }
  });

  const [isLiveSimulationActive, setIsLiveSimulationActive] = useState<boolean>(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_ponds`, JSON.stringify(ponds));
      localStorage.setItem(`${STORAGE_KEY}_readings`, JSON.stringify(waterReadings));
      localStorage.setItem(`${STORAGE_KEY}_alerts`, JSON.stringify(alerts));
      localStorage.setItem(`${STORAGE_KEY}_feeds`, JSON.stringify(feedingRecords));
      localStorage.setItem(`${STORAGE_KEY}_growth`, JSON.stringify(growthRecords));
      localStorage.setItem(`${STORAGE_KEY}_mortality`, JSON.stringify(mortalityRecords));
      localStorage.setItem(`${STORAGE_KEY}_cycles`, JSON.stringify(productionCycles));
      localStorage.setItem(`${STORAGE_KEY}_harvest`, JSON.stringify(harvestRecords));
      localStorage.setItem(`${STORAGE_KEY}_expenses`, JSON.stringify(expenses));
      localStorage.setItem(`${STORAGE_KEY}_activities`, JSON.stringify(activities));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [ponds, waterReadings, alerts, feedingRecords, growthRecords, mortalityRecords, productionCycles, harvestRecords, expenses, activities]);

  // Auth
  const login = useCallback((email: string): boolean => {
    if (email.trim().toLowerCase() === 'manager@primesource.farm' || email.includes('@')) {
      setUser(INITIAL_USER);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  // Ponds
  const addPond = useCallback((pondData: Omit<Pond, 'id' | 'currentFishCount' | 'status'>): Pond => {
    const id = `POND-A0${ponds.length + 1}`;
    const newPond: Pond = {
      ...pondData,
      id,
      currentFishCount: pondData.initialFishStocked,
      status: 'HEALTHY',
    };
    setPonds(prev => [...prev, newPond]);

    // Create default cycle
    const newCycle: ProductionCycle = {
      id: `cyc-${Date.now()}`,
      pondId: id,
      cycleName: `${pondData.name} Stocking Cycle`,
      stage: pondData.productionStage,
      startDate: pondData.dateStocked,
      targetHarvestDate: pondData.expectedHarvestDate,
      targetWeightGrams: 800,
      status: 'ACTIVE',
    };
    setProductionCycles(prev => [...prev, newCycle]);

    // Log activity
    const act: FarmActivityEvent = {
      id: `act-${Date.now()}`,
      pondId: id,
      timestamp: new Date().toISOString(),
      type: 'STAGE_CHANGE',
      title: `${newPond.name} Created & Stocked`,
      description: `Stocked ${newPond.initialFishStocked.toLocaleString()} ${newPond.fishSpecies}. Stage: ${newPond.productionStage}.`,
      severity: 'NORMAL',
    };
    setActivities(prev => [act, ...prev]);

    return newPond;
  }, [ponds.length]);

  const updatePond = useCallback((id: string, updates: Partial<Pond>) => {
    setPonds(prev => prev.map(p => (p.id === id ? { ...p, ...updates } : p)));
  }, []);

  // Water Readings
  const addWaterReading = useCallback((readingData: {
    pondId: string;
    temperatureC: number;
    pH: number;
    dissolvedOxygenMgL: number;
    readingSource: ReadingSource;
    notes?: string;
  }): WaterReading => {
    const { status, issueDescription } = determineWaterQualityStatus(
      readingData.temperatureC,
      readingData.pH,
      readingData.dissolvedOxygenMgL
    );

    const newReading: WaterReading = {
      id: `wr-${Date.now()}`,
      ...readingData,
      timestamp: new Date().toISOString(),
      status,
    };

    setWaterReadings(prev => [newReading, ...prev]);

    const targetPond = ponds.find(p => p.id === readingData.pondId);
    const pondName = targetPond ? targetPond.name : readingData.pondId;

    // Trigger alert if status is ATTENTION_NEEDED or CRITICAL
    if (status !== 'NORMAL') {
      const alertId = `alt-${Date.now()}`;
      const newAlert: Alert = {
        id: alertId,
        pondId: readingData.pondId,
        problemDetected: `${issueDescription || 'Unusual water quality reading'} in ${pondName}`,
        currentReading: `pH: ${readingData.pH.toFixed(1)} | Temp: ${readingData.temperatureC.toFixed(1)}°C | DO: ${readingData.dissolvedOxygenMgL.toFixed(1)} mg/L`,
        timestamp: new Date().toISOString(),
        status: status === 'CRITICAL' ? 'CRITICAL' : 'ATTENTION_NEEDED',
        resolved: false,
      };

      setAlerts(prev => [newAlert, ...prev]);

      // Update pond status
      setPonds(prev =>
        prev.map(p =>
          p.id === readingData.pondId
            ? { ...p, status: status === 'CRITICAL' ? 'CRITICAL' : 'ATTENTION_NEEDED' }
            : p
        )
      );

      // Log alert event
      const alertAct: FarmActivityEvent = {
        id: `act-${Date.now()}`,
        pondId: readingData.pondId,
        timestamp: new Date().toISOString(),
        type: 'ALERT_TRIGGERED',
        title: `${status === 'CRITICAL' ? 'Critical' : 'Attention'} Alert: ${issueDescription}`,
        description: `Readings: pH ${readingData.pH.toFixed(1)}, Temp ${readingData.temperatureC.toFixed(1)}°C, DO ${readingData.dissolvedOxygenMgL.toFixed(1)} mg/L. Source: ${readingData.readingSource}.`,
        severity: status,
      };
      setActivities(prev => [alertAct, ...prev]);
    } else {
      // If normal reading, log normal event
      const normalAct: FarmActivityEvent = {
        id: `act-${Date.now()}`,
        pondId: readingData.pondId,
        timestamp: new Date().toISOString(),
        type: 'WATER_READING',
        title: `Water Reading Logged (${readingData.readingSource === 'MANUAL_TESTING' ? 'Manual Test' : 'Prototype Sensor'})`,
        description: `Temp: ${readingData.temperatureC.toFixed(1)}°C, pH: ${readingData.pH.toFixed(1)}, DO: ${readingData.dissolvedOxygenMgL.toFixed(1)} mg/L (Normal).`,
        severity: 'NORMAL',
      };
      setActivities(prev => [normalAct, ...prev]);
    }

    return newReading;
  }, [ponds]);

  // Resolve Alert
  const resolveAlert = useCallback((alertId: string, actionTaken: string) => {
    const alert = alerts.find(a => a.id === alertId);
    if (!alert) return;

    const resolvedTime = new Date().toISOString();
    setAlerts(prev =>
      prev.map(a =>
        a.id === alertId
          ? {
              ...a,
              resolved: true,
              resolvedAt: resolvedTime,
              actionTaken,
              resolvedBy: user?.name || 'Farm Manager',
            }
          : a
      )
    );

    // Recheck if pond still has unresolved alerts
    const remainingUnresolved = alerts.filter(
      a => a.pondId === alert.pondId && a.id !== alertId && !a.resolved
    );

    if (remainingUnresolved.length === 0) {
      setPonds(prev =>
        prev.map(p => (p.id === alert.pondId ? { ...p, status: 'HEALTHY' } : p))
      );
    }

    // Activity log
    const act: FarmActivityEvent = {
      id: `act-${Date.now()}`,
      pondId: alert.pondId,
      timestamp: resolvedTime,
      type: 'ALERT_RESOLVED',
      title: 'Alert Marked Resolved',
      description: `Action taken: ${actionTaken}. Recorded by ${user?.name || 'Farm Manager'}.`,
      severity: 'NORMAL',
    };
    setActivities(prev => [act, ...prev]);
  }, [alerts, user]);

  // Feeding
  const addFeedingRecord = useCallback((feedData: Omit<FeedingRecord, 'id' | 'recordedBy'>): FeedingRecord => {
    const newRecord: FeedingRecord = {
      id: `feed-${Date.now()}`,
      ...feedData,
      recordedBy: user?.name || 'Farm Manager',
    };
    setFeedingRecords(prev => [newRecord, ...prev]);

    // Activity
    const act: FarmActivityEvent = {
      id: `act-${Date.now()}`,
      pondId: feedData.pondId,
      timestamp: new Date().toISOString(),
      type: 'FEEDING',
      title: `${feedData.quantityKg} kg Feed Given`,
      description: `Feed type: ${feedData.feedType}. Time: ${feedData.feedingTime}. ${feedData.notes ? `Note: ${feedData.notes}` : ''}`,
      severity: 'NORMAL',
    };
    setActivities(prev => [act, ...prev]);

    return newRecord;
  }, [user]);

  // Growth Sampling
  const addGrowthRecord = useCallback((growthData: Omit<GrowthRecord, 'id'>): GrowthRecord => {
    const newRecord: GrowthRecord = {
      id: `gw-${Date.now()}`,
      ...growthData,
    };
    setGrowthRecords(prev => [...prev, newRecord]);

    // Update pond average weight
    setPonds(prev =>
      prev.map(p =>
        p.id === growthData.pondId
          ? { ...p, averageFishWeightGrams: growthData.averageWeightGrams }
          : p
      )
    );

    const act: FarmActivityEvent = {
      id: `act-${Date.now()}`,
      pondId: growthData.pondId,
      timestamp: new Date().toISOString(),
      type: 'GROWTH_SAMPLE',
      title: `Fish Growth Sampled (${growthData.averageWeightGrams}g avg)`,
      description: `Sampled ${growthData.fishSampledCount} fish. ${growthData.notes || 'Sampling documented.'}`,
      severity: 'NORMAL',
    };
    setActivities(prev => [act, ...prev]);

    return newRecord;
  }, []);

  // Mortality
  const addMortalityRecord = useCallback((mortalityData: Omit<MortalityRecord, 'id' | 'recordedBy'>): MortalityRecord => {
    const newRecord: MortalityRecord = {
      id: `mort-${Date.now()}`,
      ...mortalityData,
      recordedBy: user?.name || 'Farm Manager',
    };
    setMortalityRecords(prev => [newRecord, ...prev]);

    // Automatically update estimated fish count in pond
    setPonds(prev =>
      prev.map(p => {
        if (p.id === mortalityData.pondId) {
          const updatedCount = Math.max(0, p.currentFishCount - mortalityData.deadFishCount);
          return {
            ...p,
            currentFishCount: updatedCount,
          };
        }
        return p;
      })
    );

    const act: FarmActivityEvent = {
      id: `act-${Date.now()}`,
      pondId: mortalityData.pondId,
      timestamp: new Date().toISOString(),
      type: 'MORTALITY',
      title: `${mortalityData.deadFishCount} Dead Fish Recorded`,
      description: `Observation: ${mortalityData.possibleObservation}. Action taken: ${mortalityData.actionTaken}.`,
      severity: 'ATTENTION_NEEDED',
    };
    setActivities(prev => [act, ...prev]);

    return newRecord;
  }, [user]);

  // Production Cycle Stage Advance
  const advanceCycleStage = useCallback((cycleId: string, newStage: ProductionStage) => {
    setProductionCycles(prev =>
      prev.map(c => (c.id === cycleId ? { ...c, stage: newStage } : c))
    );

    const cycle = productionCycles.find(c => c.id === cycleId);
    if (cycle) {
      setPonds(prev =>
        prev.map(p => (p.id === cycle.pondId ? { ...p, productionStage: newStage } : p))
      );

      const act: FarmActivityEvent = {
        id: `act-${Date.now()}`,
        pondId: cycle.pondId,
        timestamp: new Date().toISOString(),
        type: 'STAGE_CHANGE',
        title: `Production Stage Advanced: ${newStage.replace(/_/g, ' ')}`,
        description: `Cycle ${cycle.cycleName} advanced to ${newStage.replace(/_/g, ' ')}.`,
        severity: 'NORMAL',
      };
      setActivities(prev => [act, ...prev]);
    }
  }, [productionCycles]);

  // Harvest Record
  const addHarvestRecord = useCallback((harvestData: Omit<HarvestRecord, 'id' | 'totalSales'>): HarvestRecord => {
    const totalSales = Number((harvestData.totalWeightKg * harvestData.sellingPricePerKg).toFixed(2));
    const newRecord: HarvestRecord = {
      id: `hrv-${Date.now()}`,
      ...harvestData,
      totalSales,
    };
    setHarvestRecords(prev => [newRecord, ...prev]);

    // Update pond stage to HARVESTED
    setPonds(prev =>
      prev.map(p =>
        p.id === harvestData.pondId
          ? { ...p, productionStage: 'HARVESTED', currentFishCount: Math.max(0, p.currentFishCount - harvestData.fishHarvestedCount) }
          : p
      )
    );

    // Update cycle to HARVESTED
    if (harvestData.cycleId) {
      setProductionCycles(prev =>
        prev.map(c =>
          c.id === harvestData.cycleId
            ? { ...c, stage: 'HARVESTED', actualHarvestDate: harvestData.harvestDate, status: 'COMPLETED' }
            : c
        )
      );
    }

    const act: FarmActivityEvent = {
      id: `act-${Date.now()}`,
      pondId: harvestData.pondId,
      timestamp: new Date().toISOString(),
      type: 'HARVEST',
      title: `Pond Harvest Completed (${harvestData.totalWeightKg.toLocaleString()} kg)`,
      description: `Harvested ${harvestData.fishHarvestedCount.toLocaleString()} fish. Total sales: $${totalSales.toLocaleString()} to ${harvestData.buyerCustomer}.`,
      severity: 'NORMAL',
    };
    setActivities(prev => [act, ...prev]);

    return newRecord;
  }, []);

  // Expense
  const addExpense = useCallback((expenseData: Omit<ExpenseRecord, 'id'>): ExpenseRecord => {
    const newRecord: ExpenseRecord = {
      id: `exp-${Date.now()}`,
      ...expenseData,
    };
    setExpenses(prev => [newRecord, ...prev]);

    const act: FarmActivityEvent = {
      id: `act-${Date.now()}`,
      pondId: expenseData.pondId,
      timestamp: new Date().toISOString(),
      type: 'EXPENSE',
      title: `Expense Recorded: $${expenseData.amount.toFixed(2)} (${expenseData.category.replace('_', ' ')})`,
      description: `${expenseData.description}`,
      severity: 'NORMAL',
    };
    setActivities(prev => [act, ...prev]);

    return newRecord;
  }, []);

  // Simulate Sensor Packet
  const simulateSensorPacket = useCallback((pondId: string, abnormal = false) => {
    let temperatureC = 27.5 + (Math.random() * 1.5 - 0.7);
    let pH = 7.1 + (Math.random() * 0.4 - 0.2);
    let dissolvedOxygenMgL = 6.4 + (Math.random() * 0.8 - 0.4);

    if (abnormal) {
      const type = Math.random() > 0.5 ? 'acidic' : 'low_oxygen';
      if (type === 'acidic') {
        pH = 5.2 + Math.random() * 0.4; // Low pH
        temperatureC = 29.2;
        dissolvedOxygenMgL = 4.3;
      } else {
        dissolvedOxygenMgL = 3.2; // Critical low oxygen
        temperatureC = 28.5;
        pH = 6.6;
      }
    }

    addWaterReading({
      pondId,
      temperatureC: Number(temperatureC.toFixed(1)),
      pH: Number(pH.toFixed(1)),
      dissolvedOxygenMgL: Number(dissolvedOxygenMgL.toFixed(1)),
      readingSource: 'PROTOTYPE_SIMULATED',
      notes: abnormal
        ? 'Prototype simulator triggered abnormal reading threshold test.'
        : 'Automated prototype sensor telemetry tick.',
    });
  }, [addWaterReading]);

  // Live simulation timer
  useEffect(() => {
    if (!isLiveSimulationActive) return;
    const interval = setInterval(() => {
      // Pick a random pond and push a slightly fluctuating reading
      if (ponds.length === 0) return;
      const randomPond = ponds[Math.floor(Math.random() * ponds.length)];
      simulateSensorPacket(randomPond.id, false);
    }, 12000); // every 12 seconds
    return () => clearInterval(interval);
  }, [isLiveSimulationActive, ponds, simulateSensorPacket]);

  const toggleLiveSimulation = useCallback(() => {
    setIsLiveSimulationActive(prev => !prev);
  }, []);

  // Reset to initial prototype data
  const resetToDefaults = useCallback(() => {
    setPonds(INITIAL_PONDS);
    setWaterReadings(INITIAL_WATER_READINGS);
    setAlerts(INITIAL_ALERTS);
    setFeedingRecords(INITIAL_FEEDING_RECORDS);
    setGrowthRecords(INITIAL_GROWTH_RECORDS);
    setMortalityRecords(INITIAL_MORTALITY_RECORDS);
    setProductionCycles(INITIAL_PRODUCTION_CYCLES);
    setHarvestRecords(INITIAL_HARVEST_RECORDS);
    setExpenses(INITIAL_EXPENSES);
    setActivities(INITIAL_ACTIVITIES);
    setIsLiveSimulationActive(false);
    setUser(INITIAL_USER);
    try {
      localStorage.clear();
    } catch {}
  }, []);

  return (
    <FarmContext.Provider
      value={{
        user,
        login,
        logout,
        ponds,
        waterReadings,
        alerts,
        feedingRecords,
        growthRecords,
        mortalityRecords,
        productionCycles,
        harvestRecords,
        expenses,
        activities,
        isLiveSimulationActive,
        toggleLiveSimulation,
        addPond,
        updatePond,
        addWaterReading,
        resolveAlert,
        addFeedingRecord,
        addGrowthRecord,
        addMortalityRecord,
        advanceCycleStage,
        addHarvestRecord,
        addExpense,
        simulateSensorPacket,
        resetToDefaults,
      }}
    >
      {children}
    </FarmContext.Provider>
  );
};

export const useFarm = (): FarmContextType => {
  const context = useContext(FarmContext);
  if (!context) {
    throw new Error('useFarm must be used within a FarmProvider');
  }
  return context;
};
