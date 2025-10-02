import React from 'react';
import type { Project } from '../types';

interface CampaignOutputTemplateProps {
  project: Project;
  monthlyHours?: Record<string, number>;
  totalCost?: number;
  monthlyRate?: number;
}

export default function CampaignOutputTemplate({
  project,
  monthlyHours = {},
  totalCost = 0,
  monthlyRate = 0,
}: CampaignOutputTemplateProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totalHours = Object.values(monthlyHours).reduce((sum, hours) => sum + hours, 0);
  const avgMonthlyHours = project.campaign_duration_months
    ? totalHours / project.campaign_duration_months
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
            <p className="text-purple-100">Engineering Support Campaign Estimate</p>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-90">Campaign Code</div>
            <div className="text-2xl font-bold">{project.project_code || 'N/A'}</div>
          </div>
        </div>
      </div>

      {/* Campaign Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Campaign Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="text-sm text-gray-600 mb-1">Client</div>
            <div className="font-semibold text-gray-900">{project.client_name || 'N/A'}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Duration</div>
            <div className="font-semibold text-gray-900">{project.campaign_duration_months} months</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Service Level</div>
            <div className="font-semibold text-gray-900">
              {project.campaign_service_level?.replace(/_/g, ' ') || 'N/A'}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Sites Covered</div>
            <div className="font-semibold text-gray-900">{project.campaign_site_count || 0}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Response Time</div>
            <div className="font-semibold text-gray-900">
              {project.campaign_response_requirement?.replace(/_/g, ' ') || 'N/A'}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Pricing Model</div>
            <div className="font-semibold text-gray-900">
              {project.campaign_pricing_model?.replace(/_/g, ' ') || 'N/A'}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Active Disciplines</div>
            <div className="font-semibold text-gray-900">
              {project.selected_disciplines?.length || 0} disciplines
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Status</div>
            <div className="font-semibold text-gray-900">{project.status}</div>
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow p-6 border-2 border-green-200">
          <div className="text-sm text-green-700 font-medium mb-2">Monthly Rate</div>
          <div className="text-3xl font-bold text-green-900">{formatCurrency(monthlyRate)}</div>
          <div className="text-xs text-green-600 mt-1">per month</div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow p-6 border-2 border-blue-200">
          <div className="text-sm text-blue-700 font-medium mb-2">Total Campaign Value</div>
          <div className="text-3xl font-bold text-blue-900">{formatCurrency(totalCost)}</div>
          <div className="text-xs text-blue-600 mt-1">{project.campaign_duration_months} months</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow p-6 border-2 border-purple-200">
          <div className="text-sm text-purple-700 font-medium mb-2">Average Monthly Hours</div>
          <div className="text-3xl font-bold text-purple-900">{Math.round(avgMonthlyHours)}h</div>
          <div className="text-xs text-purple-600 mt-1">Total: {totalHours}h</div>
        </div>
      </div>

      {/* Capacity Allocation by Discipline */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Capacity Allocation</h2>
        {project.selected_disciplines && project.selected_disciplines.length > 0 ? (
          <div className="space-y-3">
            {project.selected_disciplines.map((discipline) => {
              const disciplineHours = monthlyHours[discipline] || 0;
              const percentage = totalHours > 0 ? (disciplineHours / totalHours) * 100 : 0;

              return (
                <div key={discipline}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{discipline}</span>
                    <span className="text-sm text-gray-600">
                      {disciplineHours}h ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No disciplines selected</p>
        )}
      </div>

      {/* Service Scope */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Service Scope</h2>
        <div className="prose max-w-none">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Included Services</h3>
          <ul className="space-y-2 text-gray-700">
            <li>✓ Technical support and consultation for {project.campaign_site_count || 0} site(s)</li>
            <li>✓ Response to engineering queries within {project.campaign_response_requirement?.replace(/_/g, ' ').toLowerCase()}</li>
            <li>✓ Design review and markup services</li>
            <li>✓ Minor design modifications and updates</li>
            <li>✓ As-built documentation support</li>
            <li>✓ Monthly status reporting and hour tracking</li>
            {project.campaign_service_level === 'PREMIUM' && (
              <li>✓ Dedicated engineering resources with priority scheduling</li>
            )}
            {project.campaign_service_level === 'ENTERPRISE' && (
              <>
                <li>✓ 24/7 emergency support hotline</li>
                <li>✓ Quarterly on-site visits (travel additional)</li>
              </>
            )}
          </ul>

          <h3 className="text-lg font-semibold text-gray-800 mb-3 mt-6">Service Exclusions</h3>
          <ul className="space-y-2 text-gray-700">
            <li>• Major capital projects requiring separate scoping</li>
            <li>• Third-party vendor coordination (unless specified)</li>
            <li>• Permitting and regulatory submittals</li>
            <li>• Construction management services</li>
            <li>• Travel expenses (billed separately if required)</li>
          </ul>
        </div>
      </div>

      {/* Deliverables Schedule */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recurring Deliverables</h2>
        <div className="space-y-4">
          <div className="border-l-4 border-blue-500 pl-4">
            <div className="font-semibold text-gray-900">Monthly Status Report</div>
            <div className="text-sm text-gray-600">Due: 5th business day of each month</div>
            <div className="text-sm text-gray-500 mt-1">
              Summary of activities, hours consumed, and upcoming work
            </div>
          </div>

          <div className="border-l-4 border-green-500 pl-4">
            <div className="font-semibold text-gray-900">Quarterly Review Meeting</div>
            <div className="text-sm text-gray-600">Frequency: Every 3 months</div>
            <div className="text-sm text-gray-500 mt-1">
              Strategic planning session and capacity adjustment review
            </div>
          </div>

          <div className="border-l-4 border-purple-500 pl-4">
            <div className="font-semibold text-gray-900">Technical Deliverables</div>
            <div className="text-sm text-gray-600">As Required</div>
            <div className="text-sm text-gray-500 mt-1">
              Drawings, calculations, specifications, and reports per work requests
            </div>
          </div>
        </div>
      </div>

      {/* Terms & Conditions */}
      <div className="bg-gray-50 rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Terms & Conditions</h2>
        <div className="space-y-3 text-sm text-gray-700">
          <div>
            <strong>Billing:</strong> {project.campaign_pricing_model === 'MONTHLY_RETAINER'
              ? 'Fixed monthly retainer invoiced at the beginning of each month'
              : project.campaign_pricing_model === 'HOURLY_BUCKET'
              ? 'Pre-purchased hour blocks with monthly reconciliation'
              : project.campaign_pricing_model === 'TIME_AND_MATERIALS'
              ? 'Actual hours worked invoiced monthly at standard rates'
              : 'Base retainer plus overage billing for hours exceeding monthly allocation'}
          </div>
          <div>
            <strong>Term:</strong> {project.campaign_duration_months} month initial term with automatic renewal unless either party provides 60 days written notice
          </div>
          <div>
            <strong>Capacity Adjustments:</strong> Monthly capacity can be adjusted with 30 days notice based on actual utilization trends
          </div>
          <div>
            <strong>Overage Policy:</strong> Hours exceeding monthly allocation will be billed at standard rates (if applicable to pricing model)
          </div>
          <div>
            <strong>Unused Hours:</strong> {project.campaign_pricing_model === 'HOURLY_BUCKET'
              ? 'Unused hours roll over to subsequent months during campaign term'
              : 'Monthly retainer does not include hour banking or rollover'}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white rounded-lg shadow p-6 border-t-4 border-purple-500">
        <div className="text-center">
          <p className="text-sm text-gray-600">
            This estimate is valid for 30 days from the date of issue and is subject to the terms and conditions outlined above.
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Generated on {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
