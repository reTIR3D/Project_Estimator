import React from 'react';
import { CostCalculationResponse } from '../types';

interface CostBreakdownProps {
  costData: CostCalculationResponse | null;
  loading?: boolean;
}

const CostBreakdown: React.FC<CostBreakdownProps> = ({ costData, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Cost Breakdown</h3>
        <p className="text-gray-500">Calculating costs...</p>
      </div>
    );
  }

  if (!costData) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Cost Breakdown</h3>
        <p className="text-gray-500">Select deliverables to see cost breakdown</p>
      </div>
    );
  }

  const { summary, by_role } = costData;

  // Format role name for display
  const formatRoleName = (role: string): string => {
    return role
      .split('.')
      .pop()
      ?.split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ') || role;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Cost Breakdown</h3>

      {/* Summary Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-blue-50 rounded-lg">
        <div>
          <p className="text-sm text-gray-600">Total Hours</p>
          <p className="text-2xl font-bold text-blue-900">{summary.total_hours.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Total Cost</p>
          <p className="text-2xl font-bold text-green-700">${summary.total_cost.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Deliverables</p>
          <p className="text-2xl font-bold text-purple-700">{summary.deliverable_count}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Avg $/Hour</p>
          <p className="text-2xl font-bold text-orange-700">${summary.average_cost_per_hour.toFixed(2)}</p>
        </div>
      </div>

      {/* By Role Table */}
      <div>
        <h4 className="text-md font-semibold mb-3">Cost by Role</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hours
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  %
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {by_role.map((role) => (
                <tr key={role.role} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {formatRoleName(role.role)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-700">
                    {role.hours.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-500">
                    {role.percentage.toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-green-700">
                    ${role.cost.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr className="font-bold">
                <td className="px-4 py-3 text-sm text-gray-900">Total</td>
                <td className="px-4 py-3 text-sm text-right text-gray-900">
                  {summary.total_hours.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm text-right text-gray-900">100.0%</td>
                <td className="px-4 py-3 text-sm text-right text-green-700">
                  ${summary.total_cost.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Visual Bar Chart */}
      <div className="mt-6">
        <h4 className="text-md font-semibold mb-3">Distribution</h4>
        <div className="space-y-2">
          {by_role.map((role) => (
            <div key={role.role} className="flex items-center">
              <div className="w-32 text-xs text-gray-600 truncate" title={formatRoleName(role.role)}>
                {formatRoleName(role.role)}
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-6 ml-2 relative overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-6 rounded-full flex items-center justify-end pr-2"
                  style={{ width: `${role.percentage}%` }}
                >
                  {role.percentage >= 8 && (
                    <span className="text-xs text-white font-medium">
                      {role.percentage.toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
              <div className="w-24 text-right text-xs text-gray-700 ml-2">
                ${role.cost.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CostBreakdown;