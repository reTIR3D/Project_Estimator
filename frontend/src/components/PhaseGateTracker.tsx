import React from 'react';
import type { ProjectPhase } from '../types';

interface PhaseGateTrackerProps {
  currentPhase?: ProjectPhase;
  phaseCompletion?: { [key: string]: number };
  gateApprovals?: { [key: string]: any };
  onPhaseChange?: (phase: ProjectPhase) => void;
}

export default function PhaseGateTracker({
  currentPhase,
  phaseCompletion = {},
  gateApprovals = {},
  onPhaseChange,
}: PhaseGateTrackerProps) {
  const phases: { id: ProjectPhase; name: string; description: string; accuracy: string }[] = [
    { id: 'FRAME', name: 'Frame', description: 'Conceptual Design', accuracy: '±50%' },
    { id: 'SCREEN', name: 'Screen', description: 'Feasibility Study', accuracy: '±30%' },
    { id: 'REFINE', name: 'Refine', description: 'FEED/Define', accuracy: '±10-15%' },
    { id: 'IMPLEMENT', name: 'Implement', description: 'Detail Design', accuracy: 'Final' },
  ];

  const getPhaseIndex = (phase?: ProjectPhase) => {
    if (!phase) return -1;
    return phases.findIndex((p) => p.id === phase);
  };

  const currentIndex = getPhaseIndex(currentPhase);

  const getPhaseStatus = (index: number) => {
    if (index < currentIndex) return 'completed';
    if (index === currentIndex) return 'active';
    return 'pending';
  };

  const getPhaseColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'active':
        return 'bg-blue-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getPhaseTextColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-700';
      case 'active':
        return 'text-blue-700';
      default:
        return 'text-gray-500';
    }
  };

  const getPhaseCompletion = (phaseId: string) => {
    return phaseCompletion[phaseId.toLowerCase()] || 0;
  };

  const hasGateApproval = (phaseId: string) => {
    return gateApprovals[phaseId.toLowerCase()]?.approved || false;
  };

  return (
    <div className="bg-white rounded-lg shadow p-3">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-bold text-gray-900">Phase-Gate Progress</h2>
          <p className="text-xs text-gray-600">Track project through engineering phases</p>
        </div>
        {currentPhase && (
          <div className="text-right">
            <div className="text-lg font-bold text-blue-600">
              {phases[currentIndex]?.name}
            </div>
            <div className="text-xs text-gray-600">{phases[currentIndex]?.description}</div>
          </div>
        )}
      </div>

      {/* Phase Timeline */}
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200">
          <div
            className="h-full bg-blue-500 transition-all duration-500"
            style={{
              width: `${currentIndex >= 0 ? (currentIndex / (phases.length - 1)) * 100 : 0}%`,
            }}
          />
        </div>

        {/* Phase Nodes */}
        <div className="relative flex justify-between">
          {phases.map((phase, index) => {
            const status = getPhaseStatus(index);
            const completion = getPhaseCompletion(phase.id);
            const approved = hasGateApproval(phase.id);

            return (
              <div key={phase.id} className="flex flex-col items-center" style={{ width: '25%' }}>
                {/* Phase Node */}
                <button
                  onClick={() => onPhaseChange && onPhaseChange(phase.id)}
                  disabled={!onPhaseChange}
                  className={`relative w-8 h-8 rounded-full border-2 border-white shadow-md transition-all ${
                    status === 'active' ? 'ring-2 ring-blue-200' : ''
                  } ${onPhaseChange ? 'hover:scale-110 cursor-pointer' : 'cursor-default'} ${getPhaseColor(
                    status
                  )}`}
                >
                  {status === 'completed' && (
                    <svg
                      className="w-full h-full p-1 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  {status === 'active' && (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    </div>
                  )}
                </button>

                {/* Phase Info */}
                <div className="mt-2 text-center">
                  <div className={`text-xs font-semibold ${getPhaseTextColor(status)}`}>
                    {phase.name}
                  </div>
                  <div className="text-xs text-gray-500">{phase.description}</div>
                  <div className="text-xs text-gray-400">{phase.accuracy}</div>

                  {/* Completion Badge */}
                  {status !== 'pending' && (
                    <div className="mt-1">
                      {approved ? (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                          ✓ Approved
                        </span>
                      ) : status === 'active' ? (
                        <div className="text-xs font-medium text-blue-600">{completion}%</div>
                      ) : (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                          Done
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Phase Details Card - Compact */}
      {currentPhase && (
        <div className="mt-3 p-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-xs font-medium text-gray-700">Phase</div>
              <div className="text-sm font-bold text-blue-900">{phases[currentIndex]?.name}</div>
            </div>
            <div>
              <div className="text-xs font-medium text-gray-700">Accuracy</div>
              <div className="text-sm font-bold text-blue-900">{phases[currentIndex]?.accuracy}</div>
            </div>
            <div>
              <div className="text-xs font-medium text-gray-700">Complete</div>
              <div className="text-sm font-bold text-blue-900">
                {getPhaseCompletion(currentPhase)}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gate Approval Info - Compact */}
      {currentPhase && gateApprovals[currentPhase.toLowerCase()] && (
        <div className="mt-2 p-2 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1 text-xs">
              <span className="font-semibold text-green-900">Gate Approved </span>
              <span className="text-green-700">
                {new Date(gateApprovals[currentPhase.toLowerCase()].date).toLocaleDateString()}
                {gateApprovals[currentPhase.toLowerCase()].approver && (
                  <span> by {gateApprovals[currentPhase.toLowerCase()].approver}</span>
                )}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
