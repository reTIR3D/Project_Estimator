import React, { useState } from 'react';
import type { ComplexityFactors } from '../types';

interface Props {
  factors: ComplexityFactors;
  onChange: (factors: ComplexityFactors) => void;
  selectedDisciplines?: string[];
}


interface ComplexityFactorConfig {
  label: string;
  impact: number;
  icon: string;
}

const DEFAULT_COMPLEXITY_FACTORS: Record<string, ComplexityFactorConfig> = {
  multidiscipline: { label: 'Multi-discipline', impact: 20, icon: '🔄' },
  fasttrack: { label: 'Fast-track', impact: 30, icon: '⚡' },
  brownfield: { label: 'Brownfield', impact: 25, icon: '🏭' },
  regulatory: { label: 'Heavy Regulatory', impact: 15, icon: '⚖️' },
  incomplete_requirements: { label: 'Incomplete Requirements', impact: 35, icon: '❓' },
};

export default function ComplexityFactors({ factors, onChange, selectedDisciplines = [] }: Props) {
  const [impactValues, setImpactValues] = useState<Record<string, number>>(
    Object.fromEntries(
      Object.entries(DEFAULT_COMPLEXITY_FACTORS).map(([key, config]) => [key, config.impact])
    )
  );

  const handleToggle = (key: keyof ComplexityFactors) => {
    onChange({
      ...factors,
      [key]: !factors[key],
    });
  };

  const handleImpactChange = (key: string, value: number) => {
    setImpactValues(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Filter factors - only show multidiscipline if more than one discipline selected
  const availableFactors = Object.entries(DEFAULT_COMPLEXITY_FACTORS).filter(([key]) => {
    if (key === 'multidiscipline') {
      // Only show if 2 or more disciplines are selected
      console.log('ComplexityFactors - selectedDisciplines:', selectedDisciplines, 'length:', selectedDisciplines.length);
      return selectedDisciplines.length > 1;
    }
    return true;
  });

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">Complexity Factors</h3>
      <div className="space-y-1">
        {availableFactors.map(([key, config]) => {
          const isActive = factors[key as keyof ComplexityFactors];
          return (
            <div key={key}>
              <button
                onClick={() => handleToggle(key as keyof ComplexityFactors)}
                className={`w-full p-1.5 rounded-lg border-2 cursor-pointer transition-all ${
                  isActive
                    ? 'border-orange-500 bg-orange-500 text-white shadow-md'
                    : 'border-gray-200 bg-white hover:border-orange-300 hover:shadow'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{config.icon}</span>
                    <span className={`text-xs font-medium ${
                      isActive ? 'text-white' : 'text-gray-900'
                    }`}>
                      {config.label}
                    </span>
                  </div>
                  {isActive && (
                    <span className="text-xs font-bold">+{impactValues[key]}%</span>
                  )}
                </div>

                {isActive && (
                  <div className="mt-2 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={impactValues[key]}
                      onChange={(e) => handleImpactChange(key, Number(e.target.value))}
                      className="flex-1"
                    />
                    <input
                      type="number"
                      value={impactValues[key]}
                      onChange={(e) => handleImpactChange(key, Number(e.target.value))}
                      className="w-14 px-2 py-1 text-xs font-bold text-orange-600 bg-white border border-gray-300 rounded focus:border-orange-500 focus:outline-none"
                      min="0"
                      max="100"
                    />
                    <span className="text-xs font-bold">%</span>
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}