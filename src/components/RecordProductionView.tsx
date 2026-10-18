import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import {
  ClipboardEdit,
  Utensils,
  TrendingUp,
  Skull,
  Droplets,
  DollarSign,
  Package,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { formatDateTime } from '../utils/formatters';

type ActivityOption =
  | 'Feeding'
  | 'Fish Growth'
  | 'Mortality'
  | 'Water Reading'
  | 'Expense'
  | 'Harvest';

export const RecordProductionView: React.FC = () => {
  const {
    ponds,
    addFeedingRecord,
    addGrowthRecord,
    addMortalityRecord,
    addWaterReading,
    addExpense,
    addHarvestRecord,
    activities,
  } = useFarm();

  const [selectedActivity, setSelectedActivity] = useState<ActivityOption>('Feeding');
  const [selectedPondId, setSelectedPondId] = useState<string>(ponds[0]?.id || 'POND-A01');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Feeding fields
  const [feedQuantityKg, setFeedQuantityKg] = useState<string>('12');
  const [feedType, setFeedType] = useState<string>('3mm Floating Extruded Pellets');
  const [feedingTime, setFeedingTime] = useState<string>('08:30 AM');

  // Growth fields
  const [averageWeightGrams, setAverageWeightGrams] = useState<string>('460');
  const [fishSampledCount, setFishSampledCount] = useState<string>('30');

  // Mortality fields
  const [deadFishCount, setDeadFishCount] = useState<string>('2');
  const [observation, setObservation] = useState<string>('Routine mortality check');
  const [actionTaken, setActionTaken] = useState<string>('Disposed safely, verified dissolved oxygen');

  // Water reading fields
  const [temperatureC, setTemperatureC] = useState<string>('28.0');
  const [pH, setPH] = useState<string>('7.2');
  const [dissolvedOxygen, setDissolvedOxygen] = useState<string>('6.5');

  // Expense fields
  const [expenseCategory, setExpenseCategory] = useState<'FEED' | 'FINGERLINGS' | 'WATER_TREATMENT' | 'EQUIPMENT' | 'LABOR' | 'OTHER'>('FEED');
  const [amount, setAmount] = useState<string>('85.00');
  const [expenseDescription, setExpenseDescription] = useState<string>('Feed purchase - 2 bags 3mm');

  // Harvest fields
  const [harvestCount, setHarvestCount] = useState<string>('250');
  const [harvestWeightKg, setHarvestWeightKg] = useState<string>('230');
  const [sellingPricePerKg, setSellingPricePerKg] = useState<string>('3.50');
  const [buyerName, setBuyerName] = useState<string>('Local Fresh Fish Buyer');

  const selectedPond = ponds.find(p => p.id === selectedPondId) || ponds[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPondId) return;

    try {
      if (selectedActivity === 'Feeding') {
        const qty = parseFloat(feedQuantityKg) || 0;
        addFeedingRecord({
          pondId: selectedPondId,
          date,
          feedType,
          quantityKg: qty,
          feedingTime,
          notes: notes || undefined,
        });
        setSuccessMessage(`Logged feeding of ${qty} kg for ${selectedPond.name}.`);
      } else if (selectedActivity === 'Fish Growth') {
        const weight = parseFloat(averageWeightGrams) || 0;
        const sampled = parseInt(fishSampledCount, 10) || 0;
        addGrowthRecord({
          pondId: selectedPondId,
          date,
          averageWeightGrams: weight,
          fishSampledCount: sampled,
          notes: notes || undefined,
        });
        setSuccessMessage(`Logged growth sampling (avg: ${weight}g) for ${selectedPond.name}.`);
      } else if (selectedActivity === 'Mortality') {
        const count = parseInt(deadFishCount, 10) || 0;
        addMortalityRecord({
          pondId: selectedPondId,
          date,
          deadFishCount: count,
          possibleObservation: observation || 'Routine loss',
          actionTaken: actionTaken || 'Logged',
        });
        setSuccessMessage(`Recorded ${count} mortalities for ${selectedPond.name}.`);
      } else if (selectedActivity === 'Water Reading') {
        const temp = parseFloat(temperatureC) || 28.0;
        const phVal = parseFloat(pH) || 7.0;
        const doVal = parseFloat(dissolvedOxygen) || 6.5;
        addWaterReading({
          pondId: selectedPondId,
          temperatureC: temp,
          pH: phVal,
          dissolvedOxygenMgL: doVal,
          readingSource: 'MANUAL_TESTING',
          notes: notes || undefined,
        });
        setSuccessMessage(`Logged water quality reading (pH: ${phVal}, Temp: ${temp}°C) for ${selectedPond.name}.`);
      } else if (selectedActivity === 'Expense') {
        const amt = parseFloat(amount) || 0;
        addExpense({
          pondId: selectedPondId,
          category: expenseCategory,
          amount: amt,
          date,
          description: expenseDescription,
        });
        setSuccessMessage(`Logged expense of $${amt.toFixed(2)} for ${selectedPond.name}.`);
      } else if (selectedActivity === 'Harvest') {
        const count = parseInt(harvestCount, 10) || 0;
        const weight = parseFloat(harvestWeightKg) || 0;
        const price = parseFloat(sellingPricePerKg) || 0;
        addHarvestRecord({
          pondId: selectedPondId,
          cycleId: 'cyc-active',
          harvestDate: date,
          fishHarvestedCount: count,
          totalWeightKg: weight,
          sellingPricePerKg: price,
          buyerCustomer: buyerName,
          notes: notes || undefined,
        });
        setSuccessMessage(`Recorded harvest of ${weight} kg (${count} fish) from ${selectedPond.name}.`);
      }

      // Clear note
      setNotes('');

      // Auto-hide success message
      setTimeout(() => {
        setSuccessMessage(null);
      }, 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const activityTypes: { id: ActivityOption; label: string; icon: React.ReactNode }[] = [
    { id: 'Feeding', label: 'Feeding', icon: <Utensils className="w-4 h-4" /> },
    { id: 'Fish Growth', label: 'Growth', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'Mortality', label: 'Mortality', icon: <Skull className="w-4 h-4" /> },
    { id: 'Water Reading', label: 'Water Test', icon: <Droplets className="w-4 h-4" /> },
    { id: 'Expense', label: 'Expense', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'Harvest', label: 'Harvest', icon: <Package className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#143822] tracking-tight">
          Record Production
        </h1>
        <p className="text-xs sm:text-sm text-[#496350] font-medium mt-1">
          Single unified entry form for recording daily feeding, sampling, losses, water tests, and sales.
        </p>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="bg-[#EEF3F0] border-2 border-[#7E9F86] text-[#1E5032] p-4 rounded-2xl flex items-center space-x-3 text-xs sm:text-sm font-bold shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-[#1E5032] shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Grid: Form Column + Recent Activities Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        
        {/* LEFT COLUMN: THE SINGLE PRODUCTION FORM */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl sm:rounded-3xl bg-white border border-[#CBD8CF] p-4 sm:p-7 lg:p-8 shadow-xs">
            <h2 className="text-base sm:text-lg font-black text-[#143822] mb-4 sm:mb-5 flex items-center space-x-2">
              <ClipboardEdit className="w-5 h-5 text-[#1E5032] shrink-0" />
              <span>Production Entry Form</span>
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              
              {/* 1. Activity Type Selector - Touch Friendly */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-[#334638] mb-2">
                  Activity Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5">
                  {activityTypes.map(item => {
                    const isSelected = selectedActivity === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        id={`btn-select-activity-${item.id.toLowerCase().replace(' ', '-')}`}
                        onClick={() => setSelectedActivity(item.id)}
                        className={`flex items-center space-x-2 px-3 py-2.5 sm:py-3 rounded-xl text-xs font-bold border text-left transition-all cursor-pointer min-h-[44px] ${
                          isSelected
                            ? 'bg-[#1E5032] border-[#1E5032] text-white shadow-xs'
                            : 'bg-[#EEF3F0]/80 border-[#CBD8CF] text-[#2D4535] hover:bg-[#DEE8E1]'
                        }`}
                      >
                        <span className={isSelected ? 'text-[#0EB5B2] shrink-0' : 'text-[#5F8067] shrink-0'}>
                          {item.icon}
                        </span>
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Target Pond and Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#334638] mb-1.5">
                    Target Pond
                  </label>
                  <select
                    id="select-production-pond"
                    value={selectedPondId}
                    onChange={e => setSelectedPondId(e.target.value)}
                    className="w-full px-3.5 py-3 sm:py-2.5 bg-white border border-[#CBD8CF] rounded-xl text-base sm:text-sm font-bold text-[#143822] focus:outline-none focus:ring-2 focus:ring-[#1E5032] min-h-[44px]"
                  >
                    {ponds.map(pond => (
                      <option key={pond.id} value={pond.id}>
                        {pond.name} ({pond.currentFishCount.toLocaleString()} fish)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#334638] mb-1.5">
                    Date
                  </label>
                  <input
                    type="date"
                    id="input-production-date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full px-3.5 py-3 sm:py-2.5 bg-white border border-[#CBD8CF] rounded-xl text-base sm:text-sm font-semibold text-[#143822] focus:outline-none focus:ring-2 focus:ring-[#1E5032] min-h-[44px]"
                  />
                </div>
              </div>

              {/* 3. DYNAMIC FIELDS RELEVANT TO CHOSEN ACTIVITY */}

              {/* A. Feeding */}
              {selectedActivity === 'Feeding' && (
                <div className="p-3.5 sm:p-5 rounded-2xl bg-[#EEF3F0]/60 border border-[#CBD8CF] space-y-3 sm:space-y-4">
                  <div className="text-xs font-black text-[#1E5032] uppercase tracking-wide flex items-center space-x-1.5">
                    <Utensils className="w-3.5 h-3.5 text-[#0EB5B2] shrink-0" />
                    <span>Feeding Details</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#334638] mb-1">
                        Feed Quantity (kg) *
                      </label>
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.5"
                        min="0.1"
                        required
                        id="input-feed-quantity"
                        value={feedQuantityKg}
                        onChange={e => setFeedQuantityKg(e.target.value)}
                        placeholder="e.g. 12"
                        className="w-full px-3.5 py-2.5 sm:py-2 bg-white border border-[#CBD8CF] rounded-xl text-base sm:text-sm font-black text-[#143822] focus:ring-2 focus:ring-[#1E5032] min-h-[44px]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#334638] mb-1">
                        Feeding Time
                      </label>
                      <input
                        type="text"
                        id="input-feeding-time"
                        value={feedingTime}
                        onChange={e => setFeedingTime(e.target.value)}
                        placeholder="e.g. 08:30 AM"
                        className="w-full px-3.5 py-2.5 sm:py-2 bg-white border border-[#CBD8CF] rounded-xl text-base sm:text-sm text-[#143822] focus:ring-2 focus:ring-[#1E5032] min-h-[44px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#334638] mb-1">
                      Feed Brand / Pellet Size
                    </label>
                    <input
                      type="text"
                      id="input-feed-type"
                      value={feedType}
                      onChange={e => setFeedType(e.target.value)}
                      placeholder="e.g. 3mm Floating Extruded Pellets"
                      className="w-full px-3.5 py-2.5 sm:py-2 bg-white border border-[#CBD8CF] rounded-xl text-base sm:text-sm text-[#143822] focus:ring-2 focus:ring-[#1E5032] min-h-[44px]"
                    />
                  </div>
                </div>
              )}

              {/* B. Fish Growth */}
              {selectedActivity === 'Fish Growth' && (
                <div className="p-3.5 sm:p-5 rounded-2xl bg-[#EEF3F0]/60 border border-[#CBD8CF] space-y-3 sm:space-y-4">
                  <div className="text-xs font-black text-[#1E5032] uppercase tracking-wide flex items-center space-x-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-[#0EB5B2] shrink-0" />
                    <span>Growth Biometrics Sampling</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#334638] mb-1">
                        Average Weight (grams) *
                      </label>
                      <input
                        type="number"
                        inputMode="decimal"
                        step="1"
                        min="1"
                        required
                        id="input-average-weight"
                        value={averageWeightGrams}
                        onChange={e => setAverageWeightGrams(e.target.value)}
                        placeholder="e.g. 450"
                        className="w-full px-3.5 py-2.5 sm:py-2 bg-white border border-[#CBD8CF] rounded-xl text-base sm:text-sm font-black text-[#143822] focus:ring-2 focus:ring-[#1E5032] min-h-[44px]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#334638] mb-1">
                        Fish Sampled Count *
                      </label>
                      <input
                        type="number"
                        inputMode="numeric"
                        step="1"
                        min="5"
                        required
                        id="input-sampled-count"
                        value={fishSampledCount}
                        onChange={e => setFishSampledCount(e.target.value)}
                        placeholder="e.g. 30"
                        className="w-full px-3.5 py-2.5 sm:py-2 bg-white border border-[#CBD8CF] rounded-xl text-base sm:text-sm text-[#143822] focus:ring-2 focus:ring-[#1E5032] min-h-[44px]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* C. Mortality */}
              {selectedActivity === 'Mortality' && (
                <div className="p-3.5 sm:p-5 rounded-2xl bg-[#EEF3F0]/60 border border-[#CBD8CF] space-y-3 sm:space-y-4">
                  <div className="text-xs font-black text-rose-800 uppercase tracking-wide flex items-center space-x-1.5">
                    <Skull className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>Mortality Count & Observation</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#334638] mb-1">
                        Dead Fish Count *
                      </label>
                      <input
                        type="number"
                        inputMode="numeric"
                        step="1"
                        min="1"
                        required
                        id="input-dead-fish-count"
                        value={deadFishCount}
                        onChange={e => setDeadFishCount(e.target.value)}
                        placeholder="e.g. 2"
                        className="w-full px-3.5 py-2.5 sm:py-2 bg-white border border-[#CBD8CF] rounded-xl text-base sm:text-sm font-black text-[#143822] focus:ring-2 focus:ring-[#1E5032] min-h-[44px]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#334638] mb-1">
                        Observation / Suspected Cause
                      </label>
                      <input
                        type="text"
                        id="input-mortality-observation"
                        value={observation}
                        onChange={e => setObservation(e.target.value)}
                        placeholder="e.g. Stress, low pH"
                        className="w-full px-3.5 py-2.5 sm:py-2 bg-white border border-[#CBD8CF] rounded-xl text-base sm:text-sm text-[#143822] focus:ring-2 focus:ring-[#1E5032] min-h-[44px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#334638] mb-1">
                      Action Taken
                    </label>
                    <input
                      type="text"
                      id="input-mortality-action"
                      value={actionTaken}
                      onChange={e => setActionTaken(e.target.value)}
                      placeholder="e.g. Removed, checked oxygen"
                      className="w-full px-3.5 py-2.5 sm:py-2 bg-white border border-[#CBD8CF] rounded-xl text-base sm:text-sm text-[#143822] focus:ring-2 focus:ring-[#1E5032] min-h-[44px]"
                    />
                  </div>
                </div>
              )}

              {/* D. Water Reading */}
              {selectedActivity === 'Water Reading' && (
                <div className="p-3.5 sm:p-5 rounded-2xl bg-[#EEF3F0]/60 border border-[#CBD8CF] space-y-3 sm:space-y-4">
                  <div className="text-xs font-black text-[#088C8A] uppercase tracking-wide flex items-center space-x-1.5">
                    <Droplets className="w-3.5 h-3.5 text-[#0EB5B2] shrink-0" />
                    <span>Water Parameter Test Values</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#334638] mb-1">
                        Temp (°C) *
                      </label>
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.1"
                        required
                        id="input-water-temp"
                        value={temperatureC}
                        onChange={e => setTemperatureC(e.target.value)}
                        placeholder="28.0"
                        className="w-full px-3.5 py-2.5 sm:py-2 bg-white border border-[#CBD8CF] rounded-xl text-base sm:text-sm font-black text-[#143822] focus:ring-2 focus:ring-[#1E5032] min-h-[44px]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#334638] mb-1">
                        pH Level *
                      </label>
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.1"
                        required
                        id="input-water-ph"
                        value={pH}
                        onChange={e => setPH(e.target.value)}
                        placeholder="7.2"
                        className="w-full px-3.5 py-2.5 sm:py-2 bg-white border border-[#CBD8CF] rounded-xl text-base sm:text-sm font-black text-[#143822] focus:ring-2 focus:ring-[#1E5032] min-h-[44px]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#334638] mb-1">
                        Dissolved O₂ *
                      </label>
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.1"
                        required
                        id="input-water-do"
                        value={dissolvedOxygen}
                        onChange={e => setDissolvedOxygen(e.target.value)}
                        placeholder="6.5"
                        className="w-full px-3.5 py-2.5 sm:py-2 bg-white border border-[#CBD8CF] rounded-xl text-base sm:text-sm font-black text-[#143822] focus:ring-2 focus:ring-[#1E5032] min-h-[44px]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* E. Expense */}
              {selectedActivity === 'Expense' && (
                <div className="p-3.5 sm:p-5 rounded-2xl bg-[#EEF3F0]/60 border border-[#CBD8CF] space-y-3 sm:space-y-4">
                  <div className="text-xs font-black text-amber-900 uppercase tracking-wide flex items-center space-x-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span>Expense Entry</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#334638] mb-1">
                        Category
                      </label>
                      <select
                        id="select-expense-category"
                        value={expenseCategory}
                        onChange={e => setExpenseCategory(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 sm:py-2 bg-white border border-[#CBD8CF] rounded-xl text-base sm:text-sm font-semibold text-[#143822] min-h-[44px]"
                      >
                        <option value="FEED">Feed Pellets</option>
                        <option value="FINGERLINGS">Fingerling Seed Stock</option>
                        <option value="WATER_TREATMENT">Water Treatment / Lime</option>
                        <option value="EQUIPMENT">Equipment & Aeration</option>
                        <option value="LABOR">Farm Labor</option>
                        <option value="OTHER">Other Operational</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#334638] mb-1">
                        Amount ($) *
                      </label>
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        min="0.01"
                        required
                        id="input-expense-amount"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        placeholder="85.00"
                        className="w-full px-3.5 py-2.5 sm:py-2 bg-white border border-[#CBD8CF] rounded-xl text-base sm:text-sm font-black text-[#143822] focus:ring-2 focus:ring-[#1E5032] min-h-[44px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#334638] mb-1">
                      Expense Description *
                    </label>
                    <input
                      type="text"
                      required
                      id="input-expense-description"
                      value={expenseDescription}
                      onChange={e => setExpenseDescription(e.target.value)}
                      placeholder="e.g. 50kg bag Limestone for Pond A02"
                      className="w-full px-3.5 py-2.5 sm:py-2 bg-white border border-[#CBD8CF] rounded-xl text-base sm:text-sm text-[#143822] focus:ring-2 focus:ring-[#1E5032] min-h-[44px]"
                    />
                  </div>
                </div>
              )}

              {/* F. Harvest */}
              {selectedActivity === 'Harvest' && (
                <div className="p-3.5 sm:p-5 rounded-2xl bg-[#EEF3F0]/60 border border-[#CBD8CF] space-y-3 sm:space-y-4">
                  <div className="text-xs font-black text-purple-900 uppercase tracking-wide flex items-center space-x-1.5">
                    <Package className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                    <span>Harvest Off-Take Details</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#334638] mb-1">
                        Fish Count *
                      </label>
                      <input
                        type="number"
                        inputMode="numeric"
                        required
                        id="input-harvest-count"
                        value={harvestCount}
                        onChange={e => setHarvestCount(e.target.value)}
                        placeholder="250"
                        className="w-full px-3.5 py-2.5 sm:py-2 bg-white border border-[#CBD8CF] rounded-xl text-base sm:text-sm font-black text-[#143822] min-h-[44px]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#334638] mb-1">
                        Weight (kg) *
                      </label>
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.5"
                        required
                        id="input-harvest-weight"
                        value={harvestWeightKg}
                        onChange={e => setHarvestWeightKg(e.target.value)}
                        placeholder="230"
                        className="w-full px-3.5 py-2.5 sm:py-2 bg-white border border-[#CBD8CF] rounded-xl text-base sm:text-sm font-black text-[#143822] min-h-[44px]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#334638] mb-1">
                        Price/kg ($) *
                      </label>
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.1"
                        required
                        id="input-harvest-price"
                        value={sellingPricePerKg}
                        onChange={e => setSellingPricePerKg(e.target.value)}
                        placeholder="3.50"
                        className="w-full px-3.5 py-2.5 sm:py-2 bg-white border border-[#CBD8CF] rounded-xl text-base sm:text-sm font-black text-[#143822] min-h-[44px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#334638] mb-1">
                      Buyer / Customer
                    </label>
                    <input
                      type="text"
                      id="input-harvest-buyer"
                      value={buyerName}
                      onChange={e => setBuyerName(e.target.value)}
                      placeholder="e.g. Local Fish Distributor"
                      className="w-full px-3.5 py-2.5 sm:py-2 bg-white border border-[#CBD8CF] rounded-xl text-base sm:text-sm text-[#143822] min-h-[44px]"
                    />
                  </div>
                </div>
              )}

              {/* 4. Notes (Optional for all activities) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#334638] mb-1.5">
                  Notes (Optional)
                </label>
                <textarea
                  id="textarea-production-notes"
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Any operational observations or special notes..."
                  className="w-full px-3.5 py-2.5 bg-white border border-[#CBD8CF] rounded-xl text-base sm:text-sm text-[#143822] focus:outline-none focus:ring-2 focus:ring-[#1E5032]"
                />
              </div>

              {/* 5. Submit Button - Full Touch Target */}
              <button
                type="submit"
                id="btn-save-production-record"
                className="w-full py-3.5 sm:py-4 px-4 rounded-xl bg-[#1E5032] hover:bg-[#143822] text-white font-black text-sm sm:text-base shadow-sm hover:shadow transition-all cursor-pointer flex items-center justify-center space-x-2 min-h-[48px]"
              >
                <span>Save {selectedActivity} Record</span>
              </button>

            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: RECENT FARM ACTIVITIES LIST */}
        <div className="lg:col-span-5">
          <div className="rounded-2xl sm:rounded-3xl bg-white border border-[#CBD8CF] p-4 sm:p-6 lg:p-7 shadow-xs flex flex-col h-full">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-base sm:text-lg font-black text-[#143822] flex items-center space-x-2">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-[#5F8067] shrink-0" />
                <span>Recent Activities</span>
              </h2>
              <span className="text-[11px] sm:text-xs font-bold text-[#1E5032] bg-[#EEF3F0] px-2.5 py-0.5 rounded-full border border-[#CBD8CF]">
                {activities.length} total
              </span>
            </div>

            <p className="text-xs text-[#5F8067] font-medium mb-3 sm:mb-4">
              Real-time activity log tracking feed, mortality, sampling, water tests and interventions.
            </p>

            <div className="flex-1 overflow-y-auto max-h-[500px] sm:max-h-[560px] divide-y divide-[#EEF3F0] pr-1">
              {activities.map(act => {
                const pond = ponds.find(p => p.id === act.pondId);
                return (
                  <div key={act.id} className="py-3 sm:py-3.5 first:pt-0 last:pb-0">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 sm:gap-2">
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-xs font-bold text-[#143822]">{act.title}</span>
                          <span className="text-[10px] font-bold bg-[#EEF3F0] text-[#1E5032] px-1.5 py-0.2 rounded border border-[#CBD8CF]">
                            {pond ? pond.name : act.pondId}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 leading-normal font-medium">
                          {act.description}
                        </p>
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium sm:text-right shrink-0">
                        {formatDateTime(act.timestamp)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
