import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface ResourceRequirement {
  discipline: string;
  week: number;
  hours: number;
  fte: number;
  conflicts: string[];
}

interface TeamRecommendation {
  role: string;
  count: number;
  utilization: number;
  cost: number;
}

interface RealityWarning {
  type: string;
  severity: 'low' | 'medium' | 'high';
  title: string;
  message: string;
  recommendation?: string;
  details?: string[];
}

interface ResourcePlanningProps {
  deliverables: any[];
  totalHours: number;
  durationWeeks: number;
}

export default function ResourcePlanning({ deliverables, totalHours, durationWeeks }: ResourcePlanningProps) {
  const [requirements, setRequirements] = useState<ResourceRequirement[]>([]);
  const [teamRecommendations, setTeamRecommendations] = useState<TeamRecommendation[]>([]);
  const [warnings, setWarnings] = useState<RealityWarning[]>([]);
  const [metadata, setMetadata] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');

  useEffect(() => {
    if (deliverables.length > 0 && totalHours > 0) {
      loadResourcePlan();
    }
  }, [deliverables, totalHours, durationWeeks]);

  const loadResourcePlan = async () => {
    setLoading(true);
    try {
      // Get FTE requirements
      const reqResponse = await axios.post('http://localhost:8000/api/v1/resource-planning/calculate-fte', {
        deliverables,
        duration_weeks: durationWeeks
      });
      setRequirements(reqResponse.data.requirements);

      // Get team recommendations
      const teamResponse = await axios.post('http://localhost:8000/api/v1/resource-planning/recommend-team', {
        total_hours: totalHours,
        duration_weeks: durationWeeks
      });
      setTeamRecommendations(teamResponse.data.recommendations);
      setMetadata(teamResponse.data.metadata);

      // Get reality checks
      const warningsResponse = await axios.post('http://localhost:8000/api/v1/resource-planning/reality-check', {
        deliverables,
        duration_weeks: durationWeeks,
        total_hours: totalHours
      });
      setWarnings(warningsResponse.data.warnings);
    } catch (error) {
      console.error('Failed to load resource plan:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group requirements by discipline
  const disciplines = [...new Set(requirements.map(r => r.discipline))];

  // Calculate FTE by week (all disciplines combined)
  const fteByWeek = new Map<number, number>();
  requirements.forEach(req => {
    const current = fteByWeek.get(req.week) || 0;
    fteByWeek.set(req.week, current + req.fte);
  });

  const maxFte = Math.max(...Array.from(fteByWeek.values()));
  const avgFte = Array.from(fteByWeek.values()).reduce((a, b) => a + b, 0) / fteByWeek.size;

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 border-red-300 text-red-800';
      case 'medium': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'low': return 'bg-blue-100 border-blue-300 text-blue-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return '🚨';
      case 'medium': return '⚠️';
      case 'low': return 'ℹ️';
      default: return '📋';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Loading resource plan...</div>
      </div>
    );
  }

  if (!deliverables.length || !totalHours) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl">ℹ️</span>
          <div>
            <h3 className="font-semibold text-blue-900">No Deliverables Configured</h3>
            <p className="text-sm text-blue-700 mt-1">
              Configure deliverables first to see resource planning recommendations.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Resource Planning Analysis</h2>
          <p className="text-sm text-gray-600 mt-1">
            FTE requirements, team recommendations, and reality checks
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('chart')}
            className={`px-3 py-1 rounded text-sm ${
              viewMode === 'chart' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            📊 Chart
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1 rounded text-sm ${
              viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            📋 Table
          </button>
        </div>
      </div>

      {/* Metadata Summary */}
      {metadata && (
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white border rounded-lg p-4">
            <div className="text-sm text-gray-600">Project Size</div>
            <div className="text-2xl font-bold text-gray-900 capitalize">{metadata.project_size}</div>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <div className="text-sm text-gray-600">Base FTE Required</div>
            <div className="text-2xl font-bold text-blue-600">{metadata.base_fte_required}</div>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <div className="text-sm text-gray-600">Peak Staffing</div>
            <div className="text-2xl font-bold text-purple-600">{maxFte.toFixed(1)} FTE</div>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <div className="text-sm text-gray-600">Avg Staffing</div>
            <div className="text-2xl font-bold text-green-600">{avgFte.toFixed(1)} FTE</div>
          </div>
        </div>
      )}

      {/* Reality Check Warnings */}
      {warnings.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">⚠️ Reality Checks</h3>
          {warnings.map((warning, idx) => (
            <div
              key={idx}
              className={`border-l-4 rounded-r-lg p-4 ${getSeverityColor(warning.severity)}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl">{getSeverityIcon(warning.severity)}</span>
                <div className="flex-1">
                  <h4 className="font-semibold">{warning.title}</h4>
                  <p className="text-sm mt-1">{warning.message}</p>
                  {warning.recommendation && (
                    <div className="mt-2 text-sm font-medium">
                      💡 {warning.recommendation}
                    </div>
                  )}
                  {warning.details && warning.details.length > 0 && (
                    <ul className="mt-2 text-xs space-y-1">
                      {warning.details.map((detail, i) => (
                        <li key={i}>• {detail}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Team Recommendations */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4">👥 Recommended Team Composition</h3>
        <div className="space-y-3">
          {teamRecommendations.map((rec, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="font-medium text-gray-900">{rec.role}</div>
                <div className="text-sm text-gray-600">
                  {rec.utilization}% utilization target
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-blue-600">
                  {rec.count} {rec.count === 1 ? 'person' : 'people'}
                </div>
                <div className="text-sm text-gray-600">
                  ${rec.cost.toLocaleString()} total
                </div>
              </div>
            </div>
          ))}
          <div className="border-t pt-3 mt-3">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total Team Size</span>
              <span className="text-blue-600">
                {teamRecommendations.reduce((sum, r) => sum + r.count, 0).toFixed(1)} people
              </span>
            </div>
            <div className="flex justify-between items-center text-lg font-bold mt-2">
              <span>Total Cost</span>
              <span className="text-green-600">
                ${teamRecommendations.reduce((sum, r) => sum + r.cost, 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Resource Requirements Visualization */}
      {viewMode === 'chart' ? (
        <div className="bg-white border rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4">📈 Staffing Requirements Over Time</h3>
          <div className="space-y-4">
            {/* Combined FTE Chart */}
            <div>
              <div className="text-sm text-gray-600 mb-2">Total FTE by Week</div>
              <div className="flex items-end gap-1 h-32">
                {Array.from({ length: durationWeeks }, (_, i) => i + 1).map(week => {
                  const fte = fteByWeek.get(week) || 0;
                  const height = maxFte > 0 ? (fte / maxFte) * 100 : 0;
                  return (
                    <div key={week} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                        style={{ height: `${height}%` }}
                        title={`Week ${week}: ${fte.toFixed(1)} FTE`}
                      />
                      <div className="text-xs text-gray-500 mt-1">{week}</div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>Week</span>
                <span>Peak: {maxFte.toFixed(1)} FTE</span>
              </div>
            </div>

            {/* By Discipline */}
            <div className="border-t pt-4">
              <div className="text-sm text-gray-600 mb-2">FTE by Discipline</div>
              {disciplines.map((discipline, idx) => {
                const disciplineReqs = requirements.filter(r => r.discipline === discipline);
                const maxDisciplineFte = Math.max(...disciplineReqs.map(r => r.fte));
                const colors = ['bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500', 'bg-teal-500'];
                const color = colors[idx % colors.length];

                return (
                  <div key={discipline} className="mb-3">
                    <div className="text-xs font-medium text-gray-700 mb-1">{discipline}</div>
                    <div className="flex items-end gap-1 h-16">
                      {Array.from({ length: durationWeeks }, (_, i) => i + 1).map(week => {
                        const req = disciplineReqs.find(r => r.week === week);
                        const fte = req?.fte || 0;
                        const height = maxDisciplineFte > 0 ? (fte / maxDisciplineFte) * 100 : 0;
                        return (
                          <div
                            key={week}
                            className={`flex-1 ${color} rounded-t`}
                            style={{ height: `${height}%` }}
                            title={`Week ${week}: ${fte.toFixed(1)} FTE`}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border rounded-lg p-6 overflow-x-auto">
          <h3 className="font-semibold text-gray-900 mb-4">📋 Detailed Requirements Table</h3>
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Week</th>
                <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Discipline</th>
                <th className="text-right py-2 px-3 text-sm font-semibold text-gray-700">Hours</th>
                <th className="text-right py-2 px-3 text-sm font-semibold text-gray-700">FTE</th>
                <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Conflicts</th>
              </tr>
            </thead>
            <tbody>
              {requirements.filter(r => r.fte > 0).map((req, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-3 text-sm">{req.week}</td>
                  <td className="py-2 px-3 text-sm">{req.discipline}</td>
                  <td className="py-2 px-3 text-sm text-right">{req.hours}</td>
                  <td className="py-2 px-3 text-sm text-right font-medium">{req.fte.toFixed(2)}</td>
                  <td className="py-2 px-3 text-sm">
                    {req.conflicts.length > 0 ? (
                      <span className="text-yellow-600">⚠️ {req.conflicts[0]}</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
