import React, { useState } from 'react';
import WBS from './WBS';
import RACIMatrix from './RACIMatrix';

type OrganizationTab = 'wbs' | 'raci';

interface WorkOrganizationProps {
  deliverables: any[];
  projectTeam: any[];
}

export default function WorkOrganization({ deliverables, projectTeam }: WorkOrganizationProps) {
  const [activeTab, setActiveTab] = useState<OrganizationTab>('wbs');
  const [collapsed, setCollapsed] = useState(false);

  const tabs = [
    { id: 'wbs', label: 'Work Breakdown Structure', icon: '📋' },
    { id: 'raci', label: 'RACI Matrix', icon: '👔' },
  ];

  if (collapsed) {
    return (
      <div className="bg-white rounded-lg shadow border-2 border-dashed border-gray-300 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📋</span>
            <div>
              <h3 className="font-semibold text-gray-900">Work Organization (Optional)</h3>
              <p className="text-sm text-gray-600">
                Configure WBS and RACI for detailed project planning
              </p>
            </div>
          </div>
          <button
            onClick={() => setCollapsed(false)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            Configure →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Collapse */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📋</span>
            <div>
              <h3 className="font-semibold text-gray-900">Work Organization</h3>
              <p className="text-sm text-gray-600">
                Optional: Configure work breakdown and responsibilities
              </p>
            </div>
          </div>
          <button
            onClick={() => setCollapsed(true)}
            className="text-sm px-3 py-1 text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50"
          >
            ↑ Collapse
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as OrganizationTab)}
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
          {activeTab === 'wbs' && (
            <div>
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900">Work Breakdown Structure</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Organize deliverables into a hierarchical work breakdown structure
                </p>
              </div>
              <WBS deliverables={deliverables} />
            </div>
          )}

          {activeTab === 'raci' && (
            <div>
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900">RACI Matrix</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Define Responsible, Accountable, Consulted, and Informed roles for each deliverable
                </p>
              </div>
              <RACIMatrix
                deliverables={deliverables}
                teamMembers={projectTeam}
              />
            </div>
          )}
        </div>
      </div>

      {/* Helper Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-xl">ℹ️</span>
          <div>
            <h4 className="font-semibold text-blue-900 text-sm">Optional Step</h4>
            <p className="text-xs text-blue-800 mt-1">
              WBS and RACI are useful for detailed project planning but not required for estimation.
              You can skip directly to Summary if you have the resource and cost information you need.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
