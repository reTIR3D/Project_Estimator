import React, { useState } from 'react';
import type { EstimationResponse, CostCalculationResponse } from '../types';

interface Props {
  estimation: EstimationResponse | null;
  loading?: boolean;
  selectedDisciplines?: string[];
  costData?: CostCalculationResponse | null;
}

export default function EstimationSummary({ estimation, loading, selectedDisciplines = [], costData = null }: Props) {
  const [showConfidenceDetails, setShowConfidenceDetails] = useState(false);
  const [showBaseHoursBreakdown, setShowBaseHoursBreakdown] = useState(false);
  const [showTotalHoursBreakdown, setShowTotalHoursBreakdown] = useState(false);
  const [showCostBreakdown, setShowCostBreakdown] = useState(false);

  // Calculate discipline breakdown (simple distribution for now)
  const getDisciplineBreakdown = (totalHours: number) => {
    if (selectedDisciplines.length === 0) return [];

    // Simple equal distribution - can be enhanced later with actual discipline weights
    const hoursPerDiscipline = totalHours / selectedDisciplines.length;

    return selectedDisciplines.map(discipline => ({
      discipline,
      hours: Math.round(hoursPerDiscipline),
      percentage: (100 / selectedDisciplines.length).toFixed(1)
    }));
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!estimation) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center text-gray-500">
        <p>Configure project parameters to see estimation</p>
      </div>
    );
  }

  const getConfidenceBadge = (level: string) => {
    const colors = {
      VERY_HIGH: 'bg-green-100 text-green-800',
      very_high: 'bg-green-100 text-green-800',
      HIGH: 'bg-blue-100 text-blue-800',
      high: 'bg-blue-100 text-blue-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      medium: 'bg-yellow-100 text-yellow-800',
      LOW: 'bg-red-100 text-red-800',
      low: 'bg-red-100 text-red-800',
    };
    return colors[level as keyof typeof colors] || colors.MEDIUM;
  };

  const getConfidenceExplanation = (level: string, score: number) => {
    const explanations = {
      VERY_HIGH: 'Very high confidence - This estimate is based on complete information with minimal complexity factors.',
      very_high: 'Very high confidence - This estimate is based on complete information with minimal complexity factors.',
      HIGH: 'High confidence - This estimate has good supporting information with some known complexity factors.',
      high: 'High confidence - This estimate has good supporting information with some known complexity factors.',
      MEDIUM: 'Medium confidence - This estimate has moderate uncertainty due to complexity factors or limited information.',
      medium: 'Medium confidence - This estimate has moderate uncertainty due to complexity factors or limited information.',
      LOW: 'Low confidence - This estimate has significant uncertainty. Consider gathering more information or adding contingency.',
      low: 'Low confidence - This estimate has significant uncertainty. Consider gathering more information or adding contingency.',
    };
    return explanations[level as keyof typeof explanations] || explanations.MEDIUM;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Estimation Summary</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {/* Total Hours */}
        <div
          className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setShowTotalHoursBreakdown(!showTotalHoursBreakdown)}
        >
          <div className="text-4xl font-bold text-blue-900">
            {estimation.total_hours.toLocaleString()}
          </div>
          <div className="text-sm text-blue-700 mt-2">Total Hours</div>
          <div className="text-xs text-blue-600 mt-1">
            Click for breakdown ℹ️
          </div>
        </div>

        {/* Duration */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
          <div className="text-4xl font-bold text-purple-900">
            {estimation.duration_weeks}
          </div>
          <div className="text-sm text-purple-700 mt-2">Weeks</div>
        </div>

        {/* Base Hours */}
        <div
          className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-lg cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setShowBaseHoursBreakdown(!showBaseHoursBreakdown)}
        >
          <div className="text-4xl font-bold text-gray-900">
            {estimation.base_hours.toLocaleString()}
          </div>
          <div className="text-sm text-gray-700 mt-2">Base Hours</div>
          <div className="text-xs text-blue-600 mt-1">
            Click for breakdown ℹ️
          </div>
        </div>

        {/* Confidence */}
        <div
          className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setShowConfidenceDetails(!showConfidenceDetails)}
        >
          <div className="text-3xl font-bold text-green-900">
            {Math.round(estimation.confidence_score)}%
          </div>
          <div className="text-sm text-green-700 mt-2">
            <span
              className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getConfidenceBadge(
                estimation.confidence_level
              )}`}
            >
              {estimation.confidence_level.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <div className="text-xs text-gray-600 mt-2 font-medium">
            Estimate Confidence
          </div>
          <div className="text-xs text-blue-600 mt-1">
            Click for details ℹ️
          </div>
        </div>
      </div>

      {/* Total Hours Breakdown */}
      {showTotalHoursBreakdown && (
        <div className="border-2 border-blue-500 rounded-lg p-6 bg-blue-50">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-bold text-gray-900">Total Hours by Discipline</h3>
            <button
              onClick={() => setShowTotalHoursBreakdown(false)}
              className="text-gray-500 hover:text-gray-700 font-bold text-xl"
            >
              ✕
            </button>
          </div>

          {selectedDisciplines.length > 0 ? (
            <>
              <div className="bg-white p-4 rounded-lg">
                <div className="space-y-3">
                  {getDisciplineBreakdown(estimation.total_hours).map((item) => (
                    <div key={item.discipline} className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900">{item.discipline}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600">{item.percentage}%</span>
                        <span className="font-mono font-bold text-gray-900">{item.hours.toLocaleString()} hrs</span>
                      </div>
                    </div>
                  ))}
                  <div className="border-t-2 border-blue-500 pt-2 mt-2 flex justify-between items-center">
                    <span className="font-semibold text-gray-900">Total Hours (All Disciplines)</span>
                    <span className="font-mono font-bold text-lg text-blue-900">{estimation.total_hours.toLocaleString()} hrs</span>
                  </div>
                </div>
              </div>

              <p className="mt-3 text-xs text-gray-600">
                💡 This is a simple equal distribution across selected disciplines. Adjust individual discipline allocations as needed for your project.
              </p>
            </>
          ) : (
            <div className="bg-white p-4 rounded-lg text-center">
              <p className="text-gray-600">No disciplines selected. Please select disciplines to see the breakdown.</p>
            </div>
          )}
        </div>
      )}

      {/* Base Hours Breakdown */}
      {showBaseHoursBreakdown && (
        <div className="border-2 border-gray-500 rounded-lg p-6 bg-gray-50">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-bold text-gray-900">Base Hours by Discipline</h3>
            <button
              onClick={() => setShowBaseHoursBreakdown(false)}
              className="text-gray-500 hover:text-gray-700 font-bold text-xl"
            >
              ✕
            </button>
          </div>

          {selectedDisciplines.length > 0 ? (
            <>
              <div className="bg-white p-4 rounded-lg">
                <div className="space-y-3">
                  {getDisciplineBreakdown(estimation.base_hours).map((item) => (
                    <div key={item.discipline} className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900">{item.discipline}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600">{item.percentage}%</span>
                        <span className="font-mono font-bold text-gray-900">{item.hours.toLocaleString()} hrs</span>
                      </div>
                    </div>
                  ))}
                  <div className="border-t-2 border-gray-300 pt-2 mt-2 flex justify-between items-center">
                    <span className="font-semibold text-gray-900">Total Base Hours</span>
                    <span className="font-mono font-bold text-lg text-gray-900">{estimation.base_hours.toLocaleString()} hrs</span>
                  </div>
                </div>
              </div>

              <p className="mt-3 text-xs text-gray-600">
                💡 This is a simple equal distribution across selected disciplines. Adjust individual discipline allocations as needed for your project.
              </p>
            </>
          ) : (
            <div className="bg-white p-4 rounded-lg text-center">
              <p className="text-gray-600">No disciplines selected. Please select disciplines to see the breakdown.</p>
            </div>
          )}
        </div>
      )}

      {/* Confidence Details Modal */}
      {showConfidenceDetails && (
        <div className="border-2 border-blue-500 rounded-lg p-6 bg-blue-50">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-bold text-gray-900">Confidence Level Explanation</h3>
            <button
              onClick={() => setShowConfidenceDetails(false)}
              className="text-gray-500 hover:text-gray-700 font-bold text-xl"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <span
                  className={`px-3 py-1 rounded text-sm font-semibold ${getConfidenceBadge(
                    estimation.confidence_level
                  )}`}
                >
                  {estimation.confidence_level.replace('_', ' ').toUpperCase()}
                </span>
                <span className="text-2xl font-bold text-gray-900">
                  {Math.round(estimation.confidence_score)}%
                </span>
              </div>
              <p className="text-sm text-gray-700">
                {getConfidenceExplanation(estimation.confidence_level, estimation.confidence_score)}
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Confidence Ranges:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-800">LOW</span>
                  <span className="text-gray-700">50-70% - High uncertainty, add extra contingency</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-800">MEDIUM</span>
                  <span className="text-gray-700">70-85% - Moderate uncertainty</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800">HIGH</span>
                  <span className="text-gray-700">85-95% - Good estimate reliability</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800">VERY HIGH</span>
                  <span className="text-gray-700">&gt;95% - Excellent estimate reliability</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Factors Affecting Confidence:</h4>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                <li>Complexity factors selected (more factors = lower confidence)</li>
                <li>Incomplete requirements significantly reduce confidence</li>
                <li>Project size and scope clarity</li>
                <li>Client profile and historical data</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Calculation Breakdown */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Calculation Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Hours Breakdown */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Hours</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Base Hours</span>
                <span className="font-mono font-semibold">{estimation.base_hours.toLocaleString()} hrs</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Complexity Multiplier</span>
                <span className="font-mono font-semibold">{estimation.complexity_multiplier.toFixed(2)}x</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Client Factor</span>
                <span className="font-mono font-semibold">{estimation.client_multiplier.toFixed(2)}x</span>
              </div>
              <div className="flex justify-between items-center border-t pt-2">
                <span className="text-gray-600">Adjusted Hours</span>
                <span className="font-mono font-semibold">{estimation.adjusted_hours.toLocaleString()} hrs</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Contingency</span>
                <span className="font-mono font-semibold">+{estimation.contingency_hours.toLocaleString()} hrs</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Overhead</span>
                <span className="font-mono font-semibold">+{estimation.overhead_hours?.toLocaleString() || 0} hrs</span>
              </div>
              <div className="flex justify-between items-center border-t-2 border-blue-500 pt-2">
                <span className="text-gray-900 font-semibold">Total Hours</span>
                <span className="font-mono font-bold text-blue-600 text-lg">
                  {estimation.total_hours.toLocaleString()} hrs
                </span>
              </div>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-700">Costs</h4>
              {costData && (
                <button
                  onClick={() => setShowCostBreakdown(!showCostBreakdown)}
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  {showCostBreakdown ? 'Hide' : 'Show'} by Role
                </button>
              )}
            </div>
            {costData ? (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Hours</span>
                  <span className="font-mono font-semibold">{costData.summary.total_hours.toLocaleString()} hrs</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Average Rate</span>
                  <span className="font-mono font-semibold">${Math.round(costData.summary.average_cost_per_hour)}/hr</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Deliverables</span>
                  <span className="font-mono font-semibold">{costData.summary.deliverable_count}</span>
                </div>
                <div className="flex justify-between items-center border-t-2 border-green-500 pt-2">
                  <span className="text-gray-900 font-semibold">Total Cost</span>
                  <span className="font-mono font-bold text-green-600 text-lg">
                    ${costData.summary.total_cost.toLocaleString()}
                  </span>
                </div>

                {/* Cost by Role Breakdown */}
                {showCostBreakdown && costData.by_role && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h5 className="text-xs font-semibold text-gray-700 mb-2">Cost by Role</h5>
                    <div className="space-y-2">
                      {costData.by_role.map((role) => (
                        <div key={role.role} className="flex justify-between items-center text-xs">
                          <span className="text-gray-600">{role.role}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">{role.hours} hrs</span>
                            <span className="font-mono font-semibold text-gray-900">
                              ${role.cost.toLocaleString()}
                            </span>
                            <span className="text-gray-500">({role.percentage.toFixed(1)}%)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Note about rate configuration */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 italic">
                    💡 Note: Costs calculated using default rates. Configure custom rate sheets in Client Configuration (coming soon).
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500 italic">
                Add deliverables to see cost calculations
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}