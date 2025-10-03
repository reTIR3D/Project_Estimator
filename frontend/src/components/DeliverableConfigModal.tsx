import { useState } from 'react';
import { IssueState, DeliverableDependency } from '../types';

interface Deliverable {
  id: string;
  name: string;
  discipline: string;
  base_hours: number;
  equipment_id?: string;
  issue_states?: IssueState[];
  review_cycles?: number;
  rework_factor?: number;
  dependencies?: DeliverableDependency[];
}

interface DeliverableConfigModalProps {
  isOpen: boolean;
  deliverable: Deliverable;
  allDeliverables: Deliverable[];
  onClose: () => void;
  onSave: (updates: Partial<Deliverable>) => void;
}

const ISSUE_STATE_OPTIONS: IssueState[] = ['IFD', 'IFR', 'IFA', 'IFB', 'IFC', 'IFI', 'IFP', 'IFM'];

const ISSUE_STATE_LABELS: Record<IssueState, string> = {
  IFD: 'Issued for Design',
  IFR: 'Issued for Review',
  IFA: 'Issued for Approval',
  IFB: 'Issued for Bid',
  IFC: 'Issued for Construction',
  IFI: 'Issued for Information',
  IFP: 'Issued for Permit',
  IFM: 'Issued for Manufacture',
};

const ISSUE_STATE_MULTIPLIERS: Record<IssueState, number> = {
  IFD: 0.4,
  IFR: 0.6,
  IFA: 0.7,
  IFB: 0.9,
  IFC: 1.0,
  IFI: 0.3,
  IFP: 0.8,
  IFM: 0.9,
};

export default function DeliverableConfigModal({
  isOpen,
  deliverable,
  allDeliverables,
  onClose,
  onSave,
}: DeliverableConfigModalProps) {
  const [issueStates, setIssueStates] = useState<IssueState[]>(
    deliverable.issue_states || ['IFR', 'IFC']
  );
  const [reviewCycles, setReviewCycles] = useState(deliverable.review_cycles || 1);
  const [reworkFactor, setReworkFactor] = useState(deliverable.rework_factor || 0.25);
  const [dependencies, setDependencies] = useState<DeliverableDependency[]>(
    deliverable.dependencies || []
  );

  if (!isOpen) return null;

  const availableDependencies = allDeliverables.filter(
    (d) => d.id !== deliverable.id
  );

  const handleToggleIssueState = (state: IssueState) => {
    setIssueStates((prev) =>
      prev.includes(state) ? prev.filter((s) => s !== state) : [...prev, state]
    );
  };

  const handleAddDependency = (delivId: string, type: 'prerequisite' | 'corequisite') => {
    setDependencies((prev) => [
      ...prev,
      { deliverable_id: delivId, dependency_type: type },
    ]);
  };

  const handleRemoveDependency = (delivId: string) => {
    setDependencies((prev) => prev.filter((d) => d.deliverable_id !== delivId));
  };

  const handleSave = () => {
    onSave({
      issue_states: issueStates,
      review_cycles: reviewCycles,
      rework_factor: reworkFactor,
      dependencies,
    });
    onClose();
  };

  // Calculate estimated hours with current config
  const baseHours = deliverable.base_hours || 0;
  const stateEffort = issueStates.reduce(
    (sum, state) => sum + baseHours * ISSUE_STATE_MULTIPLIERS[state],
    0
  );
  const reviewRework = stateEffort * (reviewCycles * reworkFactor);
  const totalHours = Math.round(stateEffort + reviewRework);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Configure Deliverable</h2>
            <p className="text-sm text-gray-600 mt-1">{deliverable.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Issue States */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Issue States</h3>
            <p className="text-sm text-gray-600 mb-4">
              Select which issue states this deliverable will progress through
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {ISSUE_STATE_OPTIONS.map((state) => {
                const isSelected = issueStates.includes(state);
                return (
                  <button
                    key={state}
                    onClick={() => handleToggleIssueState(state)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-gray-900">{state}</span>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {ISSUE_STATE_MULTIPLIERS[state]}×
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 text-left">
                      {ISSUE_STATE_LABELS[state]}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Review Cycles */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Review & Rework</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Review Cycles
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={reviewCycles}
                  onChange={(e) => setReviewCycles(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Expected number of review-rework cycles
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Rework Factor
                </label>
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.05"
                  value={reworkFactor}
                  onChange={(e) => setReworkFactor(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Percentage of work redone per cycle (0.0 - 1.0)
                </p>
              </div>
            </div>
          </div>

          {/* Dependencies */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Dependencies</h3>
            <p className="text-sm text-gray-600 mb-4">
              Define which deliverables must be completed before this one can start
            </p>

            {/* Current Dependencies */}
            {dependencies.length > 0 && (
              <div className="mb-4 space-y-2">
                {dependencies.map((dep) => {
                  const depDeliv = allDeliverables.find((d) => d.id === dep.deliverable_id);
                  if (!depDeliv) return null;

                  return (
                    <div
                      key={dep.deliverable_id}
                      className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-blue-600 font-bold">
                          {dep.dependency_type === 'prerequisite' ? '→' : '⇄'}
                        </span>
                        <div>
                          <div className="font-semibold text-gray-900">{depDeliv.name}</div>
                          <div className="text-xs text-gray-600">
                            {dep.dependency_type === 'prerequisite'
                              ? 'Must complete before'
                              : 'Can run in parallel'}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveDependency(dep.deliverable_id)}
                        className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                      >
                        Remove
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add Dependency */}
            <details className="border border-gray-200 rounded-lg">
              <summary className="px-4 py-3 cursor-pointer font-semibold text-gray-700 hover:bg-gray-50">
                + Add Dependency
              </summary>
              <div className="p-4 border-t border-gray-200 max-h-60 overflow-y-auto space-y-2">
                {availableDependencies
                  .filter(
                    (d) => !dependencies.find((dep) => dep.deliverable_id === d.id)
                  )
                  .map((d) => (
                    <div
                      key={d.id}
                      className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{d.name}</div>
                        <div className="text-xs text-gray-500">{d.discipline}</div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAddDependency(d.id, 'prerequisite')}
                          className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          Prerequisite
                        </button>
                        <button
                          onClick={() => handleAddDependency(d.id, 'corequisite')}
                          className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                        >
                          Corequisite
                        </button>
                      </div>
                    </div>
                  ))}
                {availableDependencies.filter(
                  (d) => !dependencies.find((dep) => dep.deliverable_id === d.id)
                ).length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    All deliverables already added
                  </p>
                )}
              </div>
            </details>
          </div>

          {/* Impact Summary */}
          <div className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200 rounded-lg p-4">
            <h3 className="text-sm font-bold text-gray-700 mb-3">Estimated Impact</h3>
            <div className="grid grid-cols-4 gap-3 text-sm">
              <div>
                <div className="text-xs text-gray-600">Base Hours</div>
                <div className="text-lg font-bold text-gray-900">{baseHours}h</div>
              </div>
              <div>
                <div className="text-xs text-gray-600">State Effort</div>
                <div className="text-lg font-bold text-blue-600">
                  +{Math.round(stateEffort)}h
                </div>
                <div className="text-xs text-gray-500">{issueStates.length} states</div>
              </div>
              <div>
                <div className="text-xs text-gray-600">Review Rework</div>
                <div className="text-lg font-bold text-purple-600">
                  +{Math.round(reviewRework)}h
                </div>
                <div className="text-xs text-gray-500">
                  {reviewCycles} × {(reworkFactor * 100).toFixed(0)}%
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600">Total Hours</div>
                <div className="text-lg font-bold text-green-600">{totalHours}h</div>
                <div className="text-xs text-green-600">
                  {((totalHours / baseHours - 1) * 100).toFixed(0)}% increase
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
