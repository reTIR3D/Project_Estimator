import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Deliverable {
  name: string;
  description: string;
  milestone: string;
  base_hours: number;
  sequence: number;
  enabled?: boolean;
  adjusted_hours?: number;
  sheets?: {
    small: number;
    medium: number;
    large: number;
    skid: number;
  };
  expected_sheets?: number;
}

interface DeliverablesConfigProps {
  discipline: string;
  projectSize?: 'SMALL' | 'MEDIUM' | 'LARGE' | 'SKID';
  onDeliverablesChange?: (deliverables: Deliverable[]) => void;
}

export default function DeliverablesConfig({ discipline, projectSize = 'MEDIUM', onDeliverablesChange }: DeliverablesConfigProps) {
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [availableDeliverables, setAvailableDeliverables] = useState<Deliverable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customDeliverable, setCustomDeliverable] = useState<Deliverable>({
    name: '',
    description: '',
    milestone: 'ifc',
    base_hours: 0,
    sequence: 0,
    enabled: true,
    adjusted_hours: 0,
  });

  useEffect(() => {
    loadDeliverables();
  }, [discipline]);

  const loadDeliverables = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(
        `http://localhost:8000/api/v1/deliverables/standard/${discipline}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const deliverablesWithState = response.data.deliverables.map((d: Deliverable, idx: number) => {
        // Get expected sheets based on project size
        const sizeKey = projectSize.toLowerCase() as 'small' | 'medium' | 'large' | 'skid';
        const expectedSheets = d.sheets?.[sizeKey] || 0;

        return {
          ...d,
          enabled: false,  // Start with deliverables disabled
          adjusted_hours: d.base_hours,
          expected_sheets: expectedSheets,
          sequence: idx + 1
        };
      });

      setAvailableDeliverables(deliverablesWithState);
      setDeliverables([]);
      if (onDeliverablesChange) {
        onDeliverablesChange([]);
      }
    } catch (err) {
      console.error('Failed to load deliverables:', err);
      setError('Failed to load deliverables');
    } finally {
      setLoading(false);
    }
  };

  const addFromLibrary = (deliverable: Deliverable) => {
    const newDeliverable = {
      ...deliverable,
      enabled: true,
      sequence: deliverables.length + 1,
    };
    const updated = [...deliverables, newDeliverable];
    setDeliverables(updated);
    if (onDeliverablesChange) {
      onDeliverablesChange(updated);
    }
    setShowLibrary(false);
  };

  const addCustomDeliverable = () => {
    if (!customDeliverable.name.trim()) {
      alert('Please enter a deliverable name');
      return;
    }
    const newDeliverable = {
      ...customDeliverable,
      sequence: deliverables.length + 1,
      adjusted_hours: customDeliverable.base_hours,
    };
    const updated = [...deliverables, newDeliverable];
    setDeliverables(updated);
    if (onDeliverablesChange) {
      onDeliverablesChange(updated);
    }
    // Reset form
    setCustomDeliverable({
      name: '',
      description: '',
      milestone: 'ifc',
      base_hours: 0,
      sequence: 0,
      enabled: true,
      adjusted_hours: 0,
    });
    setShowCustomForm(false);
    setShowAddMenu(false);
  };

  const removeDeliverable = (index: number) => {
    const updated = deliverables.filter((_, idx) => idx !== index);
    // Resequence
    const resequenced = updated.map((d, idx) => ({ ...d, sequence: idx + 1 }));
    setDeliverables(resequenced);
    if (onDeliverablesChange) {
      onDeliverablesChange(resequenced);
    }
  };

  const toggleDeliverable = (index: number) => {
    const updated = [...deliverables];
    updated[index].enabled = !updated[index].enabled;
    setDeliverables(updated);
    if (onDeliverablesChange) {
      onDeliverablesChange(updated);
    }
  };

  const updateHours = (index: number, hours: number) => {
    const updated = [...deliverables];
    updated[index].adjusted_hours = hours;
    setDeliverables(updated);
    if (onDeliverablesChange) {
      onDeliverablesChange(updated);
    }
  };

  const updateSheets = (index: number, sheets: number) => {
    const updated = [...deliverables];
    updated[index].expected_sheets = sheets;
    setDeliverables(updated);
    if (onDeliverablesChange) {
      onDeliverablesChange(updated);
    }
  };

  const getTotalHours = () => {
    return deliverables
      .filter(d => d.enabled)
      .reduce((sum, d) => sum + (d.adjusted_hours || 0), 0);
  };

  const getMilestoneColor = (milestone: string) => {
    const colors: { [key: string]: string } = {
      ifd: 'bg-blue-100 text-blue-800',
      ifh: 'bg-purple-100 text-purple-800',
      ifr: 'bg-yellow-100 text-yellow-800',
      ifa: 'bg-orange-100 text-orange-800',
      ifc: 'bg-green-100 text-green-800',
    };
    return colors[milestone] || 'bg-gray-100 text-gray-800';
  };

  const getMilestoneName = (milestone: string) => {
    const names: { [key: string]: string } = {
      ifd: 'IFD - Issued for Design',
      ifh: 'IFH - Issued for HAZOP',
      ifr: 'IFR - Issued for Review',
      ifa: 'IFA - Issued for Approval',
      ifc: 'IFC - Issued for Construction',
    };
    return names[milestone] || milestone.toUpperCase();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-gray-600">Loading deliverables...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Project Deliverables</h3>
            <p className="text-sm text-gray-600 mt-1">
              Add and configure deliverables for this {discipline} project
            </p>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <span className="text-xl">+</span> Add Deliverable
            </button>
            {showAddMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <button
                  onClick={() => {
                    setShowLibrary(true);
                    setShowAddMenu(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-200"
                >
                  <div className="font-medium text-gray-900">From Library</div>
                  <div className="text-sm text-gray-600">Choose from standard deliverables</div>
                </button>
                <button
                  onClick={() => {
                    setShowCustomForm(true);
                    setShowAddMenu(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50"
                >
                  <div className="font-medium text-gray-900">Custom</div>
                  <div className="text-sm text-gray-600">Create a custom deliverable</div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        {deliverables.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No deliverables added yet.</p>
            <p className="text-sm mt-2">Click "Add Deliverable" to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
          {deliverables.map((deliverable, index) => (
            <div
              key={index}
              className={`border rounded-lg p-4 transition-all ${
                deliverable.enabled ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={deliverable.enabled}
                  onChange={() => toggleDeliverable(index)}
                  className="mt-1 h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                />

                {/* Deliverable Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className={`font-semibold ${deliverable.enabled ? 'text-gray-900' : 'text-gray-500'}`}>
                        {deliverable.sequence}. {deliverable.name}
                      </h4>
                      <p className={`text-sm mt-1 ${deliverable.enabled ? 'text-gray-600' : 'text-gray-400'}`}>
                        {deliverable.description}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getMilestoneColor(deliverable.milestone)}`}>
                      {getMilestoneName(deliverable.milestone).split(' - ')[0]}
                    </span>
                  </div>

                  {/* Hours and Sheets Input */}
                  {deliverable.enabled && (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <label className="text-sm font-medium text-gray-700">Sheets:</label>
                          <input
                            type="number"
                            value={deliverable.expected_sheets || 0}
                            onChange={(e) => updateSheets(index, parseInt(e.target.value) || 0)}
                            className="w-20 px-3 py-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            min="0"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-sm font-medium text-gray-700">Hours:</label>
                          <input
                            type="number"
                            value={deliverable.adjusted_hours || 0}
                            onChange={(e) => updateHours(index, parseInt(e.target.value) || 0)}
                            className="w-24 px-3 py-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            min="0"
                          />
                        </div>
                        {deliverable.expected_sheets && deliverable.expected_sheets > 0 && (
                          <span className="text-sm text-blue-600 font-medium">
                            ~{Math.round((deliverable.adjusted_hours || 0) / deliverable.expected_sheets)} hrs/sheet
                          </span>
                        )}
                        {deliverable.adjusted_hours !== deliverable.base_hours && (
                          <span className="text-xs text-gray-500">
                            (Base: {deliverable.base_hours} hours)
                          </span>
                        )}
                        <button
                          onClick={() => removeDeliverable(index)}
                          className="ml-auto text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        )}

        {/* Summary */}
        {deliverables.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-sm text-gray-600">
                  {deliverables.filter(d => d.enabled).length} of {deliverables.length} deliverables selected
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Total Deliverable Hours</div>
                <div className="text-2xl font-bold text-blue-600">{getTotalHours().toLocaleString()}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Library Modal */}
      {showLibrary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Deliverables Library</h3>
              <button
                onClick={() => setShowLibrary(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-3">
                {availableDeliverables.map((deliverable, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer"
                    onClick={() => addFromLibrary(deliverable)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{deliverable.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{deliverable.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                          {deliverable.expected_sheets && deliverable.expected_sheets > 0 && (
                            <span className="text-sm font-medium text-blue-600">
                              {deliverable.expected_sheets} sheets
                            </span>
                          )}
                          <span className="text-sm text-gray-500">{deliverable.base_hours} hours</span>
                          {deliverable.expected_sheets && deliverable.expected_sheets > 0 && (
                            <span className="text-xs text-gray-500">
                              (~{Math.round(deliverable.base_hours / deliverable.expected_sheets)} hrs/sheet)
                            </span>
                          )}
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getMilestoneColor(deliverable.milestone)}`}>
                            {getMilestoneName(deliverable.milestone).split(' - ')[0]}
                          </span>
                        </div>
                      </div>
                      <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                        Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Deliverable Form Modal */}
      {showCustomForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Create Custom Deliverable</h3>
              <button
                onClick={() => {
                  setShowCustomForm(false);
                  setShowAddMenu(false);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={customDeliverable.name}
                    onChange={(e) => setCustomDeliverable({ ...customDeliverable, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Design Specification Document"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={customDeliverable.description}
                    onChange={(e) => setCustomDeliverable({ ...customDeliverable, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Brief description of the deliverable"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Milestone</label>
                  <select
                    value={customDeliverable.milestone}
                    onChange={(e) => setCustomDeliverable({ ...customDeliverable, milestone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="ifd">IFD - Issued for Design</option>
                    <option value="ifh">IFH - Issued for HAZOP</option>
                    <option value="ifr">IFR - Issued for Review</option>
                    <option value="ifa">IFA - Issued for Approval</option>
                    <option value="ifc">IFC - Issued for Construction</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Hours *</label>
                  <input
                    type="number"
                    value={customDeliverable.base_hours}
                    onChange={(e) => setCustomDeliverable({ ...customDeliverable, base_hours: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowCustomForm(false);
                    setShowAddMenu(false);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={addCustomDeliverable}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Deliverable
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}