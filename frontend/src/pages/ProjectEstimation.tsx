// Project Estimation Page - Refactored to 5 clean steps
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { estimationApi, projectsApi, companiesApi, rateSheetsApi } from '../services/api';
import ComplexityFactors from '../components/ComplexityFactors';
import EstimationSummary from '../components/EstimationSummary';
import DeliverablesMatrix from '../components/DeliverablesMatrix';
import PhaseGateTracker from '../components/PhaseGateTracker';
import EstimationStepper, { EstimationStep } from '../components/EstimationStepper';
import { TeamMember } from '../components/TeamBuilder';
import AddEquipmentModal from '../components/AddEquipmentModal';
import AddDeliverableModal from '../components/AddDeliverableModal';
import DeliverableConfigModal from '../components/DeliverableConfigModal';
import PlanningHub from '../components/PlanningHub';
import WorkOrganization from '../components/WorkOrganization';
import type {
  ProjectSize,
  ClientProfile,
  ComplexityFactors as ComplexityFactorsType,
  EstimationRequest,
  EstimationResponse,
  Project,
  ProjectPhase,
  CostCalculationRequest,
  CostCalculationResponse,
  Company,
  RateSheet,
  Equipment,
  IssueState,
  DeliverableDependency,
  EquipmentTemplateKey,
} from '../types';
import { EQUIPMENT_TEMPLATES } from '../config/equipmentTemplates';
import { getRecommendedDependencies } from '../config/deliverableDependencies';

export default function ProjectEstimation() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [projectSize, setProjectSize] = useState<ProjectSize>('MEDIUM');
  const [clientProfile, setClientProfile] = useState<ClientProfile>('TYPE_B');
  const [complexityFactors, setComplexityFactors] = useState<ComplexityFactorsType>({});
  const [contingency, setContingency] = useState(15);
  const [overhead, setOverhead] = useState(10);
  const [estimation, setEstimation] = useState<EstimationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [autoCalculate, setAutoCalculate] = useState(true);
  const [currentStep, setCurrentStep] = useState<EstimationStep>('setup');
  const [completedSteps, setCompletedSteps] = useState<EstimationStep[]>([]);
  const [selectedDisciplines, setSelectedDisciplines] = useState<string[]>([]);
  const [deliverables, setDeliverables] = useState<any[]>([]);
  const [deliverablesTotal, setDeliverablesTotal] = useState<number>(0);
  const [deliverablesLoaded, setDeliverablesLoaded] = useState<boolean>(false);
  const [costData, setCostData] = useState<CostCalculationResponse | null>(null);
  const [costLoading, setCostLoading] = useState(false);
  const [projectTeam, setProjectTeam] = useState<TeamMember[]>([]);

  // Client and Rate Sheet state
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [rateSheets, setRateSheets] = useState<RateSheet[]>([]);
  const [selectedRateSheetId, setSelectedRateSheetId] = useState<string>('');

  // Save/Load state
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Confirmation dialog state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showEquipmentDisableDialog, setShowEquipmentDisableDialog] = useState(false);
  const [disciplineToRemove, setDisciplineToRemove] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Equipment-driven estimation state
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [showAddEquipmentModal, setShowAddEquipmentModal] = useState(false);
  const [showAddDeliverableModal, setShowAddDeliverableModal] = useState(false);
  const [useEquipmentMode, setUseEquipmentMode] = useState(false);
  const [configDeliverable, setConfigDeliverable] = useState<any | null>(null);
  const [selectedDeliverableIds, setSelectedDeliverableIds] = useState<Set<string>>(new Set());

  // Load companies on mount
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const companiesList = await companiesApi.list(undefined, true);
        setCompanies(companiesList);
      } catch (error) {
        console.error('Failed to load companies:', error);
      }
    };
    loadCompanies();
  }, []);

  // Load rate sheets when company is selected and populate contingency/complexity
  useEffect(() => {
    const loadRateSheets = async () => {
      if (selectedCompanyId) {
        try {
          // Get company details for contingency and complexity
          const company = await companiesApi.get(selectedCompanyId);

          // Auto-populate contingency from company
          if (company.base_contingency !== undefined && company.base_contingency !== null) {
            setContingency(company.base_contingency);
          }

          // Auto-populate complexity factors from company complexity rating
          if (company.client_complexity !== undefined && company.client_complexity !== null) {
            // Map client_complexity (1-10) to complexity factors
            // Higher complexity = more challenging project conditions
            const complexityLevel = company.client_complexity;
            const newComplexityFactors: ComplexityFactorsType = {};

            // Map complexity to factor values based on scale
            if (complexityLevel >= 7) {
              // High complexity client (7-10)
              newComplexityFactors.regulatory_requirements = 'high';
              newComplexityFactors.site_access = 'difficult';
              newComplexityFactors.documentation_requirements = 'extensive';
            } else if (complexityLevel >= 4) {
              // Medium complexity client (4-6)
              newComplexityFactors.regulatory_requirements = 'medium';
              newComplexityFactors.site_access = 'moderate';
              newComplexityFactors.documentation_requirements = 'standard';
            } else {
              // Low complexity client (1-3)
              newComplexityFactors.regulatory_requirements = 'low';
              newComplexityFactors.site_access = 'easy';
              newComplexityFactors.documentation_requirements = 'minimal';
            }

            setComplexityFactors(newComplexityFactors);
          }

          // Load rate sheets
          const sheets = await rateSheetsApi.list(selectedCompanyId, true);
          setRateSheets(sheets);
          // Auto-select default rate sheet if available
          const defaultSheet = sheets.find(s => s.is_default);
          if (defaultSheet) {
            setSelectedRateSheetId(defaultSheet.id);
          } else if (sheets.length > 0) {
            setSelectedRateSheetId(sheets[0].id);
          }
        } catch (error) {
          console.error('Failed to load company data and rate sheets:', error);
          setRateSheets([]);
        }
      } else {
        setRateSheets([]);
        setSelectedRateSheetId('');
      }
    };
    loadRateSheets();
  }, [selectedCompanyId]);

  // Load project if editing
  useEffect(() => {
    if (id) {
      projectsApi.get(id).then((data) => {
        // Redirect campaigns to campaign management page
        if (data.work_type === 'CAMPAIGN') {
          navigate(`/campaign/${id}`);
          return;
        }

        setProject(data);
        setProjectSize(data.size);
        setClientProfile(data.client_profile);
        setComplexityFactors(data.complexity_factors || {});
        setContingency(data.contingency_percent);
        setOverhead(data.overhead_percent || 10);
        setSelectedDisciplines(data.selected_disciplines || []);
        setLastSaved(data.updated_at ? new Date(data.updated_at) : null);

        // Load equipment and deliverables if they exist
        if (data.equipment_list && data.equipment_list.length > 0) {
          setEquipmentList(data.equipment_list);
          setUseEquipmentMode(true);
        }
        if (data.deliverables_config && data.deliverables_config.length > 0) {
          // Ensure discipline field and ID are populated for loaded deliverables
          const deliverablesWithDiscipline = data.deliverables_config.map((deliv: any, idx: number) => {
            let updatedDeliv = { ...deliv };

            // Ensure ID exists
            if (!updatedDeliv.id) {
              if (deliv.equipment_id) {
                updatedDeliv.id = `deliv-${deliv.equipment_id}-${deliv.name.replace(/\s+/g, '-')}`;
              } else {
                updatedDeliv.id = `deliv-${idx}-${deliv.name.replace(/\s+/g, '-')}`;
              }
            }

            // Ensure discipline exists
            if (!updatedDeliv.discipline && deliv.equipment_id && data.equipment_list) {
              // Try to find the equipment and re-populate discipline from template
              const equipment = data.equipment_list.find((eq: any) => eq.id === deliv.equipment_id);
              if (equipment) {
                const template = EQUIPMENT_TEMPLATES[equipment.templateKey as EquipmentTemplateKey];
                const delivTemplate = template?.deliverables.find(dt => dt.name === deliv.name);
                if (delivTemplate) {
                  updatedDeliv.discipline = delivTemplate.discipline;
                }
              }
            }

            return updatedDeliv;
          });
          setDeliverables(deliverablesWithDiscipline);
        }

        // Set company and rate sheet if available
        if (data.company_id) {
          setSelectedCompanyId(data.company_id);
        }
        if (data.rate_sheet_id) {
          setSelectedRateSheetId(data.rate_sheet_id);
        }
      });
    }
  }, [id, navigate]);

  // Track changes to mark as unsaved
  useEffect(() => {
    if (project) {
      setHasUnsavedChanges(true);
    }
  }, [projectSize, clientProfile, complexityFactors, contingency, overhead, selectedDisciplines, deliverables, projectTeam]);

  // Auto-calculate project size based on total hours
  useEffect(() => {
    if (estimation?.total_hours) {
      const hours = estimation.total_hours;
      let newSize: ProjectSize;

      if (hours < 500) {
        newSize = 'SMALL';
      } else if (hours <= 2000) {
        newSize = 'MEDIUM';
      } else {
        newSize = 'LARGE';
      }

      if (newSize !== projectSize) {
        setProjectSize(newSize);
      }
    }
  }, [estimation?.total_hours]);

  // Auto-calculate when inputs change
  useEffect(() => {
    if (autoCalculate) {
      calculateEstimation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectSize, clientProfile, complexityFactors, contingency, overhead, deliverablesTotal, autoCalculate]);

  const calculateEstimation = async () => {
    setLoading(true);
    try {
      const request: EstimationRequest = {
        project_size: projectSize,
        complexity_factors: complexityFactors,
        client_profile: clientProfile,
        resource_availability: { engineer: 100 },
        contingency_percent: contingency,
        overhead_percent: overhead,
        base_hours_override: deliverablesTotal > 0 ? deliverablesTotal : undefined,
      };

      console.log('Estimation request:', request);
      console.log('Deliverables total:', deliverablesTotal);

      const result = id
        ? await estimationApi.calculate(id, request)
        : await estimationApi.quickEstimate(request);

      setEstimation(result);
    } catch (error) {
      console.error('Estimation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate costs when deliverables change
  const calculateCosts = async () => {
    if (deliverables.length === 0) {
      setCostData(null);
      return;
    }

    setCostLoading(true);
    try {
      const request: CostCalculationRequest = {
        deliverables: deliverables.map(d => ({
          name: d.name,
          hours: d.adjusted_hours || d.base_hours || 0,
        })),
      };

      const result = await estimationApi.calculateCosts(request);
      setCostData(result);
      console.log('Cost calculation result:', result);
    } catch (error) {
      console.error('Cost calculation failed:', error);
    } finally {
      setCostLoading(false);
    }
  };

  // Auto-calculate costs when deliverables change
  useEffect(() => {
    console.log('Deliverables changed:', deliverables.length, 'deliverables');
    if (deliverables.length > 0) {
      console.log('Calling calculateCosts...');
      calculateCosts();
    } else {
      console.log('No deliverables to calculate costs for');
      setCostData(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deliverables]);

  // Auto-generate deliverables when equipment list changes (in equipment mode)
  useEffect(() => {
    if (!useEquipmentMode || equipmentList.length === 0) {
      return;
    }

    const generatedDeliverables: any[] = [];

    equipmentList.forEach((equipment) => {
      const template = EQUIPMENT_TEMPLATES[equipment.templateKey];
      const sizeFactor = template.sizeFactors[equipment.size];
      const complexityFactor = template.complexityFactors[equipment.complexity];

      template.deliverables.forEach((delivTemplate) => {
        const baseHours = Math.round(
          delivTemplate.baseHours * sizeFactor * complexityFactor
        );

        generatedDeliverables.push({
          id: `deliv-${equipment.id}-${delivTemplate.name.replace(/\s+/g, '-')}`,
          name: delivTemplate.name,
          discipline: delivTemplate.discipline,
          equipment_tag: equipment.tag,
          equipment_id: equipment.id,
          base_hours: baseHours,
          adjusted_hours: baseHours,
          status: 'Not Started',
          dependencies: [],
          issue_states: ['IFR', 'IFC'],
          review_cycles: 1,
          rework_factor: 25,
        });
      });
    });

    // Auto-apply dependency rules
    generatedDeliverables.forEach((deliv) => {
      const equipment = equipmentList.find(e => e.id === deliv.equipment_id);
      const recommendedPrereqs = getRecommendedDependencies(
        deliv.name,
        equipment?.templateKey
      );

      console.log(`Dependencies for ${deliv.name}:`, recommendedPrereqs);

      const dependencies: any[] = [];

      recommendedPrereqs.forEach((prereqName) => {
        // Find matching deliverable(s) by name
        const prereqDelivs = generatedDeliverables.filter(d => d.name === prereqName);
        console.log(`  Found ${prereqDelivs.length} matches for prerequisite "${prereqName}"`);

        prereqDelivs.forEach(prereqDeliv => {
          // Avoid self-dependencies
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

    setDeliverables(generatedDeliverables);

    // Calculate total hours
    const total = generatedDeliverables.reduce((sum, d) => sum + (d.base_hours || 0), 0);
    setDeliverablesTotal(total);
  }, [equipmentList, useEquipmentMode]);

  // Handler for saving deliverable configuration
  const handleSaveDeliverableConfig = (updates: Partial<any>) => {
    if (!configDeliverable) return;

    setDeliverables((prev) =>
      prev.map((d) =>
        d.id === configDeliverable.id
          ? { ...d, ...updates }
          : d
      )
    );
    setConfigDeliverable(null);
  };

  // Deliverable selection handlers
  const handleToggleDeliverable = (delivId: string) => {
    console.log('Toggle deliverable clicked:', delivId);
    setSelectedDeliverableIds((prev) => {
      console.log('Current selected IDs:', Array.from(prev));
      const newSet = new Set(prev);
      if (newSet.has(delivId)) {
        newSet.delete(delivId);
        console.log('Removed from selection');
      } else {
        newSet.add(delivId);
        console.log('Added to selection');
      }
      console.log('New selected IDs:', Array.from(newSet));
      return newSet;
    });
  };

  const handleToggleAllDeliverables = (delivIds: string[]) => {
    setSelectedDeliverableIds((prev) => {
      const allSelected = delivIds.every(id => prev.has(id));
      if (allSelected) {
        // Deselect all
        const newSet = new Set(prev);
        delivIds.forEach(id => newSet.delete(id));
        return newSet;
      } else {
        // Select all
        return new Set([...prev, ...delivIds]);
      }
    });
  };

  const handleDeleteSelected = () => {
    console.log('Delete button clicked');
    console.log('Selected IDs:', Array.from(selectedDeliverableIds));
    console.log('Current deliverables count:', deliverables.length);

    if (selectedDeliverableIds.size === 0) {
      console.log('No deliverables selected, returning');
      return;
    }

    if (confirm(`Delete ${selectedDeliverableIds.size} selected deliverable${selectedDeliverableIds.size > 1 ? 's' : ''}?`)) {
      console.log('User confirmed deletion');
      const remainingDeliverables = deliverables.filter(d => {
        const shouldKeep = !selectedDeliverableIds.has(d.id);
        console.log(`Deliverable ${d.id}: ${shouldKeep ? 'keeping' : 'deleting'}`);
        return shouldKeep;
      });
      console.log('Remaining deliverables count:', remainingDeliverables.length);
      setDeliverables(remainingDeliverables);
      setSelectedDeliverableIds(new Set());
    } else {
      console.log('User cancelled deletion');
    }
  };

  const handleSaveProject = async (showAlert = true) => {
    if (!project) return;

    setIsSaving(true);
    try {
      await projectsApi.update(project.id, {
        size: projectSize,
        client_profile: clientProfile,
        complexity_factors: complexityFactors,
        contingency_percent: contingency,
        overhead_percent: overhead,
        company_id: selectedCompanyId || undefined,
        rate_sheet_id: selectedRateSheetId || undefined,
        selected_disciplines: selectedDisciplines,
        equipment_list: equipmentList,
        deliverables_config: deliverables,
      });
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      if (showAlert) {
        alert('Project saved successfully!');
      }
    } catch (error) {
      console.error('Save failed:', error);
      if (showAlert) {
        alert('Failed to save project');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save every 2 minutes
  useEffect(() => {
    if (!project || !hasUnsavedChanges) return;

    const autoSaveInterval = setInterval(() => {
      handleSaveProject(false); // Silent save
    }, 2 * 60 * 1000); // 2 minutes

    return () => clearInterval(autoSaveInterval);
  }, [project, hasUnsavedChanges]);

  const handlePhaseChange = async (phase: ProjectPhase) => {
    if (!project) return;

    try {
      await projectsApi.update(project.id, {
        current_phase: phase,
      });
      // Reload project to get updated data
      const updatedProject = await projectsApi.get(project.id);
      setProject(updatedProject);
    } catch (error) {
      console.error('Phase update failed:', error);
      alert('Failed to update phase');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-gray-100 border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-start">
            <div>
              <button
                onClick={() => navigate('/')}
                className="text-blue-600 hover:text-blue-800 mb-2 inline-block text-sm"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                {project ? project.name : 'Quick Estimation'}
                {hasUnsavedChanges && (
                  <span className="ml-3 text-sm font-normal text-amber-600">● Unsaved changes</span>
                )}
                {isSaving && (
                  <span className="ml-3 text-sm font-normal text-blue-600">Saving...</span>
                )}
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Configure project parameters and see real-time calculations
                {lastSaved && (
                  <span className="ml-2 text-xs text-gray-500">
                    • Last saved: {lastSaved.toLocaleTimeString()}
                  </span>
                )}
              </p>
            </div>
            <div className="flex flex-col items-end gap-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setShowLoadModal(true)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold"
                >
                  📂 Load Project
                </button>
                {project && (
                  <button
                    onClick={() => handleSaveProject(true)}
                    disabled={isSaving}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:opacity-50"
                  >
                    💾 Save Project
                  </button>
                )}
                {!project && (
                  <button
                    onClick={() => setShowSaveModal(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                  >
                    💾 Save As New
                  </button>
                )}
              </div>

              {/* Compact Workflow Progress */}
              <div className="relative flex gap-2">
                {/* Progress Line */}
                <div className="absolute top-3 left-0 right-0 h-0.5 bg-gray-300">
                  <div
                    className="h-full bg-blue-500 transition-all duration-500"
                    style={{
                      width: `${(['setup', 'deliverables', 'planning', 'organization', 'summary'].findIndex(s => s === currentStep) / 4) * 100}%`
                    }}
                  />
                </div>

                {/* Step Circles */}
                {[
                  { key: 'setup', label: 'Setup' },
                  { key: 'deliverables', label: 'Deliverables' },
                  { key: 'planning', label: 'Planning' },
                  { key: 'organization', label: 'Organization' },
                  { key: 'summary', label: 'Summary' },
                ].map((step, index) => {
                  const isCurrent = currentStep === step.key;
                  const isCompleted = completedSteps.includes(step.key as EstimationStep);
                  const allSteps: EstimationStep[] = ['setup', 'deliverables', 'planning', 'organization', 'summary'];
                  const stepIndex = allSteps.findIndex(s => s === currentStep);
                  const isPast = index < stepIndex;

                  return (
                    <button
                      key={step.key}
                      onClick={() => setCurrentStep(step.key as EstimationStep)}
                      className="relative z-10 group"
                      title={step.label}
                    >
                      <div
                        className={`
                          w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all border-2 bg-white
                          ${isCurrent
                            ? 'border-blue-500 text-blue-600 scale-110 shadow-md'
                            : isPast || isCompleted
                            ? 'border-green-500 text-green-600'
                            : 'border-gray-300 text-gray-400 group-hover:border-gray-400'
                          }
                        `}
                      >
                        {isCompleted ? (
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : (
                          index + 1
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* Real-time Tracking Boxes */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {/* Total Hours */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow p-4 text-white">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium opacity-90">Total Hours</span>
              <span className="text-lg">⏱️</span>
            </div>
            <div className="text-2xl font-bold">
              {estimation ? estimation.total_hours.toLocaleString() : '—'}
            </div>
            <div className="text-xs opacity-75 mt-1">
              {estimation ? `Base: ${estimation.base_hours.toLocaleString()}h` : 'Not calculated'}
            </div>
          </div>

          {/* Duration */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow p-4 text-white">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium opacity-90">Duration</span>
              <span className="text-lg">📅</span>
            </div>
            <div className="text-2xl font-bold">
              {estimation ? `${estimation.duration_weeks}w` : '—'}
            </div>
            <div className="text-xs opacity-75 mt-1">
              {estimation ? 'Est. timeline' : 'Not calculated'}
            </div>
          </div>

          {/* Total Cost */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow p-4 text-white">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium opacity-90">Total Cost</span>
              <span className="text-lg">💰</span>
            </div>
            <div className="text-2xl font-bold">
              {costData ? `$${costData.summary.total_cost.toLocaleString()}` : '—'}
            </div>
            <div className="text-xs opacity-75 mt-1">
              {costData ? `$${Math.round(costData.summary.average_cost_per_hour)}/h` : 'Add deliverables'}
            </div>
          </div>

          {/* Confidence */}
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg shadow p-4 text-white">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium opacity-90">Confidence</span>
              <span className="text-lg">📊</span>
            </div>
            <div className="text-2xl font-bold">
              {estimation ? `${Math.round(estimation.confidence_score)}%` : '—'}
            </div>
            <div className="text-xs opacity-75 mt-1">
              {estimation ? estimation.confidence_level.replace('_', ' ').toUpperCase() : 'Not calculated'}
            </div>
          </div>
        </div>

        {/* Phase-Gate Tracker - Only for Phase-Gate Projects */}
        {project?.work_type === 'PHASE_GATE' && (
          <div className="mb-6">
            <PhaseGateTracker
              currentPhase={project?.current_phase}
              phaseCompletion={project?.phase_completion}
              gateApprovals={project?.gate_approvals}
              onPhaseChange={handlePhaseChange}
            />
          </div>
        )}

        {/* Estimation Stepper */}
        <EstimationStepper
          currentStep={currentStep}
          onStepChange={setCurrentStep}
          completedSteps={completedSteps}
        />

        {/* Step Content */}
        <div className="space-y-5">
          {/* Step 1: Setup */}
          {currentStep === 'setup' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Client & Rate Sheet Selection */}
                <div className="bg-white rounded-lg shadow p-3">
                  <h3 className="text-sm font-semibold mb-2">Client & Rate Sheet</h3>

                  {/* Client Selection */}
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Client</label>
                    <select
                      value={selectedCompanyId}
                      onChange={(e) => setSelectedCompanyId(e.target.value)}
                      className="w-full p-1.5 text-xs border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    >
                      <option value="">Select a client...</option>
                      {companies.map((company) => (
                        <option key={company.id} value={company.id}>
                          {company.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Rate Sheet Selection */}
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Rate Sheet</label>
                    {!selectedCompanyId ? (
                      <div className="p-2 bg-gray-50 border-2 border-gray-200 rounded-lg text-xs text-gray-500">
                        Select a client first
                      </div>
                    ) : rateSheets.length === 0 ? (
                      <button
                        onClick={() => navigate('/client-management', {
                          state: {
                            companyId: selectedCompanyId,
                            returnTo: id ? `/project/${id}` : '/quick-estimate',
                            returnLabel: project?.name || 'Project Estimation'
                          }
                        })}
                        className="w-full p-2 bg-blue-50 border-2 border-blue-300 text-blue-700 rounded-lg hover:bg-blue-100 text-xs font-semibold transition-colors"
                      >
                        + Add Rate Sheet
                      </button>
                    ) : (
                      <select
                        value={selectedRateSheetId}
                        onChange={(e) => setSelectedRateSheetId(e.target.value)}
                        className="w-full p-1.5 text-xs border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                      >
                        {rateSheets.map((sheet) => (
                          <option key={sheet.id} value={sheet.id}>
                            {sheet.name} {sheet.is_default ? '(Default)' : ''}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="my-3 border-t border-gray-300"></div>

                  {/* Equipment-Driven Mode Toggle */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Estimation Mode</label>
                    <button
                      onClick={() => {
                        const enabled = !useEquipmentMode;
                        if (!enabled) {
                          // Always show confirmation when disabling
                          setShowEquipmentDisableDialog(true);
                        } else {
                          setUseEquipmentMode(enabled);
                        }
                      }}
                      className={`w-full flex items-center gap-2 p-2 rounded-lg border-2 cursor-pointer transition-all ${
                        useEquipmentMode
                          ? 'border-green-500 bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md'
                          : 'border-gray-300 bg-white hover:border-blue-400 hover:shadow'
                      }`}
                    >
                      <span className="text-base">{useEquipmentMode ? '✓' : '⚙️'}</span>
                      <span className={`text-xs font-medium flex-1 text-left ${
                        useEquipmentMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        Equipment-Driven Selection: {useEquipmentMode ? 'ENABLED' : 'Off'}
                      </span>
                    </button>
                  </div>

                </div>

                {/* Disciplines Selection */}
                <div className="bg-white rounded-lg shadow p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold">Disciplines</h3>
                    <button
                      onClick={() => {
                        const allDisciplines = ['Civil', 'Structural', 'Mechanical', 'Electrical', 'Instrumentation', 'Process', 'Piping', 'Survey', 'Controls', 'Architecture'];
                        setSelectedDisciplines(
                          selectedDisciplines.length === allDisciplines.length ? [] : allDisciplines
                        );
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      {selectedDisciplines.length === 10 ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  <div className="space-y-1">
                    {[
                      { value: 'Civil', icon: '🏗️' },
                      { value: 'Structural', icon: '🏛️' },
                      { value: 'Mechanical', icon: '⚙️' },
                      { value: 'Electrical', icon: '⚡' },
                      { value: 'Instrumentation', icon: '🔌' },
                      { value: 'Process', icon: '🔧' },
                      { value: 'Piping', icon: '🔩' },
                      { value: 'Survey', icon: '📐' },
                      { value: 'Controls', icon: '🎛️' },
                      { value: 'Architecture', icon: '🏢' },
                    ].map((discipline) => {
                      const isSelected = selectedDisciplines.includes(discipline.value);
                      return (
                        <button
                          key={discipline.value}
                          onClick={() => {
                            if (isSelected) {
                              if (selectedDisciplines.includes(discipline.value)) {
                                setDisciplineToRemove(discipline.value);
                                setShowConfirmDialog(true);
                              }
                            } else {
                              const newDisciplines = [...selectedDisciplines, discipline.value];
                              console.log('Adding discipline:', discipline.value, 'New array:', newDisciplines);
                              setSelectedDisciplines(newDisciplines);
                            }
                          }}
                          className={`w-full flex items-center gap-2 p-1.5 rounded-lg border-2 cursor-pointer transition-all ${
                            isSelected
                              ? 'border-blue-500 bg-blue-500 text-white shadow-md'
                              : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow'
                          }`}
                        >
                          <span className="text-base">{discipline.icon}</span>
                          <span className={`text-xs font-medium ${
                            isSelected ? 'text-white' : 'text-gray-900'
                          }`}>
                            {discipline.value}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {selectedDisciplines.length === 0 && (
                    <p className="mt-2 text-xs text-amber-600">
                      ⚠️ Select at least one discipline
                    </p>
                  )}
                </div>

                {/* Contingency & Overhead & Actions */}
                <div className="bg-white rounded-lg shadow p-3">
                  <h3 className="text-sm font-semibold mb-1">
                    Contingency: {contingency}%
                  </h3>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={contingency}
                    onChange={(e) => setContingency(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-600 mb-3">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                  </div>

                  <h3 className="text-sm font-semibold mb-1">
                    Overhead/Indirect: {overhead}%
                  </h3>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={overhead}
                    onChange={(e) => setOverhead(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-600 mb-3">
                    <span>0%</span>
                    <span>10%</span>
                    <span>20%</span>
                  </div>

                  <div className="pt-2 border-t border-gray-200">
                    <ComplexityFactors
                      factors={complexityFactors}
                      onChange={setComplexityFactors}
                      selectedDisciplines={selectedDisciplines}
                    />
                  </div>

                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-end">
                <button
                  onClick={() => setCurrentStep('deliverables')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                >
                  Next: Deliverables →
                </button>
              </div>
            </>
          )}

          {/* REMOVED: Old Step 2: Team - Now integrated into Planning step (PlanningHub component) */}
          {/* REMOVED: Old Step 2.5: Equipment - Now integrated into Setup step */}

          {/* Step 3: Deliverables */}
          {currentStep === 'deliverables' && (
            <>
              {deliverablesLoaded || deliverables.length > 0 ? (
                // Modern deliverables view with configuration
                <div className="space-y-6">
                  {/* Header Card */}
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h2 className="text-3xl font-bold mb-2">
                          {useEquipmentMode && equipmentList.length > 0 ? 'Generated Deliverables' : 'Project Deliverables'}
                        </h2>
                        <p className="text-blue-100">
                          {useEquipmentMode && equipmentList.length > 0
                            ? `${deliverables.length} deliverables from ${equipmentList.length} equipment items`
                            : `${deliverables.length} deliverables configured`
                          }
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => setShowAddDeliverableModal(true)}
                          className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-semibold text-sm flex items-center gap-2 transition-colors"
                        >
                          <span className="text-xl">+</span> Add Deliverable
                        </button>
                        {deliverables.length > 0 && (
                          <button
                            onClick={() => {
                              if (selectedDeliverableIds.size === deliverables.length) {
                                setSelectedDeliverableIds(new Set());
                              } else {
                                setSelectedDeliverableIds(new Set(deliverables.map(d => d.id)));
                              }
                            }}
                            className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-semibold text-sm transition-colors"
                          >
                            {selectedDeliverableIds.size === deliverables.length ? '☐ Deselect All' : '☑ Select All'}
                          </button>
                        )}
                        {selectedDeliverableIds.size > 0 && (
                          <button
                            onClick={handleDeleteSelected}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold text-sm flex items-center gap-2 transition-colors"
                          >
                            🗑️ Delete {selectedDeliverableIds.size} Selected
                          </button>
                        )}
                        <div className="text-right">
                          <div className="text-4xl font-bold">{deliverablesTotal}h</div>
                          <div className="text-blue-100 text-sm">Total Estimated Hours</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Deliverables grouped by Equipment or Discipline */}
                  <div className="space-y-4">
                    {useEquipmentMode && equipmentList.length > 0 ? (
                      // Group by Equipment
                      equipmentList.map((equipment) => {
                        const template = EQUIPMENT_TEMPLATES[equipment.templateKey];
                        const equipDeliverables = deliverables.filter(d => d.equipment_id === equipment.id);
                        const equipTotal = equipDeliverables.reduce((sum, d) => sum + (d.base_hours || 0), 0);

                        return (
                          <div key={equipment.id} className="bg-white rounded-lg shadow border-2 border-gray-200 overflow-hidden">
                            {/* Equipment Header */}
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b-2 border-gray-200">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="text-4xl">{template.icon}</div>
                                  <div>
                                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                      {equipment.tag}
                                      <span className="px-3 py-1 bg-white text-gray-700 text-sm font-semibold rounded-full border border-gray-300">
                                        {template.type}
                                      </span>
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                      {equipment.size} • {equipment.complexity} • {equipDeliverables.length} deliverables
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-3xl font-bold text-blue-600">{equipTotal}h</div>
                                  <div className="text-xs text-gray-500">Equipment Total</div>
                                </div>
                              </div>
                            </div>

                            {/* Deliverables Table */}
                            <div className="overflow-x-auto">
                              <table className="w-full">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-4 py-3 text-left">
                                      <input
                                        type="checkbox"
                                        checked={equipDeliverables.length > 0 && equipDeliverables.every(d => selectedDeliverableIds.has(d.id))}
                                        onChange={() => handleToggleAllDeliverables(equipDeliverables.map(d => d.id))}
                                        className="w-4 h-4 text-blue-600 rounded border-gray-300"
                                      />
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                      Deliverable
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                      Discipline
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                      Dependencies
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                      Issue States
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                      Hours
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                      Actions
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {equipDeliverables.map((deliv, idx) => {
                                    if (idx === 0) {
                                      console.log('Sample deliverable:', deliv);
                                      console.log('All deliverable IDs for this equipment:', equipDeliverables.map(d => d.id));
                                    }
                                    return (
                                    <tr key={idx} className="hover:bg-blue-50 transition-colors">
                                      <td className="px-4 py-4">
                                        <input
                                          type="checkbox"
                                          checked={selectedDeliverableIds.has(deliv.id)}
                                          onChange={() => handleToggleDeliverable(deliv.id)}
                                          className="w-4 h-4 text-blue-600 rounded border-gray-300"
                                        />
                                      </td>
                                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                        {deliv.name}
                                      </td>
                                      <td className="px-6 py-4 text-sm text-gray-600">
                                        {deliv.discipline ? (
                                          <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                                            {deliv.discipline}
                                          </span>
                                        ) : (
                                          <span className="px-2 py-1 bg-red-100 text-red-600 rounded text-xs font-medium">
                                            Missing
                                          </span>
                                        )}
                                      </td>
                                      <td className="px-6 py-4 text-center">
                                        {deliv.dependencies && deliv.dependencies.length > 0 ? (
                                          <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                                            {deliv.dependencies.length} dep{deliv.dependencies.length > 1 ? 's' : ''}
                                          </span>
                                        ) : (
                                          <span className="text-xs text-gray-400">None</span>
                                        )}
                                      </td>
                                      <td className="px-6 py-4 text-center">
                                        {deliv.issue_states && deliv.issue_states.length > 0 ? (
                                          <span className="text-xs text-gray-600">
                                            {deliv.issue_states.join(' → ')}
                                          </span>
                                        ) : (
                                          <span className="text-xs text-gray-400">Not configured</span>
                                        )}
                                      </td>
                                      <td className="px-6 py-4 text-sm text-right font-bold text-gray-900">
                                        {deliv.base_hours}h
                                      </td>
                                      <td className="px-6 py-4 text-right">
                                        <button
                                          onClick={() => setConfigDeliverable(deliv)}
                                          className="px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                                        >
                                          ⚙️ Configure
                                        </button>
                                      </td>
                                    </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      // Group by Category (traditional projects)
                      (() => {
                        // Group deliverables by category
                        const grouped = deliverables.reduce((acc, deliv) => {
                          const cat = deliv.category || 'Uncategorized';
                          if (!acc[cat]) acc[cat] = [];
                          acc[cat].push(deliv);
                          return acc;
                        }, {} as Record<string, any[]>);

                        return Object.entries(grouped).map(([category, categoryDelivs]) => {
                          const categoryTotal = categoryDelivs.reduce((sum, d) => sum + (d.base_hours || d.adjusted_hours || 0), 0);

                          return (
                            <div key={category} className="bg-white rounded-lg shadow border-2 border-gray-200 overflow-hidden">
                              {/* Category Header */}
                              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-3 border-b-2 border-gray-200">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h3 className="text-lg font-bold text-gray-900">{category}</h3>
                                    <p className="text-xs text-gray-600 mt-0.5">
                                      {categoryDelivs.length} deliverable{categoryDelivs.length > 1 ? 's' : ''}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-2xl font-bold text-blue-600">{categoryTotal}h</div>
                                    <div className="text-xs text-gray-500">Category Total</div>
                                  </div>
                                </div>
                              </div>

                              {/* Deliverables Table */}
                              <div className="overflow-x-auto">
                                <table className="w-full">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="px-4 py-3 text-left">
                                        <input
                                          type="checkbox"
                                          checked={categoryDelivs.length > 0 && categoryDelivs.every(d => selectedDeliverableIds.has(d.id))}
                                          onChange={() => handleToggleAllDeliverables(categoryDelivs.map(d => d.id))}
                                          className="w-4 h-4 text-blue-600 rounded border-gray-300"
                                        />
                                      </th>
                                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Deliverable
                                      </th>
                                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Discipline
                                      </th>
                                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Dependencies
                                      </th>
                                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Issue States
                                      </th>
                                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Hours
                                      </th>
                                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Actions
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    {categoryDelivs.map((deliv, idx) => (
                                      <tr key={idx} className="hover:bg-blue-50 transition-colors">
                                        <td className="px-4 py-4">
                                          <input
                                            type="checkbox"
                                            checked={selectedDeliverableIds.has(deliv.id)}
                                            onChange={() => handleToggleDeliverable(deliv.id)}
                                            className="w-4 h-4 text-blue-600 rounded border-gray-300"
                                          />
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                          {deliv.name}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                          <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                                            {deliv.discipline}
                                          </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                          {deliv.dependencies && deliv.dependencies.length > 0 ? (
                                            <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                                              {deliv.dependencies.length} dep{deliv.dependencies.length > 1 ? 's' : ''}
                                            </span>
                                          ) : (
                                            <span className="text-xs text-gray-400">None</span>
                                          )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                          {deliv.issue_states && deliv.issue_states.length > 0 ? (
                                            <span className="text-xs text-gray-600">
                                              {deliv.issue_states.join(' → ')}
                                            </span>
                                          ) : (
                                            <span className="text-xs text-gray-400">Not configured</span>
                                          )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-right font-bold text-gray-900">
                                          {deliv.base_hours || deliv.adjusted_hours || 0}h
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                          <button
                                            onClick={() => setConfigDeliverable(deliv)}
                                            className="px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                                          >
                                            ⚙️ Configure
                                          </button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          );
                        });
                      })()
                    )}
                  </div>

                  {/* Summary Card */}
                  <div className="bg-white rounded-lg shadow-lg border-2 border-blue-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Breakdown by Discipline</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {Object.entries(
                        deliverables.reduce((acc, d) => {
                          acc[d.discipline] = (acc[d.discipline] || 0) + d.base_hours;
                          return acc;
                        }, {} as Record<string, number>)
                      ).sort((a, b) => b[1] - a[1]).map(([discipline, hours]) => {
                        const percentage = ((hours / deliverablesTotal) * 100).toFixed(1);
                        return (
                          <div key={discipline} className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border-2 border-blue-200">
                            <div className="text-xs font-medium text-gray-600 mb-1">{discipline}</div>
                            <div className="text-2xl font-bold text-blue-600">{hours}h</div>
                            <div className="text-xs text-gray-500 mt-1">{percentage}% of total</div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Total Summary */}
                    <div className="mt-6 pt-6 border-t-2 border-gray-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-sm text-gray-600">Project Totals</div>
                          <div className="text-2xl font-bold text-gray-900 mt-1">
                            {equipmentList.length} Equipment • {deliverables.length} Deliverables
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">Total Estimated Hours</div>
                          <div className="text-4xl font-bold text-blue-600 mt-1">{deliverablesTotal}h</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Traditional template-based view
                <div className="bg-white rounded-lg shadow p-0">
                  <DeliverablesMatrix
                    projectSize={projectSize}
                    discipline={project?.discipline || 'MULTIDISCIPLINE'}
                    selectedDisciplines={selectedDisciplines}
                    projectTeam={projectTeam}
                    onLoadTemplate={(templateDeliverables) => {
                      // Ensure each deliverable has an ID
                      const deliverablesWithIds = templateDeliverables.map((d, idx) => ({
                        ...d,
                        id: d.id || `deliv-template-${idx}-${d.name.replace(/\s+/g, '-')}`,
                      }));
                      setDeliverables(deliverablesWithIds);
                      setDeliverablesLoaded(true);
                      const total = deliverablesWithIds.reduce((sum, d) => sum + (d.adjusted_hours || d.base_hours || 0), 0);
                      setDeliverablesTotal(total);
                    }}
                  />
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentStep(useEquipmentMode ? 'equipment' : 'setup')}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
                >
                  ← Back to {useEquipmentMode ? 'Equipment' : 'Setup'}
                </button>
                <button
                  onClick={() => setCurrentStep('planning')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                >
                  Next: Planning →
                </button>
              </div>
            </>
          )}

          {/* NEW Step 3: Planning (Resources + Team + Costs) */}
          {currentStep === 'planning' && (
            <>
              <PlanningHub
                deliverables={deliverables}
                totalHours={deliverablesTotal}
                durationWeeks={project?.duration_weeks || 12}
                projectTeam={projectTeam}
                onTeamChange={setProjectTeam}
                selectedCompanyId={selectedCompanyId}
                selectedRateSheetId={selectedRateSheetId}
                costData={costData}
                costLoading={costLoading}
                onCalculateCosts={calculateCosts}
                selectedDisciplines={selectedDisciplines}
                projectSize={projectSize}
              />

              {/* Navigation */}
              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setCurrentStep('deliverables')}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
                >
                  ← Back to Deliverables
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={() => setCurrentStep('summary')}
                    className="px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-semibold"
                  >
                    Skip to Summary →
                  </button>
                  <button
                    onClick={() => setCurrentStep('organization')}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                  >
                    Next: Work Organization →
                  </button>
                </div>
              </div>
            </>
          )}

          {/* NEW Step 4: Organization (WBS + RACI) */}
          {currentStep === 'organization' && (
            <>
              <WorkOrganization
                deliverables={deliverables}
                projectTeam={projectTeam}
              />

              {/* Navigation */}
              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setCurrentStep('planning')}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
                >
                  ← Back to Planning
                </button>
                <button
                  onClick={() => setCurrentStep('summary')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                >
                  Next: Summary →
                </button>
              </div>
            </>
          )}


          {/* Step 6: Summary */}
          {currentStep === 'summary' && (
            <>
              <EstimationSummary
                estimation={estimation}
                loading={loading}
                selectedDisciplines={selectedDisciplines}
                costData={costData}
              />

              {/* Navigation */}
              <div className="flex justify-start">
                <button
                  onClick={() => setCurrentStep('organization')}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
                >
                  ← Back to Organization
                </button>
              </div>
            </>
          )}
        </div>

        {/* Save As New Modal */}
        {showSaveModal && (
          <SaveProjectModal
            onClose={() => setShowSaveModal(false)}
            projectData={{
              size: projectSize,
              client_profile: clientProfile,
              complexity_factors: complexityFactors,
              contingency_percent: contingency,
              overhead_percent: overhead,
              selected_disciplines: selectedDisciplines,
              company_id: selectedCompanyId || undefined,
              rate_sheet_id: selectedRateSheetId || undefined,
            }}
            onSaved={(newProject) => {
              setProject(newProject);
              setShowSaveModal(false);
              navigate(`/project/${newProject.id}`);
            }}
          />
        )}

        {/* Load Project Modal */}
        {showLoadModal && (
          <LoadProjectModal
            onClose={() => setShowLoadModal(false)}
            onLoad={(projectId) => {
              setShowLoadModal(false);
              navigate(`/project/${projectId}`);
            }}
          />
        )}

        {/* Add Equipment Modal */}
        <AddEquipmentModal
          isOpen={showAddEquipmentModal}
          onClose={() => setShowAddEquipmentModal(false)}
          onAdd={(equipment) => {
            setEquipmentList([...equipmentList, equipment]);
          }}
        />

        {/* Add Deliverable Modal */}
        <AddDeliverableModal
          isOpen={showAddDeliverableModal}
          onClose={() => setShowAddDeliverableModal(false)}
          existingDeliverables={deliverables}
          onAdd={(deliverable) => {
            setDeliverables([...deliverables, deliverable]);
            setDeliverablesTotal(deliverablesTotal + deliverable.base_hours);
          }}
        />

        {/* Deliverable Configuration Modal */}
        {configDeliverable && (
          <DeliverableConfigModal
            isOpen={!!configDeliverable}
            deliverable={configDeliverable}
            allDeliverables={deliverables}
            onClose={() => setConfigDeliverable(null)}
            onSave={handleSaveDeliverableConfig}
          />
        )}

        {/* Confirmation Dialog - Remove Discipline */}
        <ConfirmDialog
          isOpen={showConfirmDialog}
          title="Remove Discipline"
          message={`Are you sure you want to remove ${disciplineToRemove}? This will clear all estimation data for this discipline.`}
          onConfirm={() => {
            if (disciplineToRemove) {
              setSelectedDisciplines(selectedDisciplines.filter(d => d !== disciplineToRemove));
              setShowConfirmDialog(false);
              setDisciplineToRemove(null);
            }
          }}
          onCancel={() => {
            setShowConfirmDialog(false);
            setDisciplineToRemove(null);
          }}
        />

        {/* Confirmation Dialog - Disable Equipment Mode */}
        <ConfirmDialog
          isOpen={showEquipmentDisableDialog}
          title="Disable Equipment-Driven Mode"
          message={equipmentList.length > 0
            ? `Disabling equipment-driven mode will remove all ${equipmentList.length} equipment items and their generated deliverables. Are you sure you want to continue?`
            : "Are you sure you want to disable equipment-driven mode? Any equipment data will be cleared."}
          onConfirm={() => {
            setUseEquipmentMode(false);
            setEquipmentList([]);
            setShowEquipmentDisableDialog(false);
          }}
          onCancel={() => {
            setShowEquipmentDisableDialog(false);
          }}
        />
      </div>
    </div>
  );
}

// Save Project Modal Component
interface SaveProjectModalProps {
  onClose: () => void;
  projectData: any;
  onSaved: (project: Project) => void;
}

function SaveProjectModal({ onClose, projectData, onSaved }: SaveProjectModalProps) {
  const [projectName, setProjectName] = useState('');
  const [clientName, setClientName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const newProject = await projectsApi.create({
        name: projectName,
        client_name: clientName,
        description,
        discipline: 'MULTIDISCIPLINE',
        project_type: 'STANDARD',
        ...projectData,
      });
      onSaved(newProject);
    } catch (error) {
      console.error('Failed to save project:', error);
      alert('Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Save Project</h2>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Project Name *
            </label>
            <input
              type="text"
              required
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              placeholder="Enter project name"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Client Name
            </label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              placeholder="Client name"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description/Notes
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              placeholder="Add notes about this project..."
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:opacity-50"
            >
              {saving ? 'Saving...' : '💾 Save Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Load Project Modal Component
interface LoadProjectModalProps {
  onClose: () => void;
  onLoad: (projectId: string) => void;
}

function LoadProjectModal({ onClose, onLoad }: LoadProjectModalProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await projectsApi.list();
        setProjects(data);
      } catch (error) {
        console.error('Failed to load projects:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProjects();
  }, []);

  const getStatusColor = (status: string) => {
    const colors = {
      DRAFT: 'bg-gray-100 text-gray-800',
      ESTIMATION: 'bg-blue-100 text-blue-800',
      REVIEW: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      ACTIVE: 'bg-purple-100 text-purple-800',
      COMPLETED: 'bg-green-200 text-green-900',
    };
    return colors[status as keyof typeof colors] || colors.DRAFT;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Load Project</h2>

        {loading ? (
          <div className="text-center py-8 text-gray-600">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-8 text-gray-600">No projects found</div>
        ) : (
          <div className="overflow-y-auto flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => onLoad(project.id)}
                  className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-lg cursor-pointer transition-all"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900">{project.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </div>

                  {project.client_name && (
                    <p className="text-sm text-gray-600 mb-2">Client: {project.client_name}</p>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <div>Size: <span className="font-semibold">{project.size}</span></div>
                    {project.total_hours && (
                      <div>Hours: <span className="font-semibold">{project.total_hours.toLocaleString()}</span></div>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t text-xs text-gray-500">
                    Updated {new Date(project.updated_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-6 mt-4 border-t">
          <button
            onClick={onClose}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// Confirmation Dialog Component
function ConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
        <p className="text-gray-700 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}