import React, { useState } from 'react';
import ResourcePlanning from './ResourcePlanning';
import TeamBuilder, { TeamMember } from './TeamBuilder';
import CostBreakdown from './CostBreakdown';

type PlanningTab = 'resources' | 'team' | 'costs';

interface PlanningHubProps {
  deliverables: any[];
  totalHours: number;
  durationWeeks: number;
  projectTeam: TeamMember[];
  onTeamChange: (team: TeamMember[]) => void;
  selectedCompanyId: string;
  selectedRateSheetId: string;
  costData: any;
  costLoading: boolean;
  onCalculateCosts: () => void;
}

export default function PlanningHub({
  deliverables,
  totalHours,
  durationWeeks,
  projectTeam,
  onTeamChange,
  selectedCompanyId,
  selectedRateSheetId,
  costData,
  costLoading,
  onCalculateCosts
}: PlanningHubProps) {
  const [activeTab, setActiveTab] = useState<PlanningTab>('resources');

  const tabs = [
    { id: 'resources', label: 'Resources & FTE', icon: '📊' },
    { id: 'team', label: 'Team Builder', icon: '👥' },
    { id: 'costs', label: 'Cost Analysis', icon: '💰' },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as PlanningTab)}
                className={`
                  flex-1 py-4 px-6 text-center font-semibold text-sm
                  border-b-2 transition-colors
                  ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
                  }
                `}
              >
                <span className="text-lg mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'resources' && (
            <div>
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900">Resource Analysis & FTE Requirements</h2>
                <p className="text-sm text-gray-600 mt-1">
                  View staffing requirements, FTE calculations, team recommendations, and reality checks
                </p>
              </div>
              <ResourcePlanning
                deliverables={deliverables}
                totalHours={totalHours}
                durationWeeks={durationWeeks}
              />
            </div>
          )}

          {activeTab === 'team' && (
            <div>
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900">Team Builder</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Assign specific team members and configure resource allocations
                </p>
              </div>
              <TeamBuilder
                team={projectTeam}
                onChange={onTeamChange}
              />
            </div>
          )}

          {activeTab === 'costs' && (
            <div>
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900">Cost Analysis</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Detailed cost breakdown, budget comparison, and profitability analysis
                </p>
              </div>
              <CostBreakdown
                projectTeam={projectTeam}
                selectedCompanyId={selectedCompanyId}
                selectedRateSheetId={selectedRateSheetId}
                costData={costData}
                costLoading={costLoading}
                onCalculate={onCalculateCosts}
              />
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow p-4 text-white">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{totalHours.toLocaleString()}</div>
            <div className="text-xs text-blue-100">Total Hours</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{projectTeam.length}</div>
            <div className="text-xs text-blue-100">Team Members</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{deliverables.length}</div>
            <div className="text-xs text-blue-100">Deliverables</div>
          </div>
        </div>
      </div>

      {/* Decision Helper */}
      {activeTab === 'resources' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900">Decision Point</h3>
              <p className="text-sm text-yellow-800 mt-1">
                Review reality warnings and team recommendations before proceeding.
                Use the Team Builder tab to assign specific people, and the Cost Analysis tab to validate budget.
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => setActiveTab('team')}
                  className="text-sm px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                >
                  → Assign Team
                </button>
                <button
                  onClick={() => setActiveTab('costs')}
                  className="text-sm px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                >
                  → View Costs
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
