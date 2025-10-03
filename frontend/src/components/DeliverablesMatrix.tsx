import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getRecommendedDependencies } from '../config/deliverableDependencies';

interface Deliverable {
  name: string;
  phase: string;
  hours: number;
  discipline: string;
}

interface Phase {
  name: string;
  description: string;
  sequence: number;
  color: string;
}

interface ProjectTemplate {
  project_size: string;
  discipline: string;
  template_name: string;
  description: string;
  phases: Phase[];
  deliverables_by_phase: { [phase: string]: { [discipline: string]: Deliverable[] } };
  total_hours: number;
  disciplines: string[];
}

interface TeamMember {
  role: string;
  name?: string;
  hourlyRate?: number;
}

interface DeliverablesMatrixProps {
  projectSize: string;
  discipline: string;
  selectedDisciplines?: string[];
  onLoadTemplate?: (deliverables: any[]) => void;
  projectTeam?: TeamMember[];
}

export default function DeliverablesMatrix({ projectSize, discipline, selectedDisciplines = [], onLoadTemplate, projectTeam = [] }: DeliverablesMatrixProps) {
  const [template, setTemplate] = useState<ProjectTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDeliverables, setSelectedDeliverables] = useState<Set<string>>(new Set());
  const [adjustedHours, setAdjustedHours] = useState<{ [key: string]: number }>({});
  const [customDeliverables, setCustomDeliverables] = useState<{ [phase: string]: { [discipline: string]: Deliverable[] } }>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalPhase, setAddModalPhase] = useState('');
  const [addModalDiscipline, setAddModalDiscipline] = useState('');
  const [newDeliverableName, setNewDeliverableName] = useState('');
  const [newDeliverableHours, setNewDeliverableHours] = useState(0);
  const [expandedDisciplines, setExpandedDisciplines] = useState<Set<string>>(new Set());
  const [raciBreakdowns, setRaciBreakdowns] = useState<{
    [key: string]: {
      responsible: { member: string; hours: number }[];
      accountable: { member: string; hours: number }[];
      consulted: { member: string; hours: number }[];
      informed: { member: string; hours: number }[];
    }
  }>({});
  const [showRaciFor, setShowRaciFor] = useState<string | null>(null);

  // Default hourly rates (matching backend)
  const DEFAULT_RATES: { [key: string]: number } = {
    'Lead Engineer': 150,
    'Senior Engineer': 125,
    'Engineer': 100,
    'Designer': 85,
    'QA/QC Manager': 95,
    'Technical Reviewer': 115,
    'Document Control': 65,
    'Project Manager': 160,
    'CAD Technician': 75,
    'Cost Estimator': 110,
    'Scheduler': 105,
    'Civil Engineer': 100,
    'Mechanical Engineer': 100,
    'Electrical Engineer': 100,
    'Structural Engineer': 100,
    'Process Engineer': 100,
    'Chemical Engineer': 100,
  };

  // Helper to calculate cost for a deliverable based on RACI breakdown
  const calculateDeliverableCost = (key: string, currentHours: number, deliverableName: string): number => {
    const raci = raciBreakdowns[key] || getDefaultRaciAssignments(currentHours, deliverableName);
    let totalCost = 0;

    // Sum costs for each RACI role
    Object.values(raci).flat().forEach((assignment: any) => {
      const rate = DEFAULT_RATES[assignment.member] || 100; // Default to $100/hr if role not found
      totalCost += assignment.hours * rate;
    });

    return totalCost;
  };

  // Helper to get default RACI assignments based on total hours and deliverable discipline
  const getDefaultRaciAssignments = (totalHours: number, deliverableName: string) => {
    const name = deliverableName.toLowerCase();

    // Find appropriate team members based on deliverable type
    const findMember = (roleKeywords: string[]) => {
      const member = projectTeam.find(m =>
        roleKeywords.some(keyword => m.role.toLowerCase().includes(keyword))
      );
      return member?.role || projectTeam[0]?.role || 'Unassigned';
    };

    let responsible = 'Lead Engineer';
    let accountable = 'Project Manager';
    let consulted = 'QA/QC Manager';

    // Determine responsible party based on discipline
    if (name.includes('civil') || name.includes('site')) {
      responsible = findMember(['civil']);
    } else if (name.includes('mechanical') || name.includes('hvac') || name.includes('piping')) {
      responsible = findMember(['mechanical']);
    } else if (name.includes('electrical') || name.includes('instrument')) {
      responsible = findMember(['electrical']);
    } else if (name.includes('structural')) {
      responsible = findMember(['structural']);
    } else if (name.includes('process') || name.includes('p&id')) {
      responsible = findMember(['process', 'chemical']);
    }

    return {
      responsible: [{ member: responsible, hours: Math.round(totalHours * 0.60) }],
      accountable: [{ member: accountable, hours: Math.round(totalHours * 0.25) }],
      consulted: [{ member: consulted, hours: Math.round(totalHours * 0.10) }],
      informed: [{ member: 'Document Control', hours: Math.round(totalHours * 0.05) }]
    };
  };

  useEffect(() => {
    loadTemplate();
  }, [projectSize, discipline]);

  // Auto-load deliverables when template changes
  useEffect(() => {
    if (template && selectedDeliverables.size > 0) {
      loadSelectedDeliverables();
    }
  }, [template]);

  // Initialize expanded disciplines when template loads - expand all by default
  useEffect(() => {
    console.log('useEffect running - template:', !!template, 'selectedDisciplines:', selectedDisciplines);
    if (template) {
      console.log('Template disciplines:', template.disciplines);
      // Always expand all disciplines by default to show deliverables
      const initialExpanded = new Set(template.disciplines);
      console.log('Setting expandedDisciplines to:', Array.from(initialExpanded));
      setExpandedDisciplines(initialExpanded);
    }
  }, [template, selectedDisciplines]);

  const loadTemplate = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(
        `http://localhost:8000/api/v1/deliverables/template/${projectSize}/${discipline}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      console.log('Template response:', response.data);
      setTemplate(response.data);

      // Auto-select all deliverables in the template
      const allDeliverables = new Set<string>();
      const initialHours: { [key: string]: number } = {};

      Object.entries(response.data.deliverables_by_phase).forEach(([phase, phaseData]: [string, any]) => {
        console.log(`Phase ${phase}:`, phaseData);
        Object.entries(phaseData).forEach(([discipline, disciplineDeliverables]: [string, any]) => {
          console.log(`  Discipline ${discipline}:`, disciplineDeliverables);
          disciplineDeliverables.forEach((d: Deliverable) => {
            const key = `${phase}-${discipline}-${d.name}`;
            allDeliverables.add(key);
            initialHours[key] = d.hours;
          });
        });
      });

      console.log('All deliverables:', allDeliverables);
      setSelectedDeliverables(allDeliverables);
      setAdjustedHours(initialHours);
    } catch (err) {
      console.error('Failed to load template:', err);
      setError('Failed to load project template');
    } finally {
      setLoading(false);
    }
  };

  const toggleDeliverable = (deliverableKey: string) => {
    console.log('Toggling deliverable:', deliverableKey);
    console.log('Current selection size:', selectedDeliverables.size);
    console.log('Current selection:', Array.from(selectedDeliverables));

    const newSelection = new Set(selectedDeliverables);
    if (newSelection.has(deliverableKey)) {
      newSelection.delete(deliverableKey);
      console.log('Removed from selection');
    } else {
      newSelection.add(deliverableKey);
      console.log('Added to selection');
    }

    console.log('New selection size:', newSelection.size);
    console.log('New selection:', Array.from(newSelection));
    setSelectedDeliverables(newSelection);
  };

  const addCustomDeliverable = () => {
    if (!newDeliverableName || newDeliverableHours <= 0) return;

    const newDeliverable: Deliverable = {
      name: newDeliverableName,
      phase: addModalPhase,
      hours: newDeliverableHours,
      discipline: addModalDiscipline
    };

    const key = `${addModalPhase}-${addModalDiscipline}-${newDeliverableName}`;

    // Add to custom deliverables
    setCustomDeliverables(prev => {
      const updated = { ...prev };
      if (!updated[addModalPhase]) {
        updated[addModalPhase] = {};
      }
      if (!updated[addModalPhase][addModalDiscipline]) {
        updated[addModalPhase][addModalDiscipline] = [];
      }
      updated[addModalPhase][addModalDiscipline] = [
        ...updated[addModalPhase][addModalDiscipline],
        newDeliverable
      ];
      return updated;
    });

    // Auto-select the new deliverable
    setSelectedDeliverables(prev => new Set(prev).add(key));
    setAdjustedHours(prev => ({ ...prev, [key]: newDeliverableHours }));

    // Reset modal
    setShowAddModal(false);
    setNewDeliverableName('');
    setNewDeliverableHours(0);
  };

  const handleDeleteSelected = () => {
    if (selectedDeliverables.size === 0) return;

    if (confirm(`Delete ${selectedDeliverables.size} selected deliverable${selectedDeliverables.size > 1 ? 's' : ''}?`)) {
      // Remove from custom deliverables
      setCustomDeliverables(prev => {
        const updated = { ...prev };
        selectedDeliverables.forEach(key => {
          const [phase, discipline, ...nameParts] = key.split('-');
          const name = nameParts.join('-');

          if (updated[phase]?.[discipline]) {
            updated[phase][discipline] = updated[phase][discipline].filter(d => d.name !== name);

            // Clean up empty arrays
            if (updated[phase][discipline].length === 0) {
              delete updated[phase][discipline];
            }
            if (Object.keys(updated[phase]).length === 0) {
              delete updated[phase];
            }
          }
        });
        return updated;
      });

      // Remove from selections and adjusted hours
      setSelectedDeliverables(new Set());
      setAdjustedHours(prev => {
        const updated = { ...prev };
        selectedDeliverables.forEach(key => {
          delete updated[key];
        });
        return updated;
      });
    }
  };

  const getPhaseColor = (color: string) => {
    const colors: { [key: string]: string } = {
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200',
      orange: 'bg-orange-100 text-orange-800 border-orange-200',
      green: 'bg-green-100 text-green-800 border-green-200',
    };
    return colors[color] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getSelectedHours = () => {
    if (!template) return 0;
    let total = 0;

    // Calculate from template deliverables
    Object.entries(template.deliverables_by_phase).forEach(([phase, disciplines]) => {
      Object.entries(disciplines).forEach(([discipline, deliverables]) => {
        deliverables.forEach((d: Deliverable) => {
          const key = `${phase}-${discipline}-${d.name}`;
          if (selectedDeliverables.has(key)) {
            total += adjustedHours[key] || d.hours;
          }
        });
      });
    });

    // Calculate from custom deliverables
    Object.entries(customDeliverables).forEach(([phase, disciplines]) => {
      Object.entries(disciplines).forEach(([discipline, deliverables]) => {
        deliverables.forEach((d: Deliverable) => {
          const key = `${phase}-${discipline}-${d.name}`;
          if (selectedDeliverables.has(key)) {
            total += adjustedHours[key] || d.hours;
          }
        });
      });
    });

    return total;
  };

  const updateHours = (deliverableKey: string, hours: number) => {
    setAdjustedHours({
      ...adjustedHours,
      [deliverableKey]: hours
    });
  };

  const loadSelectedDeliverables = () => {
    if (!template || !onLoadTemplate) return;

    const deliverables: any[] = [];

    // Load template deliverables
    Object.entries(template.deliverables_by_phase).forEach(([phase, disciplines]) => {
      Object.entries(disciplines).forEach(([discipline, phaseDeliverables]) => {
        phaseDeliverables.forEach((d: Deliverable) => {
          const key = `${phase}-${discipline}-${d.name}`;
          if (selectedDeliverables.has(key)) {
            const hours = adjustedHours[key] || d.hours;
            deliverables.push({
              name: d.name,
              discipline: discipline,
              description: `${discipline} ⭐`,
              milestone: phase,
              base_hours: d.hours,
              adjusted_hours: hours,
              sequence: deliverables.length + 1,
              enabled: true,
            });
          }
        });
      });
    });

    // Load custom deliverables
    Object.entries(customDeliverables).forEach(([phase, disciplines]) => {
      Object.entries(disciplines).forEach(([discipline, phaseDeliverables]) => {
        phaseDeliverables.forEach((d: Deliverable) => {
          const key = `${phase}-${discipline}-${d.name}`;
          if (selectedDeliverables.has(key)) {
            const hours = adjustedHours[key] || d.hours;
            deliverables.push({
              name: d.name,
              discipline: discipline,
              description: `${discipline} - Custom deliverable`,
              milestone: phase,
              base_hours: d.hours,
              adjusted_hours: hours,
              sequence: deliverables.length + 1,
              enabled: true,
            });
          }
        });
      });
    });

    // Auto-apply dependency rules
    deliverables.forEach((deliv) => {
      const recommendedPrereqs = getRecommendedDependencies(deliv.name);
      const dependencies: any[] = [];

      console.log(`Template mode - Dependencies for ${deliv.name}:`, recommendedPrereqs);

      recommendedPrereqs.forEach((prereqName) => {
        const prereqDelivs = deliverables.filter(d => d.name === prereqName);
        console.log(`  Found ${prereqDelivs.length} matches for prerequisite "${prereqName}"`);

        prereqDelivs.forEach(prereqDeliv => {
          if (prereqDeliv.id !== deliv.id) {
            dependencies.push({
              deliverable_id: prereqDeliv.id,
              dependency_type: 'prerequisite',
            });
          }
        });
      });

      console.log(`  Total dependencies added: ${dependencies.length}`);
      deliv.dependencies = dependencies;
    });

    onLoadTemplate(deliverables);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-gray-600">Loading project template...</div>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-red-600">{error || 'No template available'}</div>
      </div>
    );
  }

  // Get all deliverables for a phase/discipline cell (template + custom)
  const getDeliverablesForCell = (phaseKey: string, disciplineKey: string): Deliverable[] => {
    console.log('Getting deliverables for:', phaseKey, disciplineKey);
    console.log('Available phases:', template?.deliverables_by_phase ? Object.keys(template.deliverables_by_phase) : 'none');
    const templateDeliverables = template?.deliverables_by_phase[phaseKey]?.[disciplineKey] || [];
    const customDeliverablesForCell = customDeliverables[phaseKey]?.[disciplineKey] || [];
    console.log('Found deliverables:', templateDeliverables.length, 'template +', customDeliverablesForCell.length, 'custom');
    return [...templateDeliverables, ...customDeliverablesForCell];
  };

  const getDisciplineColor = (discipline: string) => {
    const colors: { [key: string]: string } = {
      'Multidiscipline': 'bg-purple-50 border-l-4 border-l-purple-400',
      'Civil': 'bg-brown-50 border-l-4 border-l-amber-600',
      'Mechanical': 'bg-green-50 border-l-4 border-l-green-500',
      'Electrical': 'bg-yellow-50 border-l-4 border-l-yellow-500',
      'Structural': 'bg-gray-50 border-l-4 border-l-gray-500',
      'Chemical': 'bg-blue-50 border-l-4 border-l-blue-500',
    };
    return colors[discipline] || 'bg-gray-50 border-l-4 border-l-gray-300';
  };

  const toggleDiscipline = (discipline: string) => {
    const newExpanded = new Set(expandedDisciplines);
    if (newExpanded.has(discipline)) {
      newExpanded.delete(discipline);
    } else {
      newExpanded.add(discipline);
    }
    setExpandedDisciplines(newExpanded);
  };

  const getDisciplineHours = (discipline: string) => {
    let total = 0;
    template.phases.forEach(phase => {
      const phaseKey = phase.name.split(' - ')[0].toLowerCase();
      const deliverables = getDeliverablesForCell(phaseKey, discipline);
      deliverables.forEach(d => {
        const key = `${phaseKey}-${discipline}-${d.name}`;
        if (selectedDeliverables.has(key)) {
          total += adjustedHours[key] || d.hours;
        }
      });
    });
    return total;
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{template.template_name}</h3>
            <p className="text-sm text-gray-600 mt-1">{template.description}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Selected Hours</div>
            <div className="text-2xl font-bold text-blue-600">{getSelectedHours().toLocaleString()}</div>
            <div className="text-xs text-gray-500">of {template.total_hours.toLocaleString()} total</div>
          </div>
        </div>
      </div>

      {/* Debug Info */}
      <div className="p-4 bg-yellow-50 border border-yellow-200 m-6 rounded">
        <div className="text-sm font-mono">
          <div>Disciplines in template: {template.disciplines ? template.disciplines.length : 0}</div>
          <div>Disciplines: {template.disciplines ? JSON.stringify(template.disciplines) : 'none'}</div>
          <div>Expanded disciplines: {expandedDisciplines.size}</div>
          <div>Selected deliverables: {selectedDeliverables.size}</div>
        </div>
      </div>

      {/* Compact Table Layout - Disciplines on Left */}
      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            {/* Phase Headers */}
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-gray-100 border border-gray-300 p-3 text-left font-semibold w-48">
                  Discipline
                </th>
                {template.phases.map((phase, phaseIdx) => (
                  <th key={phaseIdx} className={`border border-gray-300 p-3 text-left ${getPhaseColor(phase.color)} min-w-[250px]`}>
                    <div className="font-semibold text-sm">{phase.name.split(' - ')[0]}</div>
                    <div className="text-xs font-normal mt-1 opacity-80">{phase.description}</div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Discipline Rows */}
            <tbody>
              {template.disciplines.map((discipline, disciplineIdx) => {
                const disciplineHours = getDisciplineHours(discipline);
                const isExpanded = expandedDisciplines.has(discipline);

                return (
                  <tr key={disciplineIdx} className={getDisciplineColor(discipline)}>
                    {/* Discipline Name Cell */}
                    <td className="sticky left-0 z-10 border border-gray-300 p-0 bg-inherit">
                      <button
                        onClick={() => toggleDiscipline(discipline)}
                        className="w-full p-3 flex items-center justify-between hover:bg-white/30 transition-colors text-left"
                      >
                        <div className="flex items-center gap-2">
                          <svg
                            className={`w-4 h-4 text-gray-600 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          <div>
                            <div className="font-semibold text-sm">{discipline}</div>
                            <div className="text-xs text-gray-600">{disciplineHours.toLocaleString()} hrs</div>
                          </div>
                        </div>
                      </button>
                    </td>

                    {/* Phase Cells */}
                    {template.phases.map((phase, phaseIdx) => {
                      const phaseKey = phase.name.split(' - ')[0].toLowerCase();
                      const deliverables = getDeliverablesForCell(phaseKey, discipline);

                      return (
                        <td key={phaseIdx} className="border border-gray-300 p-3 bg-white align-top">
                          {isExpanded && (
                            <div className="space-y-2 min-h-[80px]">
                              {deliverables.length === 0 ? (
                                <button
                                  onClick={() => {
                                    setAddModalPhase(phaseKey);
                                    setAddModalDiscipline(discipline);
                                    setShowAddModal(true);
                                  }}
                                  className="w-full p-2 border-2 border-dashed border-gray-300 rounded text-xs text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors"
                                >
                                      + Add deliverable
                                    </button>
                                  ) : (
                                    deliverables.map((deliverable, idx) => {
                                      const key = `${phaseKey}-${discipline}-${deliverable.name}`;
                                      console.log(`[RENDER] Deliverable key: "${key}", isSelected: ${selectedDeliverables.has(key)}`);
                                      const currentHours = adjustedHours[key] || deliverable.hours;
                                      const isModified = currentHours !== deliverable.hours;
                                      const isSelected = selectedDeliverables.has(key);

                                      return (
                                        <div
                                          key={key}
                                          className={`p-3 rounded-lg border-2 transition-all ${
                                            isSelected
                                              ? 'bg-blue-50 border-blue-400 shadow-sm'
                                              : 'bg-white border-gray-200 hover:border-gray-300'
                                          }`}
                                        >
                                          <div className="flex items-start gap-2">
                                            <input
                                              type="checkbox"
                                              checked={isSelected}
                                              onChange={() => {
                                                console.log('CHECKBOX CLICKED! Key:', key);
                                                toggleDeliverable(key);
                                              }}
                                              className="mt-0.5 h-4 w-4 text-blue-600 rounded flex-shrink-0"
                                            />
                                            <div className="flex-1 min-w-0">
                                              <div className="text-xs text-gray-500 mb-0.5">{discipline}</div>
                                              <div
                                                className="text-sm font-medium text-gray-900 cursor-pointer leading-snug"
                                                onClick={() => toggleDeliverable(key)}
                                              >
                                                {deliverable.name}
                                              </div>
                                              {isSelected ? (
                                                <div className="mt-2 space-y-2">
                                                  <div className="flex items-center gap-2">
                                                    <button
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        setShowRaciFor(showRaciFor === key ? null : key);
                                                        if (!raciBreakdowns[key]) {
                                                          setRaciBreakdowns(prev => ({
                                                            ...prev,
                                                            [key]: getDefaultRaciAssignments(currentHours, deliverable.name)
                                                          }));
                                                        }
                                                      }}
                                                      className="text-xs text-blue-600 hover:text-blue-800 underline"
                                                    >
                                                      {showRaciFor === key ? 'Hide' : 'Edit'} RACI Breakdown
                                                    </button>
                                                    {showRaciFor !== key && (
                                                      <div className="flex items-center gap-2">
                                                        <span className="text-xs text-gray-600">
                                                          {currentHours} hrs
                                                          {isModified && (
                                                            <span className="text-blue-600 ml-1">
                                                              (was {deliverable.hours})
                                                            </span>
                                                          )}
                                                        </span>
                                                        <span className="text-xs font-semibold text-green-600">
                                                          ${calculateDeliverableCost(key, currentHours, deliverable.name).toLocaleString()}
                                                        </span>
                                                      </div>
                                                    )}
                                                  </div>

                                                  {/* RACI Breakdown - Compact */}
                                                  {showRaciFor === key && (
                                                    <div className="space-y-1.5 bg-gray-50 p-2 rounded border border-gray-200">
                                                      {['responsible', 'accountable', 'consulted', 'informed'].map((roleType) => {
                                                        const raci = raciBreakdowns[key] || getDefaultRaciAssignments(currentHours, deliverable.name);
                                                        const assignments = raci[roleType as keyof typeof raci];
                                                        const raciLabel = roleType.charAt(0).toUpperCase();

                                                        return (
                                                          <div key={roleType}>
                                                            <div className="flex items-center gap-1.5">
                                                              {/* RACI Letter */}
                                                              <div className="w-5 h-5 rounded bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                                                                {raciLabel}
                                                              </div>

                                                              {/* Assignments */}
                                                              <div className="flex-1 space-y-1">
                                                                {assignments.length === 0 || (assignments.length === 1 && assignments[0].member === 'Unassigned') ? (
                                                                  <button
                                                                    onClick={(e) => {
                                                                      e.stopPropagation();
                                                                      const updatedAssignments = [{ member: projectTeam[0]?.role || 'Unassigned', hours: Math.round(currentHours * 0.1) }];
                                                                      setRaciBreakdowns(prev => ({
                                                                        ...prev,
                                                                        [key]: {
                                                                          ...raci,
                                                                          [roleType]: updatedAssignments
                                                                        }
                                                                      }));
                                                                    }}
                                                                    className="w-full px-2 py-1 text-xs text-gray-500 border border-dashed border-gray-300 rounded hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                                                  >
                                                                    + Add resource
                                                                  </button>
                                                                ) : (
                                                                  <>
                                                                    {assignments.map((assignment, idx) => (
                                                                      <div key={idx} className="flex items-center gap-1">
                                                                        <select
                                                                          value={assignment.member}
                                                                          onChange={(e) => {
                                                                            const updatedAssignments = [...assignments];
                                                                            updatedAssignments[idx] = { ...assignment, member: e.target.value };
                                                                            setRaciBreakdowns(prev => ({
                                                                              ...prev,
                                                                              [key]: {
                                                                                ...raci,
                                                                                [roleType]: updatedAssignments
                                                                              }
                                                                            }));
                                                                          }}
                                                                          className="flex-1 px-1.5 py-0.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                                          onClick={(e) => e.stopPropagation()}
                                                                        >
                                                                          {projectTeam.length > 0 ? (
                                                                            projectTeam.map(member => (
                                                                              <option key={member.role} value={member.role}>
                                                                                {member.role}
                                                                              </option>
                                                                            ))
                                                                          ) : (
                                                                            <option>{assignment.member}</option>
                                                                          )}
                                                                        </select>
                                                                        <input
                                                                          type="number"
                                                                          value={assignment.hours}
                                                                          onChange={(e) => {
                                                                            const newHours = parseInt(e.target.value) || 0;
                                                                            const updatedAssignments = [...assignments];
                                                                            updatedAssignments[idx] = { ...assignment, hours: Math.max(0, newHours) };
                                                                            const updatedRaci = {
                                                                              ...raci,
                                                                              [roleType]: updatedAssignments
                                                                            };
                                                                            setRaciBreakdowns(prev => ({
                                                                              ...prev,
                                                                              [key]: updatedRaci
                                                                            }));
                                                                            // Update total
                                                                            const total = Object.values(updatedRaci).flat().reduce((sum: number, a: any) => sum + a.hours, 0);
                                                                            updateHours(key, total);
                                                                          }}
                                                                          className="w-12 px-1 py-0.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                                          min="0"
                                                                          onClick={(e) => e.stopPropagation()}
                                                                        />
                                                                        <span className="text-xs text-gray-500">h</span>
                                                                        <button
                                                                          onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            const updatedAssignments = [...assignments, { member: projectTeam[0]?.role || 'Unassigned', hours: 0 }];
                                                                            setRaciBreakdowns(prev => ({
                                                                              ...prev,
                                                                              [key]: {
                                                                                ...raci,
                                                                                [roleType]: updatedAssignments
                                                                              }
                                                                            }));
                                                                          }}
                                                                          className="text-green-600 hover:text-green-800 text-sm px-1 font-bold"
                                                                          title="Add another"
                                                                        >
                                                                          +
                                                                        </button>
                                                                        <button
                                                                          onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            const updatedAssignments = assignments.filter((_, i) => i !== idx);
                                                                            setRaciBreakdowns(prev => ({
                                                                              ...prev,
                                                                              [key]: {
                                                                                ...raci,
                                                                                [roleType]: updatedAssignments.length > 0 ? updatedAssignments : []
                                                                              }
                                                                            }));
                                                                          }}
                                                                          className="text-red-500 hover:text-red-700 text-sm px-1 font-bold"
                                                                          title="Remove"
                                                                        >
                                                                          ×
                                                                        </button>
                                                                      </div>
                                                                    ))}
                                                                  </>
                                                                )}
                                                              </div>
                                                            </div>
                                                          </div>
                                                        );
                                                      })}
                                                      <div className="pt-1.5 mt-1 border-t border-gray-300">
                                                        <div className="space-y-1">
                                                          <div className="flex items-center justify-between text-xs">
                                                            <span className="font-semibold text-gray-700">Total Hours:</span>
                                                            <span className="font-bold text-blue-600">
                                                              {(() => {
                                                                const raci = raciBreakdowns[key] || getDefaultRaciAssignments(currentHours, deliverable.name);
                                                                return Object.values(raci).flat().reduce((sum: number, a: any) => sum + a.hours, 0);
                                                              })()} hrs
                                                            </span>
                                                          </div>
                                                          <div className="flex items-center justify-between text-xs">
                                                            <span className="font-semibold text-gray-700">Total Cost:</span>
                                                            <span className="font-bold text-green-600">
                                                              ${calculateDeliverableCost(key, currentHours, deliverable.name).toLocaleString()}
                                                            </span>
                                                          </div>
                                                        </div>
                                                      </div>
                                                    </div>
                                                  )}
                                                </div>
                                              ) : (
                                                <div className="text-xs text-gray-600 mt-1">
                                                  {deliverable.hours} hours
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })
                                  )}
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {selectedDeliverables.size} deliverables selected
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedDeliverables(new Set())}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 bg-white"
              >
                Clear All
              </button>
              <button
                onClick={() => {
                  const all = new Set<string>();
                  Object.entries(template.deliverables_by_phase).forEach(([phase, disciplines]) => {
                    Object.entries(disciplines).forEach(([discipline, deliverables]) => {
                      deliverables.forEach((d: Deliverable) => {
                        all.add(`${phase}-${discipline}-${d.name}`);
                      });
                    });
                  });
                  setSelectedDeliverables(all);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 bg-white"
              >
                Select All
              </button>
              <button
                onClick={loadSelectedDeliverables}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Load Selected Deliverables
              </button>
              {selectedDeliverables.size > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  🗑️ Delete {selectedDeliverables.size} Selected
                </button>
              )}
            </div>
          </div>
        </div>

      {/* Add Deliverable Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Add Custom Deliverable</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phase
                </label>
                <input
                  type="text"
                  value={addModalPhase}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discipline
                </label>
                <select
                  value={addModalDiscipline}
                  onChange={(e) => setAddModalDiscipline(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  {template.disciplines.map(disc => (
                    <option key={disc} value={disc}>{disc}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deliverable Name
                </label>
                <input
                  type="text"
                  value={newDeliverableName}
                  onChange={(e) => setNewDeliverableName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Enter deliverable name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hours
                </label>
                <input
                  type="number"
                  value={newDeliverableHours}
                  onChange={(e) => setNewDeliverableHours(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  min="0"
                  placeholder="Enter hours"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={addCustomDeliverable}
                disabled={!newDeliverableName || newDeliverableHours <= 0}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}