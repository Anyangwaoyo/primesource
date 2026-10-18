import React, { useState } from 'react';
import { useFarm } from '../../context/FarmContext';
import { X, Cpu, Copy, Check, Terminal, Play, AlertTriangle, Radio } from 'lucide-react';

interface IotApiModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IotApiModal: React.FC<IotApiModalProps> = ({ isOpen, onClose }) => {
  const { ponds, simulateSensorPacket, isLiveSimulationActive, toggleLiveSimulation } = useFarm();
  const [selectedPondId, setSelectedPondId] = useState(ponds[0]?.id || 'POND-A01');
  const [copied, setCopied] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'tester' | 'specs'>('tester');
  const [lastTransmission, setLastTransmission] = useState<string | null>(null);

  if (!isOpen) return null;

  const curlExample = `curl -X POST https://api.primesource.farm/api/v1/sensors/reading \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer psf_live_iot_982431" \\
  -d '{
    "pondId": "${selectedPondId}",
    "temperatureC": 27.8,
    "pH": 7.2,
    "dissolvedOxygenMgL": 6.5,
    "sensorDeviceId": "ESP32-AQUA-01",
    "batteryLevel": 92,
    "timestamp": "${new Date().toISOString()}"
  }'`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(curlExample);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestTransmission = (abnormal: boolean) => {
    simulateSensorPacket(selectedPondId, abnormal);
    setLastTransmission(
      `${abnormal ? '⚠️ Attention (Low pH)' : '✓ Normal'} telemetry packet dispatched for ${selectedPondId} at ${new Date().toLocaleTimeString()}`
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden border border-[#CBD8CF] my-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4.5 border-b border-[#1E5032] bg-[#143822] text-white shrink-0">
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#7E9F86] flex items-center justify-center text-[#1E5032] shadow-xs shrink-0">
              <Cpu className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <h3 className="font-extrabold text-sm sm:text-base text-white">IoT Sensor Hardware API</h3>
                <span className="px-1.5 py-0.2 text-[9px] sm:text-[10px] font-mono bg-[#1E5032] text-[#A4C4AC] border border-[#7E9F86]/40 rounded">
                  Ingest
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-[#A4C4AC] hidden xs:block sm:block">
                Simulate ESP32 / Arduino sensor telemetry ingestion
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Nav Subtabs */}
        <div className="flex border-b border-[#CBD8CF] bg-[#F4F7F5] px-4 sm:px-6 text-xs font-bold shrink-0">
          <button
            onClick={() => setActiveSubTab('tester')}
            className={`py-3 px-3 sm:px-4 border-b-2 cursor-pointer transition-colors min-h-[44px] ${
              activeSubTab === 'tester'
                ? 'border-[#1E5032] text-[#1E5032]'
                : 'border-transparent text-[#5F8067] hover:text-[#1E5032]'
            }`}
          >
            Interactive Dispatcher
          </button>
          <button
            onClick={() => setActiveSubTab('specs')}
            className={`py-3 px-3 sm:px-4 border-b-2 cursor-pointer transition-colors min-h-[44px] ${
              activeSubTab === 'specs'
                ? 'border-[#1E5032] text-[#1E5032]'
                : 'border-transparent text-[#5F8067] hover:text-[#1E5032]'
            }`}
          >
            HTTP / cURL Spec
          </button>
        </div>

        {/* Modal Content - Scrollable on mobile */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
          {activeSubTab === 'tester' ? (
            <div className="space-y-3 sm:space-y-4">
              <div className="bg-[#EEF3F0] p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-[#CBD8CF] text-xs text-[#1E5032] leading-relaxed">
                <strong className="font-extrabold">Hardware Integration Simulation:</strong> This tool demonstrates how the PrimeSource Farm dashboard reacts in real-time when submersible sensor nodes transmit data packets.
              </div>

              <div>
                <label className="block text-xs font-black text-[#143822] uppercase tracking-wider mb-1.5">
                  Select Destination Pond Node
                </label>
                <select
                  value={selectedPondId}
                  onChange={e => setSelectedPondId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#CBD8CF] rounded-xl text-base sm:text-sm font-bold text-[#143822] focus:ring-2 focus:ring-[#1E5032] min-h-[44px]"
                >
                  {ponds.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.currentFishCount} fish)
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 pt-1">
                <button
                  onClick={() => handleTestTransmission(false)}
                  className="p-3 sm:p-3.5 rounded-xl border border-[#CBD8CF] bg-[#EEF3F0] hover:bg-[#DEE8E1] text-[#1E5032] font-black text-xs flex items-center justify-center space-x-2 transition-colors cursor-pointer min-h-[44px]"
                >
                  <Play className="w-4 h-4 text-[#0EB5B2] shrink-0" />
                  <span>Send Normal Packet</span>
                </button>

                <button
                  onClick={() => handleTestTransmission(true)}
                  className="p-3 sm:p-3.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-950 font-black text-xs flex items-center justify-center space-x-2 transition-colors cursor-pointer min-h-[44px]"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Send Abnormal (pH 5.4)</span>
                </button>
              </div>

              {/* Automatic live simulation toggle */}
              <div className="pt-1">
                <button
                  onClick={toggleLiveSimulation}
                  className={`w-full p-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition-colors cursor-pointer min-h-[44px] ${
                    isLiveSimulationActive
                      ? 'bg-[#1E5032] text-white border-[#1E5032]'
                      : 'bg-white text-[#1E5032] border-[#CBD8CF] hover:bg-[#EEF3F0]'
                  }`}
                >
                  <Radio className={`w-4 h-4 shrink-0 ${isLiveSimulationActive ? 'text-[#0EB5B2] animate-pulse' : 'text-[#7E9F86]'}`} />
                  <span className="truncate">
                    {isLiveSimulationActive ? 'Emitting updates every 10s' : 'Start Automatic Sensor Emulation'}
                  </span>
                </button>
              </div>

              {lastTransmission && (
                <div className="p-3 rounded-xl bg-[#EEF3F0] text-xs font-bold text-[#1E5032] border border-[#CBD8CF]">
                  {lastTransmission}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs font-bold text-[#143822]">
                  <Terminal className="w-4 h-4 text-[#1E5032]" />
                  <span>REST Ingest Payload</span>
                </div>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center space-x-1 text-xs font-bold text-[#1E5032] hover:text-[#143822] cursor-pointer min-h-[44px] px-2"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy cURL'}</span>
                </button>
              </div>

              <pre className="p-3.5 sm:p-4 bg-slate-950 text-[#A4C4AC] rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-mono overflow-x-auto border border-slate-800 leading-relaxed">
                {curlExample}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-[#F4F7F5] border-t border-[#CBD8CF] flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#1E5032] hover:bg-[#143822] text-white text-xs font-black transition-colors cursor-pointer min-h-[44px] flex items-center justify-center"
          >
            Close Window
          </button>
        </div>

      </div>
    </div>
  );
};
