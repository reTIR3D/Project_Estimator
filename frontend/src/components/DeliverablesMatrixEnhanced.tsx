import React, { useState } from 'react';

/**
 * ENHANCED DELIVERABLES MATRIX - PROTOTYPE
 *
 * This component demonstrates the integration of:
 * - Issue State Progression (IFD → IFR → IFA → IFB → IFC)
 * - Review Cycle Multipliers
 * - Client Complexity Impact
 * - Dependency Tracking
 *
 * Based on the "claude discussion - deliverables.txt" design
 */

// Issue states in typical progression order
type IssueState = 'IFD' | 'IFR' | 'IFA' | 'IFB' | 'IFC' | 'IFI' | 'IFP' | 'IFM';

interface IssueStateConfig {
  code: IssueState;
  name: string;
  description: string;
  color: string;
  typicalMultiplier: number; // Effort multiplier vs baseline IFC
}

const ISSUE_STATES: IssueStateConfig[] = [
  { code: 'IFD', name: 'Issued for Design', description: 'Interdisciplinary coordination', color: 'bg-purple-100 text-purple-800', typicalMultiplier: 0.4 },
  { code: 'IFR', name: 'Issued for Review', description: 'Review cycle', color: 'bg-blue-100 text-blue-800', typicalMultiplier: 0.6 },
  { code: 'IFA', name: 'Issued for Approval', description: 'Client approval', color: 'bg-yellow-100 text-yellow-800', typicalMultiplier: 0.7 },
  { code: 'IFB', name: 'Issued for Bid', description: 'Contractor bidding', color: 'bg-orange-100 text-orange-800', typicalMultiplier: 0.9 },
  { code: 'IFC', name: 'Issued for Construction', description: 'Final release', color: 'bg-green-100 text-green-800', typicalMultiplier: 1.0 },
  { code: 'IFI', name: 'Issued for Information', description: 'Info sharing', color: 'bg-gray-100 text-gray-800', typicalMultiplier: 0.3 },
  { code: 'IFP', name: 'Issued for Permit', description: 'Regulatory submission', color: 'bg-red-100 text-red-800', typicalMultiplier: 0.8 },
  { code: 'IFM', name: 'Issued for Manufacture', description: 'Fabrication release', color: 'bg-indigo-100 text-indigo-800', typicalMultiplier: 0.9 },
];

interface DeliverablePrerequisite {
  deliverableName: string;
  requiredState: IssueState;
}

interface EnhancedDeliverable {
  name: string;
  discipline: string;
  phase: string;
  baseHours: number; // Base hours for IFC

  // Issue state configuration
  issueStates: IssueState[]; // States this deliverable will go through
  currentState?: IssueState;

  // Review cycle configuration
  reviewCycles: number; // Number of review iterations
  reworkFactor: number; // % rework per cycle (0.15 = 15%)

  // Dependencies
  prerequisites?: DeliverablePrerequisite[];

  // Auto-calculated
  calculatedHours?: number;

  // Metadata
  regulatoryOverlay?: 'HAZOP' | 'SIL' | 'FDA' | 'HACCP' | 'NONE';
  selected?: boolean;
}

interface ClientComplexityProfile {
  type: 'TYPE_A' | 'TYPE_B' | 'TYPE_C';
  reviewCycleMultiplier: number;
  reworkFactorMultiplier: number;
  description: string;
}

const CLIENT_PROFILES: ClientComplexityProfile[] = [
  { type: 'TYPE_A', reviewCycleMultiplier: 1.5, reworkFactorMultiplier: 1.3, description: 'Heavy oversight - adds review cycles' },
  { type: 'TYPE_B', reviewCycleMultiplier: 1.0, reworkFactorMultiplier: 1.0, description: 'Standard process - baseline' },
  { type: 'TYPE_C', reviewCycleMultiplier: 0.7, reworkFactorMultiplier: 0.8, description: 'Minimal oversight - streamlined' },
];

export default function DeliverablesMatrixEnhanced() {
  // Sample deliverables data
  const [deliverables, setDeliverables] = useState<EnhancedDeliverable[]>([
    {
      name: 'Process Flow Diagrams (PFDs)',
      discipline: 'Process',
      phase: 'design',
      baseHours: 80,
      issueStates: ['IFD', 'IFR', 'IFA', 'IFC'],
      reviewCycles: 2,
      reworkFactor: 0.25,
      selected: true,
    },
    {
      name: 'P&IDs',
      discipline: 'Process',
      phase: 'design',
      baseHours: 120,
      issueStates: ['IFD', 'IFR', 'IFA', 'IFB', 'IFC'],
      reviewCycles: 3,
      reworkFactor: 0.30,
      regulatoryOverlay: 'HAZOP',
      prerequisites: [
        { deliverableName: 'Process Flow Diagrams (PFDs)', requiredState: 'IFA' }
      ],
      selected: true,
    },
    {
      name: 'Equipment Datasheets',
      discipline: 'Mechanical',
      phase: 'design',
      baseHours: 60,
      issueStates: ['IFR', 'IFB', 'IFC'],
      reviewCycles: 2,
      reworkFactor: 0.20,
      prerequisites: [
        { deliverableName: 'P&IDs', requiredState: 'IFA' }
      ],
      selected: true,
    },
    {
      name: 'Foundation Design',
      discipline: 'Civil',
      phase: 'detailed',
      baseHours: 100,
      issueStates: ['IFR', 'IFA', 'IFC'],
      reviewCycles: 2,
      reworkFactor: 0.15,
      selected: true,
    },
    {
      name: 'Electrical One-Lines',
      discipline: 'Electrical',
      phase: 'design',
      baseHours: 70,
      issueStates: ['IFD', 'IFR', 'IFC'],
      reviewCycles: 2,
      reworkFactor: 0.20,
      selected: false,
    },
  ]);

  const [clientProfile, setClientProfile] = useState<ClientComplexityProfile>(CLIENT_PROFILES[1]); // TYPE_B default
  const [expandedDeliverable, setExpandedDeliverable] = useState<string | null>(null);

  // Calculate total hours for a deliverable based on issue states and review cycles
  const calculateDeliverableHours = (deliverable: EnhancedDeliverable): number => {
    const { baseHours, issueStates, reviewCycles, reworkFactor } = deliverable;

    // Apply client complexity to review cycles and rework
    const adjustedReviewCycles = Math.ceil(reviewCycles * clientProfile.reviewCycleMultiplier);
    const adjustedReworkFactor = reworkFactor * clientProfile.reworkFactorMultiplier;

    // Calculate issue state effort
    const issueStateEffort = issueStates.reduce((total, state) => {
      const config = ISSUE_STATES.find(s => s.code === state);
      return total + (baseHours * (config?.typicalMultiplier || 1.0));
    }, 0);

    // Add rework from review cycles
    const reworkHours = issueStateEffort * (adjustedReviewCycles * adjustedReworkFactor);

    // Add regulatory overlay if applicable
    let regulatoryHours = 0;
    if (deliverable.regulatoryOverlay === 'HAZOP') {
      regulatoryHours = baseHours * 0.25; // HAZOP adds 25% effort
    }

    return Math.round(issueStateEffort + reworkHours + regulatoryHours);
  };

  // Check if prerequisites are met
  const checkPrerequisites = (deliverable: EnhancedDeliverable): { met: boolean; warnings: string[] } => {
    if (!deliverable.prerequisites) return { met: true, warnings: [] };

    const warnings: string[] = [];
    let allMet = true;

    deliverable.prerequisites.forEach(prereq => {
      const prereqDeliverable = deliverables.find(d => d.name === prereq.deliverableName);
      if (!prereqDeliverable?.selected) {
        warnings.push(`Requires "${prereq.deliverableName}" to be selected`);
        allMet = false;
      }
    });

    return { met: allMet, warnings };
  };

  const toggleDeliverable = (name: string) => {
    setDeliverables(deliverables.map(d =>
      d.name === name ? { ...d, selected: !d.selected } : d
    ));
  };

  const updateIssueStates = (name: string, states: IssueState[]) => {
    setDeliverables(deliverables.map(d =>
      d.name === name ? { ...d, issueStates: states } : d
    ));
  };

  const updateReviewCycles = (name: string, cycles: number) => {
    setDeliverables(deliverables.map(d =>
      d.name === name ? { ...d, reviewCycles: cycles } : d
    ));
  };

  const getTotalHours = () => {
    return deliverables
      .filter(d => d.selected)
      .reduce((sum, d) => sum + calculateDeliverableHours(d), 0);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Enhanced Deliverables Matrix</h2>
            <p className="text-sm text-gray-600 mt-1">With Issue State Progression & Review Cycles</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Total Hours</div>
            <div className="text-3xl font-bold text-blue-600">{getTotalHours().toLocaleString()}</div>
            <div className="text-xs text-gray-500">{deliverables.filter(d => d.selected).length} deliverables</div>
          </div>
        </div>

        {/* Client Profile Selector */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Client Complexity Profile</label>
          <div className="grid grid-cols-3 gap-3">
            {CLIENT_PROFILES.map(profile => (
              <button
                key={profile.type}
                onClick={() => setClientProfile(profile)}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  clientProfile.type === profile.type
                    ? 'border-blue-500 bg-blue-100 shadow-md'
                    : 'border-gray-200 bg-white hover:border-blue-300'
                }`}
              >
                <div className="font-bold text-sm">{profile.type}</div>
                <div className="text-xs text-gray-600 mt-1">{profile.description}</div>
                <div className="text-xs text-blue-600 mt-2">
                  Reviews ×{profile.reviewCycleMultiplier} • Rework ×{profile.reworkFactorMultiplier}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Issue State Legend */}
      <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Issue State Reference</h3>
        <div className="grid grid-cols-4 gap-2">
          {ISSUE_STATES.map(state => (
            <div key={state.code} className={`${state.color} px-3 py-2 rounded-lg border`}>
              <div className="font-bold text-xs">{state.code}</div>
              <div className="text-xs opacity-80">{state.name}</div>
              <div className="text-xs opacity-60 mt-1">{state.typicalMultiplier}× effort</div>
            </div>
          ))}
        </div>
      </div>

      {/* Deliverables Table */}
      <div className="space-y-3">
        {deliverables.map(deliverable => {
          const calculatedHours = calculateDeliverableHours(deliverable);
          const prereqCheck = checkPrerequisites(deliverable);
          const isExpanded = expandedDeliverable === deliverable.name;

          return (
            <div
              key={deliverable.name}
              className={`border-2 rounded-lg transition-all ${
                deliverable.selected
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              {/* Deliverable Header */}
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={deliverable.selected}
                    onChange={() => toggleDeliverable(deliverable.name)}
                    className="mt-1 h-5 w-5 text-blue-600 rounded"
                  />

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900">{deliverable.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                            {deliverable.discipline}
                          </span>
                          <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                            {deliverable.phase}
                          </span>
                          {deliverable.regulatoryOverlay && (
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                              {deliverable.regulatoryOverlay}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{calculatedHours}h</div>
                        <div className="text-xs text-gray-500">
                          Base: {deliverable.baseHours}h × {deliverable.issueStates.length} states
                        </div>
                      </div>
                    </div>

                    {/* Issue State Pills */}
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-xs font-semibold text-gray-600">Issue Path:</span>
                      {deliverable.issueStates.map((state, idx) => {
                        const config = ISSUE_STATES.find(s => s.code === state);
                        return (
                          <React.Fragment key={state}>
                            <div className={`${config?.color} px-2 py-1 rounded text-xs font-bold`}>
                              {state}
                            </div>
                            {idx < deliverable.issueStates.length - 1 && (
                              <span className="text-gray-400">→</span>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>

                    {/* Review Cycles Indicator */}
                    <div className="flex items-center gap-4 mt-2">
                      <div className="text-xs text-gray-600">
                        <span className="font-semibold">Review Cycles:</span> {deliverable.reviewCycles}
                        <span className="text-blue-600 ml-1">
                          (×{clientProfile.reviewCycleMultiplier} = {Math.ceil(deliverable.reviewCycles * clientProfile.reviewCycleMultiplier)})
                        </span>
                      </div>
                      <div className="text-xs text-gray-600">
                        <span className="font-semibold">Rework Factor:</span> {(deliverable.reworkFactor * 100).toFixed(0)}%
                        <span className="text-blue-600 ml-1">
                          (×{clientProfile.reworkFactorMultiplier} = {(deliverable.reworkFactor * clientProfile.reworkFactorMultiplier * 100).toFixed(0)}%)
                        </span>
                      </div>
                    </div>

                    {/* Prerequisites Warning */}
                    {!prereqCheck.met && (
                      <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-2">
                        <div className="flex items-start gap-2">
                          <span className="text-amber-600">⚠️</span>
                          <div className="text-xs text-amber-800">
                            <div className="font-semibold">Prerequisites not met:</div>
                            {prereqCheck.warnings.map((warning, idx) => (
                              <div key={idx}>• {warning}</div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Expand/Collapse for Configuration */}
                    {deliverable.selected && (
                      <button
                        onClick={() => setExpandedDeliverable(isExpanded ? null : deliverable.name)}
                        className="mt-3 text-xs text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        {isExpanded ? '▼ Hide Configuration' : '▶ Configure Issue States & Review Cycles'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Configuration Panel */}
                {deliverable.selected && isExpanded && (
                  <div className="mt-4 pt-4 border-t border-blue-200">
                    <div className="grid grid-cols-2 gap-6">
                      {/* Issue States Configuration */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Configure Issue States</h4>
                        <div className="space-y-2">
                          {ISSUE_STATES.map(state => (
                            <label key={state.code} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={deliverable.issueStates.includes(state.code)}
                                onChange={(e) => {
                                  const newStates = e.target.checked
                                    ? [...deliverable.issueStates, state.code]
                                    : deliverable.issueStates.filter(s => s !== state.code);
                                  updateIssueStates(deliverable.name, newStates);
                                }}
                                className="h-4 w-4 text-blue-600 rounded"
                              />
                              <div className={`flex-1 ${state.color} px-2 py-1 rounded text-xs`}>
                                <span className="font-bold">{state.code}</span> - {state.name}
                                <span className="ml-2 opacity-60">({state.typicalMultiplier}× effort)</span>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Review Cycles Configuration */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Review Cycles</h4>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Number of Review Cycles
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="5"
                              value={deliverable.reviewCycles}
                              onChange={(e) => updateReviewCycles(deliverable.name, parseInt(e.target.value))}
                              className="w-full"
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <span>0</span>
                              <span className="font-bold text-blue-600">{deliverable.reviewCycles}</span>
                              <span>5</span>
                            </div>
                          </div>

                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs space-y-1">
                            <div className="font-semibold text-gray-700">Calculation Breakdown:</div>
                            <div className="flex justify-between">
                              <span>Base effort ({deliverable.issueStates.length} states):</span>
                              <span className="font-mono">
                                {Math.round(deliverable.issueStates.reduce((total, state) => {
                                  const config = ISSUE_STATES.find(s => s.code === state);
                                  return total + (deliverable.baseHours * (config?.typicalMultiplier || 1.0));
                                }, 0))}h
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Review rework ({Math.ceil(deliverable.reviewCycles * clientProfile.reviewCycleMultiplier)} cycles @ {(deliverable.reworkFactor * clientProfile.reworkFactorMultiplier * 100).toFixed(0)}%):</span>
                              <span className="font-mono">
                                +{Math.round(deliverable.issueStates.reduce((total, state) => {
                                  const config = ISSUE_STATES.find(s => s.code === state);
                                  return total + (deliverable.baseHours * (config?.typicalMultiplier || 1.0));
                                }, 0) * (Math.ceil(deliverable.reviewCycles * clientProfile.reviewCycleMultiplier) * deliverable.reworkFactor * clientProfile.reworkFactorMultiplier))}h
                              </span>
                            </div>
                            {deliverable.regulatoryOverlay && (
                              <div className="flex justify-between">
                                <span>{deliverable.regulatoryOverlay} overlay:</span>
                                <span className="font-mono">+{Math.round(deliverable.baseHours * 0.25)}h</span>
                              </div>
                            )}
                            <div className="flex justify-between pt-2 border-t border-gray-300 font-bold text-blue-600">
                              <span>Total Hours:</span>
                              <span className="font-mono">{calculatedHours}h</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Footer */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-sm font-semibold text-gray-700">Selected Deliverables</div>
            <div className="text-2xl font-bold text-blue-600">{deliverables.filter(d => d.selected).length}</div>
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-700">Total Base Hours</div>
            <div className="text-2xl font-bold text-gray-600">
              {deliverables.filter(d => d.selected).reduce((sum, d) => sum + d.baseHours, 0).toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-700">Total with Reviews & States</div>
            <div className="text-2xl font-bold text-green-600">{getTotalHours().toLocaleString()}</div>
            <div className="text-xs text-green-600 mt-1">
              +{Math.round(((getTotalHours() / deliverables.filter(d => d.selected).reduce((sum, d) => sum + d.baseHours, 0)) - 1) * 100)}% from baseline
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
