import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { estimationApi, projectsApi } from '../services/api';
import ComplexityFactors from '../components/ComplexityFactors';
import EstimationSummary from '../components/EstimationSummary';
import DeliverablesMatrix from '../components/DeliverablesMatrix';
import RACIMatrix from '../components/RACIMatrix';
import WBS from '../components/WBS';
import CostBreakdown from '../components/CostBreakdown';
import PhaseGateTracker from '../components/PhaseGateTracker';
import EstimationStepper, { EstimationStep } from '../components/EstimationStepper';
import TeamBuilder, { TeamMember } from '../components/TeamBuilder';
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
} from '../types';

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
  const [costData, setCostData] = useState<CostCalculationResponse | null>(null);
  const [costLoading, setCostLoading] = useState(false);
  const [projectTeam, setProjectTeam] = useState<TeamMember[]>([]);

  // Save/Load state
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Load project if editing
  useEffect(() => {
    if (id) {
      projectsApi.get(id).then((data) => {
        setProject(data);
        setProjectSize(data.size);
        setClientProfile(data.client_profile);
        setComplexityFactors(data.complexity_factors || {});
        setContingency(data.contingency_percent);
        setOverhead(data.overhead_percent || 10);
        setSelectedDisciplines(data.selected_disciplines || []);
        setLastSaved(data.updated_at ? new Date(data.updated_at) : null);
      });
    }
  }, [id]);

  // Track changes to mark as unsaved
  useEffect(() => {
    if (project) {
      setHasUnsavedChanges(true);
    }
  }, [projectSize, clientProfile, complexityFactors, contingency, overhead, selectedDisciplines, deliverables, projectTeam]);

  // Auto-calculate when inputs change
  useEffect(() => {
    if (autoCalculate) {
      calculateEstimation();
    }
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
    }
  }, [deliverables]);

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
        selected_disciplines: selectedDisciplines,
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
                      width: `${(['setup', 'team', 'deliverables', 'wbs', 'raci', 'costs', 'summary'].findIndex(s => s === currentStep) / 6) * 100}%`
                    }}
                  />
                </div>

                {/* Step Circles */}
                {[
                  { key: 'setup', label: 'Setup' },
                  { key: 'team', label: 'Team' },
                  { key: 'deliverables', label: 'Deliverables' },
                  { key: 'wbs', label: 'WBS' },
                  { key: 'raci', label: 'RACI' },
                  { key: 'costs', label: 'Costs' },
                  { key: 'summary', label: 'Summary' },
                ].map((step, index) => {
                  const isCurrent = currentStep === step.key;
                  const isCompleted = completedSteps.includes(step.key as EstimationStep);
                  const stepIndex = ['setup', 'team', 'deliverables', 'wbs', 'raci', 'costs', 'summary'].findIndex(s => s === currentStep);
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
        {projectSize === 'PHASE_GATE' && (
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Project Size */}
                <div className="bg-white rounded-lg shadow p-3">
                  <h3 className="text-sm font-semibold mb-2">Project Size</h3>
                  <div className="space-y-1.5">
                    {[
                      { value: 'SMALL', label: 'Small', hours: '< 500h' },
                      { value: 'MEDIUM', label: 'Medium', hours: '500-2000h' },
                      { value: 'LARGE', label: 'Large', hours: '> 2000h' },
                      { value: 'PHASE_GATE', label: 'Phase-Gate', hours: 'Phased delivery' },
                    ].map((size) => (
                      <button
                        key={size.value}
                        onClick={() => setProjectSize(size.value as ProjectSize)}
                        className={`w-full p-1.5 border-2 rounded-lg transition-all text-left ${
                          projectSize === size.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-semibold text-xs">{size.label}</div>
                        <div className="text-xs text-gray-600">{size.hours}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Disciplines Selection */}
                <div className="bg-white rounded-lg shadow p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold">Disciplines</h3>
                    <button
                      onClick={() => {
                        const allDisciplines = ['Mechanical', 'Process', 'Civil', 'Structural', 'Survey', 'Electrical/Instrumentation', 'Automation'];
                        setSelectedDisciplines(
                          selectedDisciplines.length === allDisciplines.length ? [] : allDisciplines
                        );
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      {selectedDisciplines.length === 7 ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  <div className="space-y-1">
                    {[
                      { value: 'Mechanical', icon: '⚙️' },
                      { value: 'Process', icon: '🔧' },
                      { value: 'Civil', icon: '🏗️' },
                      { value: 'Structural', icon: '🏛️' },
                      { value: 'Survey', icon: '📐' },
                      { value: 'Electrical/Instrumentation', icon: '⚡' },
                      { value: 'Automation', icon: '🤖' },
                    ].map((discipline) => {
                      const isSelected = selectedDisciplines.includes(discipline.value);
                      return (
                        <button
                          key={discipline.value}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedDisciplines(selectedDisciplines.filter(d => d !== discipline.value));
                            } else {
                              setSelectedDisciplines([...selectedDisciplines, discipline.value]);
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

                {/* Client Profile & Complexity Factors */}
                <div className="bg-white rounded-lg shadow p-3">
                  <h3 className="text-sm font-semibold mb-2">Client Profile</h3>
                  <select
                    value={clientProfile}
                    onChange={(e) => setClientProfile(e.target.value as ClientProfile)}
                    className="w-full p-1.5 text-xs border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none mb-2"
                  >
                    <option value="TYPE_A">Type A - Heavy Oversight (+40%)</option>
                    <option value="TYPE_B">Type B - Standard Process (baseline)</option>
                    <option value="TYPE_C">Type C - Minimal Oversight (-15%)</option>
                    <option value="NEW_CLIENT">New Client - Conservative (+25%)</option>
                  </select>

                  <div className="pt-2 border-t border-gray-200">
                    <ComplexityFactors factors={complexityFactors} onChange={setComplexityFactors} />
                  </div>
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
                    Overhead: {overhead}%
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
                    <h3 className="text-sm font-semibold mb-1.5">Actions</h3>
                    <div className="space-y-1.5">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={autoCalculate}
                          onChange={(e) => setAutoCalculate(e.target.checked)}
                          className="h-3.5 w-3.5 text-blue-600"
                        />
                        <span className="ml-2 text-xs">Auto-calculate</span>
                      </label>
                      {!autoCalculate && (
                        <button
                          onClick={calculateEstimation}
                          className="w-full px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Calculate
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-end">
                <button
                  onClick={() => setCurrentStep('team')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                >
                  Next: Team →
                </button>
              </div>
            </>
          )}

          {/* Step 2: Team */}
          {currentStep === 'team' && (
            <>
              <TeamBuilder
                selectedDisciplines={selectedDisciplines}
                projectSize={projectSize}
                onTeamChange={setProjectTeam}
                initialTeam={projectTeam}
              />

              {/* Navigation */}
              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setCurrentStep('setup')}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
                >
                  ← Back to Setup
                </button>
                <button
                  onClick={() => setCurrentStep('deliverables')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                >
                  Next: Deliverables →
                </button>
              </div>
            </>
          )}

          {/* Step 3: Deliverables */}
          {currentStep === 'deliverables' && (
            <>
              <div className="bg-white rounded-lg shadow p-0">
                <DeliverablesMatrix
                  projectSize={projectSize}
                  discipline={project?.discipline || 'MULTIDISCIPLINE'}
                  selectedDisciplines={selectedDisciplines}
                  projectTeam={projectTeam}
                  onLoadTemplate={(templateDeliverables) => {
                    setDeliverables(templateDeliverables);
                    const total = templateDeliverables.reduce((sum, d) => sum + (d.adjusted_hours || d.base_hours || 0), 0);
                    setDeliverablesTotal(total);
                  }}
                />
              </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentStep('setup')}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
                >
                  ← Back to Setup
                </button>
                <button
                  onClick={() => setCurrentStep('wbs')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                >
                  Next: Work Breakdown →
                </button>
              </div>
            </>
          )}

          {/* Step 3: WBS */}
          {currentStep === 'wbs' && (
            <>
              <div className="bg-white rounded-lg shadow p-6">
                <WBS deliverables={deliverables} />
              </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentStep('team')}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
                >
                  ← Back to Team
                </button>
                <button
                  onClick={() => setCurrentStep('raci')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                >
                  Next: RACI Matrix →
                </button>
              </div>
            </>
          )}

          {/* Step 4: RACI */}
          {currentStep === 'raci' && (
            <>
              <div className="bg-white rounded-lg shadow p-6">
                <RACIMatrix
                  deliverables={deliverables}
                  projectTeam={projectTeam.map(m => m.role)}
                />
              </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentStep('wbs')}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
                >
                  ← Back to WBS
                </button>
                <button
                  onClick={() => setCurrentStep('costs')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                >
                  Next: Cost Analysis →
                </button>
              </div>
            </>
          )}

          {/* Step 5: Costs */}
          {currentStep === 'costs' && (
            <>
              <CostBreakdown costData={costData} loading={costLoading} />

              {/* Navigation */}
              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentStep('raci')}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
                >
                  ← Back to RACI
                </button>
                <button
                  onClick={() => setCurrentStep('summary')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                >
                  View Summary →
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
                  onClick={() => setCurrentStep('costs')}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
                >
                  ← Back to Costs
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