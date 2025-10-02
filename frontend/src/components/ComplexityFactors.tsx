import React, { useState } from 'react';
import type { ComplexityFactors } from '../types';

interface Props {
  factors: ComplexityFactors;
  onChange: (factors: ComplexityFactors) => void;
}

interface ComplexityFactorConfig {
  label: string;
  impact: number;
}

const DEFAULT_COMPLEXITY_FACTORS: Record<string, ComplexityFactorConfig> = {
  multidiscipline: { label: 'Multi-discipline', impact: 20 },
  fasttrack: { label: 'Fast-track', impact: 30 },
  brownfield: { label: 'Brownfield', impact: 25 },
  regulatory: { label: 'Heavy Regulatory', impact: 15 },
  incomplete_requirements: { label: 'Incomplete Requirements', impact: 35 },
};

export default function ComplexityFactors({ factors, onChange }: Props) {
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

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">Complexity Factors</h3>
      <div className="space-y-1">
        {Object.entries(DEFAULT_COMPLEXITY_FACTORS).map(([key, config]) => (
          <div
            key={key}
            className={`flex items-center p-1.5 border rounded-lg transition-colors ${
              factors[key as keyof ComplexityFactors]
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <label className="flex items-center flex-1 cursor-pointer">
              <input
                type="checkbox"
                checked={factors[key as keyof ComplexityFactors] || false}
                onChange={() => handleToggle(key as keyof ComplexityFactors)}
                className="h-3.5 w-3.5 text-blue-600"
              />
              <span className="ml-2 text-xs font-medium">{config.label}</span>
            </label>
            <div className="flex items-center gap-1">
              <span className="text-red-600 font-bold text-xs">+</span>
              <input
                type="number"
                value={impactValues[key]}
                onChange={(e) => handleImpactChange(key, Number(e.target.value))}
                className="w-12 px-1 py-0.5 text-xs font-bold text-red-600 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                min="0"
                max="100"
              />
              <span className="text-red-600 font-bold text-xs">%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}