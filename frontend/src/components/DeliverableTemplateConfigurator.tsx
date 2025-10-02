import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Phase definitions
const PHASES = [
  { code: 'IFI', name: 'Issued for Information', color: 'bg-blue-100 text-blue-800' },
  { code: 'IFB', name: 'Issued for Bid', color: 'bg-purple-100 text-purple-800' },
  { code: 'IFR', name: 'Issued for Review', color: 'bg-yellow-100 text-yellow-800' },
  { code: 'FYU', name: 'For Your Use', color: 'bg-pink-100 text-pink-800' },
  { code: 'IFA', name: 'Issued for Approval', color: 'bg-orange-100 text-orange-800' },
  { code: 'IFD', name: 'Issued for Design', color: 'bg-green-100 text-green-800' },
  { code: 'IFH', name: 'Issued for HAZOP', color: 'bg-red-100 text-red-800' },
  { code: 'IFC', name: 'Issued for Construction', color: 'bg-indigo-100 text-indigo-800' },
];

interface DeliverableConfig {
  name: string;
  milestone: string;
  duration_days: number;
  hours_create: number;
  hours_review: number;
  hours_qa: number;
  hours_doc: number;
  hours_revisions: number;
  hours_pm: number;
  dependencies: number[];
  sequence_number: number;
}

interface Template {
  id?: string;
  company_id?: string | null;  // Optional - null for generic templates
  name: string;
  project_size: 'SMALL' | 'MEDIUM' | 'LARGE' | 'PHASE_GATE';
  discipline?: string;
  description?: string;
  deliverables_config: DeliverableConfig[];
  is_default: boolean;
}

interface AvailableDeliverable {
  name: string;
  description: string;
  base_hours: number;
}

interface SizeRecommendation {
  current_size: string;
  total_hours: number;
  recommended_size: string;
  is_appropriate: boolean;
  message?: string;
}

export default function DeliverableTemplateConfigurator() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [currentTemplate, setCurrentTemplate] = useState<Template | null>(null);
  const [selectedSize, setSelectedSize] = useState<'SMALL' | 'MEDIUM' | 'LARGE' | 'PHASE_GATE'>('MEDIUM');
  const [availableDeliverables, setAvailableDeliverables] = useState<AvailableDeliverable[]>([]);
  const [selectedPhase, setSelectedPhase] = useState<string>('IFC');
  const [activePhases, setActivePhases] = useState<string[]>(['IFC']); // Phases active in current template
  const [showAddPhase, setShowAddPhase] = useState(false);
  const [showAddDeliverable, setShowAddDeliverable] = useState(false);
  const [editingDeliverable, setEditingDeliverable] = useState<number | null>(null);
  const [sizeRecommendation, setSizeRecommendation] = useState<SizeRecommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load templates on mount
  useEffect(() => {
    loadTemplates();
    loadAvailableDeliverables();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');

      // Load all templates (generic templates have no company_id)
      const response = await axios.get('http://localhost:8000/api/v1/deliverable-templates/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTemplates(response.data || []);
    } catch (err: any) {
      console.error('Failed to load templates:', err);
      setError(err.response?.data?.detail || 'Failed to load templates. You may need to log in again.');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableDeliverables = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(
        'http://localhost:8000/api/v1/deliverables/standard/CIVIL',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAvailableDeliverables(response.data.deliverables || []);
    } catch (err) {
      console.error('Failed to load deliverables:', err);
    }
  };

  const createNewTemplate = () => {
    // Templates are now generic (no company_id required)
    const newTemplate: Template = {
      company_id: null,  // Generic template
      name: `New ${selectedSize} Template`,
      project_size: selectedSize,
      description: '',
      deliverables_config: [],
      is_default: false,
    };
    setCurrentTemplate(newTemplate);
  };

  const loadTemplate = (template: Template) => {
    setCurrentTemplate(template);
    setSelectedSize(template.project_size);

    // Extract unique phases from deliverables
    const phases = [...new Set(template.deliverables_config.map(d => d.milestone))];
    setActivePhases(phases.length > 0 ? phases : ['IFC']);
    setSelectedPhase(phases[0] || 'IFC');
  };

  const addPhase = (phaseCode: string) => {
    if (!activePhases.includes(phaseCode)) {
      const updated = [...activePhases, phaseCode];
      setActivePhases(updated);
      setSelectedPhase(phaseCode);
    }
    setShowAddPhase(false);
  };

  const removePhase = (phaseCode: string) => {
    if (!currentTemplate) return;

    // Remove all deliverables in this phase
    const updatedDeliverables = currentTemplate.deliverables_config.filter(
      d => d.milestone !== phaseCode
    );

    setCurrentTemplate({
      ...currentTemplate,
      deliverables_config: updatedDeliverables,
    });

    // Remove phase from active phases
    const updatedPhases = activePhases.filter(p => p !== phaseCode);
    setActivePhases(updatedPhases.length > 0 ? updatedPhases : ['IFC']);

    // Select a different phase
    if (selectedPhase === phaseCode) {
      setSelectedPhase(updatedPhases[0] || 'IFC');
    }
  };

  const getAvailablePhases = () => {
    return PHASES.filter(p => !activePhases.includes(p.code));
  };

  const saveTemplate = async () => {
    if (!currentTemplate) return;

    try {
      const token = localStorage.getItem('access_token');
      let response;

      if (currentTemplate.id) {
        // Update existing
        response = await axios.patch(
          `http://localhost:8000/api/v1/deliverable-templates/${currentTemplate.id}`,
          currentTemplate,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // Create new
        response = await axios.post(
          'http://localhost:8000/api/v1/deliverable-templates/',
          currentTemplate,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setCurrentTemplate(response.data);
      loadTemplates();
      alert('Template saved successfully!');
    } catch (err) {
      console.error('Failed to save template:', err);
      alert('Failed to save template');
    }
  };

  const addDeliverableToPhase = (deliverable: AvailableDeliverable) => {
    if (!currentTemplate) return;

    const newDeliverable: DeliverableConfig = {
      name: deliverable.name,
      milestone: selectedPhase,
      duration_days: 5,
      hours_create: Math.round(deliverable.base_hours * 0.6),
      hours_review: Math.round(deliverable.base_hours * 0.15),
      hours_qa: Math.round(deliverable.base_hours * 0.1),
      hours_doc: Math.round(deliverable.base_hours * 0.05),
      hours_revisions: Math.round(deliverable.base_hours * 0.05),
      hours_pm: Math.round(deliverable.base_hours * 0.05),
      dependencies: [],
      sequence_number: currentTemplate.deliverables_config.length + 1,
    };

    setCurrentTemplate({
      ...currentTemplate,
      deliverables_config: [...currentTemplate.deliverables_config, newDeliverable],
    });
    setShowAddDeliverable(false);
  };

  const addCustomDeliverable = () => {
    if (!currentTemplate) return;

    const newDeliverable: DeliverableConfig = {
      name: 'New Deliverable',
      milestone: selectedPhase,
      duration_days: 5,
      hours_create: 0,
      hours_review: 0,
      hours_qa: 0,
      hours_doc: 0,
      hours_revisions: 0,
      hours_pm: 0,
      dependencies: [],
      sequence_number: currentTemplate.deliverables_config.length + 1,
    };

    setCurrentTemplate({
      ...currentTemplate,
      deliverables_config: [...currentTemplate.deliverables_config, newDeliverable],
    });
    setShowAddDeliverable(false);
  };

  const removeDeliverable = (index: number) => {
    if (!currentTemplate) return;

    const updated = currentTemplate.deliverables_config.filter((_, i) => i !== index);
    // Resequence
    const resequenced = updated.map((d, i) => ({ ...d, sequence_number: i + 1 }));

    setCurrentTemplate({
      ...currentTemplate,
      deliverables_config: resequenced,
    });
  };

  const updateDeliverable = (index: number, field: keyof DeliverableConfig, value: any) => {
    if (!currentTemplate) return;

    const updated = [...currentTemplate.deliverables_config];
    updated[index] = { ...updated[index], [field]: value };

    setCurrentTemplate({
      ...currentTemplate,
      deliverables_config: updated,
    });
  };

  const getDeliverablesForPhase = (phase: string) => {
    if (!currentTemplate) return [];
    return currentTemplate.deliverables_config.filter(d => d.milestone === phase);
  };

  const getTotalHoursForDeliverable = (deliverable: DeliverableConfig) => {
    return (
      deliverable.hours_create +
      deliverable.hours_review +
      deliverable.hours_qa +
      deliverable.hours_doc +
      deliverable.hours_revisions +
      deliverable.hours_pm
    );
  };

  const getTotalHoursForPhase = (phase: string) => {
    return getDeliverablesForPhase(phase).reduce(
      (sum, d) => sum + getTotalHoursForDeliverable(d),
      0
    );
  };

  const checkSizeRecommendation = async () => {
    if (!currentTemplate) {
      setSizeRecommendation(null);
      return;
    }

    const totalHours = currentTemplate.deliverables_config.reduce(
      (sum, d) => sum + getTotalHoursForDeliverable(d),
      0
    );

    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post(
        'http://localhost:8000/api/v1/project-size-settings/recommend',
        null,
        {
          params: {
            current_size: currentTemplate.project_size,
            total_hours: totalHours,
          },
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setSizeRecommendation(response.data);
    } catch (err) {
      console.error('Failed to get size recommendation:', err);
    }
  };

  // Check size whenever template or deliverables change
  useEffect(() => {
    checkSizeRecommendation();
  }, [currentTemplate]);

  const getPhaseColor = (phaseCode: string) => {
    return PHASES.find(p => p.code === phaseCode)?.color || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading templates...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Deliverable Template Configurator</h1>
            <p className="text-gray-600 mt-1">Create and manage deliverable templates for different project sizes</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={createNewTemplate}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              + New Template
            </button>
            {currentTemplate && (
              <button
                onClick={saveTemplate}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Save Template
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Template Selection & Size Filter */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Template</label>
            <select
              value={currentTemplate?.id || ''}
              onChange={(e) => {
                const template = templates.find(t => t.id === e.target.value);
                if (template) loadTemplate(template);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Select Existing Template --</option>
              {templates.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.project_size})
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Project Size</label>
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="SMALL">Small</option>
              <option value="MEDIUM">Medium</option>
              <option value="LARGE">Large</option>
              <option value="PHASE_GATE">Phased Gate</option>
            </select>
          </div>
        </div>
      </div>

      {/* Template Editor */}
      {currentTemplate && (
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Template Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Template Name</label>
              <input
                type="text"
                value={currentTemplate.name}
                onChange={(e) => setCurrentTemplate({ ...currentTemplate, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <input
                type="text"
                value={currentTemplate.description || ''}
                onChange={(e) => setCurrentTemplate({ ...currentTemplate, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={currentTemplate.is_default}
              onChange={(e) => setCurrentTemplate({ ...currentTemplate, is_default: e.target.checked })}
              className="h-4 w-4 text-blue-600 rounded"
            />
            <label className="text-sm font-medium text-gray-700">Set as default template for {currentTemplate.project_size} projects</label>
          </div>

          {/* Size Recommendation Warning */}
          {sizeRecommendation && !sizeRecommendation.is_appropriate && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="text-2xl">⚠️</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-yellow-800">Size Mismatch Detected</h4>
                  <p className="text-sm text-yellow-700 mt-1">{sizeRecommendation.message}</p>
                  <button
                    onClick={() => {
                      setCurrentTemplate({
                        ...currentTemplate,
                        project_size: sizeRecommendation.recommended_size as any
                      });
                    }}
                    className="mt-2 px-4 py-2 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700"
                  >
                    Change to {sizeRecommendation.recommended_size}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Size is appropriate */}
          {sizeRecommendation && sizeRecommendation.is_appropriate && (
            <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="text-lg">✓</div>
                <p className="text-sm text-green-700 font-medium">
                  Size classification is appropriate ({sizeRecommendation.total_hours} hours → {currentTemplate.project_size})
                </p>
              </div>
            </div>
          )}

          {/* Phase Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex gap-2 flex-wrap items-center">
              {activePhases.map(phaseCode => {
                const phase = PHASES.find(p => p.code === phaseCode);
                if (!phase) return null;
                return (
                  <div key={phase.code} className="relative group">
                    <button
                      onClick={() => setSelectedPhase(phase.code)}
                      className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${
                        selectedPhase === phase.code
                          ? phase.color + ' border-b-2 border-current'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {phase.code}
                      <span className="ml-2 text-xs">({getDeliverablesForPhase(phase.code).length})</span>
                      <span className="ml-1 text-xs font-bold">{getTotalHoursForPhase(phase.code)}h</span>
                    </button>
                    {activePhases.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Remove ${phase.code} phase and all its deliverables?`)) {
                            removePhase(phase.code);
                          }
                        }}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        ×
                      </button>
                    )}
                  </div>
                );
              })}

              {/* Add Phase Button */}
              <button
                onClick={() => setShowAddPhase(true)}
                className="px-4 py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-t-lg hover:border-blue-400 hover:text-blue-600 text-sm font-medium transition-colors"
              >
                + Add Phase
              </button>
            </div>
          </div>

          {/* Current Phase Content */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {PHASES.find(p => p.code === selectedPhase)?.name} Deliverables
              </h3>
              <button
                onClick={() => setShowAddDeliverable(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                + Add Deliverable
              </button>
            </div>

            {/* Deliverables List */}
            <div className="space-y-3">
              {getDeliverablesForPhase(selectedPhase).map((deliverable, index) => {
                const globalIndex = currentTemplate.deliverables_config.indexOf(deliverable);
                const isEditing = editingDeliverable === globalIndex;

                return (
                  <div key={globalIndex} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        {isEditing ? (
                          <input
                            type="text"
                            value={deliverable.name}
                            onChange={(e) => updateDeliverable(globalIndex, 'name', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded"
                          />
                        ) : (
                          <h4 className="font-semibold text-gray-900">{deliverable.name}</h4>
                        )}
                        <div className="text-sm text-gray-600 mt-1">
                          Total: <span className="font-bold text-blue-600">{getTotalHoursForDeliverable(deliverable)} hours</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingDeliverable(isEditing ? null : globalIndex)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          {isEditing ? 'Done' : 'Edit'}
                        </button>
                        <button
                          onClick={() => removeDeliverable(globalIndex)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* RACI Hours Breakdown */}
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                      <div>
                        <label className="text-xs text-gray-600">Create</label>
                        <input
                          type="number"
                          value={deliverable.hours_create}
                          onChange={(e) => updateDeliverable(globalIndex, 'hours_create', parseInt(e.target.value) || 0)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Review</label>
                        <input
                          type="number"
                          value={deliverable.hours_review}
                          onChange={(e) => updateDeliverable(globalIndex, 'hours_review', parseInt(e.target.value) || 0)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">QA</label>
                        <input
                          type="number"
                          value={deliverable.hours_qa}
                          onChange={(e) => updateDeliverable(globalIndex, 'hours_qa', parseInt(e.target.value) || 0)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Doc</label>
                        <input
                          type="number"
                          value={deliverable.hours_doc}
                          onChange={(e) => updateDeliverable(globalIndex, 'hours_doc', parseInt(e.target.value) || 0)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Revisions</label>
                        <input
                          type="number"
                          value={deliverable.hours_revisions}
                          onChange={(e) => updateDeliverable(globalIndex, 'hours_revisions', parseInt(e.target.value) || 0)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">PM</label>
                        <input
                          type="number"
                          value={deliverable.hours_pm}
                          onChange={(e) => updateDeliverable(globalIndex, 'hours_pm', parseInt(e.target.value) || 0)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}

              {getDeliverablesForPhase(selectedPhase).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No deliverables added to this phase yet.
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="pt-6 border-t border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">Total Deliverables</div>
                <div className="text-2xl font-bold text-blue-600">{currentTemplate.deliverables_config.length}</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">Total Hours</div>
                <div className="text-2xl font-bold text-green-600">
                  {currentTemplate.deliverables_config.reduce((sum, d) => sum + getTotalHoursForDeliverable(d), 0)}
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">Phases Used</div>
                <div className="text-2xl font-bold text-purple-600">
                  {new Set(currentTemplate.deliverables_config.map(d => d.milestone)).size}
                </div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">Avg Hours/Deliverable</div>
                <div className="text-2xl font-bold text-orange-600">
                  {currentTemplate.deliverables_config.length > 0
                    ? Math.round(
                        currentTemplate.deliverables_config.reduce((sum, d) => sum + getTotalHoursForDeliverable(d), 0) /
                        currentTemplate.deliverables_config.length
                      )
                    : 0}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Deliverable Modal */}
      {showAddDeliverable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Add Deliverable to {selectedPhase}</h3>
              <button
                onClick={() => setShowAddDeliverable(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="mb-4">
                <button
                  onClick={addCustomDeliverable}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 mb-4"
                >
                  + Create Custom Deliverable
                </button>
              </div>
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-3">Or choose from library:</h4>
                <div className="space-y-2">
                  {availableDeliverables.map((deliverable, index) => (
                    <div
                      key={index}
                      onClick={() => addDeliverableToPhase(deliverable)}
                      className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-gray-900">{deliverable.name}</h5>
                          <p className="text-sm text-gray-600">{deliverable.description}</p>
                        </div>
                        <div className="text-sm text-gray-600">{deliverable.base_hours} hrs</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Phase Modal */}
      {showAddPhase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Add Phase to Template</h3>
              <button
                onClick={() => setShowAddPhase(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">Select a phase to add to this template:</p>
              <div className="space-y-2">
                {getAvailablePhases().length === 0 ? (
                  <p className="text-sm text-gray-500 italic">All phases have been added to this template.</p>
                ) : (
                  getAvailablePhases().map(phase => (
                    <button
                      key={phase.code}
                      onClick={() => addPhase(phase.code)}
                      className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all hover:shadow-md ${phase.color} border-transparent hover:border-current`}
                    >
                      <div className="font-semibold">{phase.code}</div>
                      <div className="text-xs opacity-75">{phase.name}</div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {error}
        </div>
      )}
    </div>
  );
}
