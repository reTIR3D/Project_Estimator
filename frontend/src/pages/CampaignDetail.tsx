import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectsApi } from '../services/api';
import CampaignOutputTemplate from '../components/CampaignOutputTemplate';
import ComplexityFactors from '../components/ComplexityFactors';
import TeamBuilder, { TeamMember } from '../components/TeamBuilder';
import type { Project, ClientProfile, ComplexityFactors as ComplexityFactorsType } from '../types';

type CampaignStep = 'details' | 'team' | 'schedule' | 'deliverables' | 'summary';

export default function CampaignDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<CampaignStep>('details');
  const [completedSteps, setCompletedSteps] = useState<CampaignStep[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Setup state
  const [selectedDisciplines, setSelectedDisciplines] = useState<string[]>([]);
  const [clientProfile, setClientProfile] = useState<ClientProfile>('TYPE_B');
  const [complexityFactors, setComplexityFactors] = useState<ComplexityFactorsType>({});
  const [contingency, setContingency] = useState(15);
  const [overhead, setOverhead] = useState(10);

  // Campaign-specific state
  const [duration, setDuration] = useState(12);
  const [perSiteDuration, setPerSiteDuration] = useState(4); // weeks
  const [siteCount, setSiteCount] = useState(1);
  const [serviceLevel, setServiceLevel] = useState('STANDARD');

  // Multi-team configuration
  const [teamCount, setTeamCount] = useState(1);
  const [deploymentStrategy, setDeploymentStrategy] = useState<'sequential' | 'parallel' | 'staggered'>('staggered');
  const [staggerWeeks, setStaggerWeeks] = useState(2);
  const [campaignTeam, setCampaignTeam] = useState<TeamMember[]>([]);

  useEffect(() => {
    if (id) {
      loadProject();
    }
  }, [id]);

  const loadProject = async () => {
    try {
      const data = await projectsApi.get(id!);

      // Redirect discrete projects back to project estimation
      if (data.work_type === 'DISCRETE_PROJECT') {
        navigate(`/project/${id}`);
        return;
      }

      setProject(data);
      setLastSaved(data.updated_at ? new Date(data.updated_at) : null);

      // Load existing values
      setSelectedDisciplines(data.selected_disciplines || []);
      setClientProfile(data.client_profile || 'TYPE_B');
      setComplexityFactors(data.complexity_factors || {});
      setContingency(data.contingency_percent || 15);
      setOverhead(data.overhead_percent || 10);

      // Load campaign-specific values
      setDuration(data.campaign_duration_months || 12);
      setSiteCount(data.campaign_site_count || 1);
      setServiceLevel(data.campaign_service_level || 'STANDARD');
    } catch (error) {
      console.error('Failed to load campaign:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProject = async (showAlert = true) => {
    if (!project) return;

    setIsSaving(true);
    try {
      await projectsApi.update(project.id, {
        selected_disciplines: selectedDisciplines,
        client_profile: clientProfile,
        complexity_factors: complexityFactors,
        contingency_percent: contingency,
        overhead_percent: overhead,
        campaign_duration_months: duration,
        campaign_site_count: siteCount,
        campaign_service_level: serviceLevel,
      });
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      if (showAlert) {
        alert('Campaign saved successfully!');
      }
    } catch (error) {
      console.error('Save failed:', error);
      if (showAlert) {
        alert('Failed to save campaign');
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading campaign...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Campaign not found</div>
      </div>
    );
  }

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
                {project.name}
                {hasUnsavedChanges && (
                  <span className="ml-3 text-sm font-normal text-amber-600">● Unsaved changes</span>
                )}
                {isSaving && (
                  <span className="ml-3 text-sm font-normal text-blue-600">Saving...</span>
                )}
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Campaign Management
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
                  onClick={() => handleSaveProject(true)}
                  disabled={isSaving}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:opacity-50"
                >
                  💾 Save Campaign
                </button>
              </div>

              {/* Compact Workflow Progress */}
              <div className="relative flex gap-2">
                {/* Progress Line */}
                <div className="absolute top-3 left-0 right-0 h-0.5 bg-gray-300">
                  <div
                    className="h-full bg-purple-500 transition-all duration-500"
                    style={{
                      width: `${(['details', 'team', 'schedule', 'deliverables', 'summary'].findIndex(s => s === currentStep) / 4) * 100}%`
                    }}
                  />
                </div>

                {/* Step Circles */}
                {[
                  { key: 'details', label: 'Details' },
                  { key: 'team', label: 'Team' },
                  { key: 'schedule', label: 'Schedule' },
                  { key: 'deliverables', label: 'Deliverables' },
                  { key: 'summary', label: 'Summary' },
                ].map((step, index) => {
                  const isCurrent = currentStep === step.key;
                  const isCompleted = completedSteps.includes(step.key as CampaignStep);
                  const stepIndex = ['details', 'team', 'schedule', 'deliverables', 'summary'].findIndex(s => s === currentStep);
                  const isPast = index < stepIndex;

                  return (
                    <button
                      key={step.key}
                      onClick={() => setCurrentStep(step.key as CampaignStep)}
                      className="relative z-10 group"
                      title={step.label}
                    >
                      <div
                        className={`
                          w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all border-2 bg-white
                          ${isCurrent
                            ? 'border-purple-500 text-purple-600 scale-110 shadow-md'
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
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow p-4 text-white">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium opacity-90">Total Hours</span>
              <span className="text-lg">⏱️</span>
            </div>
            <div className="text-2xl font-bold">
              {project.total_hours ? project.total_hours.toLocaleString() : '—'}
            </div>
            <div className="text-xs opacity-75 mt-1">
              {project.campaign_monthly_hours && Object.keys(project.campaign_monthly_hours).length > 0
                ? `${Object.keys(project.campaign_monthly_hours).length} months`
                : 'Not defined'}
            </div>
          </div>

          {/* Duration */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow p-4 text-white">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium opacity-90">Duration</span>
              <span className="text-lg">📅</span>
            </div>
            <div className="text-2xl font-bold">
              {duration}m
            </div>
            <div className="text-xs opacity-75 mt-1">
              Campaign length
            </div>
          </div>

          {/* Total Cost */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow p-4 text-white">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium opacity-90">Total Cost</span>
              <span className="text-lg">💰</span>
            </div>
            <div className="text-2xl font-bold">
              {project.total_cost ? `$${Number(project.total_cost).toLocaleString()}` : '—'}
            </div>
            <div className="text-xs opacity-75 mt-1">
              {project.campaign_pricing_model ? project.campaign_pricing_model.replace('_', ' ') : 'Not defined'}
            </div>
          </div>

          {/* Team Configuration */}
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg shadow p-4 text-white">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium opacity-90">Teams</span>
              <span className="text-lg">👥</span>
            </div>
            <div className="text-2xl font-bold">
              {teamCount} {teamCount === 1 ? 'Team' : 'Teams'}
            </div>
            <div className="text-xs opacity-75 mt-1">
              {Math.ceil(siteCount / teamCount)} sites per team
            </div>
          </div>
        </div>

        {/* Workflow Progress Stepper */}
        <div className="bg-white rounded-lg shadow p-5 mb-6">
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200">
              <div
                className="h-full bg-purple-500 transition-all duration-500"
                style={{
                  width: `${(['details', 'team', 'schedule', 'deliverables', 'summary'].findIndex(s => s === currentStep) / 4) * 100}%`
                }}
              />
            </div>

            {/* Steps */}
            <div className="relative flex justify-between">
              {[
                { key: 'details', label: 'Details' },
                { key: 'team', label: 'Team' },
                { key: 'schedule', label: 'Schedule' },
                { key: 'deliverables', label: 'Deliverables' },
                { key: 'summary', label: 'Summary' },
              ].map((step, index) => {
                const isCurrent = currentStep === step.key;
                const isCompleted = completedSteps.includes(step.key as CampaignStep);
                const stepIndex = ['details', 'team', 'schedule', 'deliverables', 'summary'].findIndex(s => s === currentStep);
                const isPast = index < stepIndex;

                return (
                  <button
                    key={step.key}
                    onClick={() => setCurrentStep(step.key as CampaignStep)}
                    className="flex flex-col items-center group relative z-10"
                    style={{ flex: 1 }}
                  >
                    {/* Circle */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all border-4 bg-white ${
                        isCurrent
                          ? 'border-purple-500 text-purple-600 scale-110 shadow-lg'
                          : isPast || isCompleted
                          ? 'border-green-500 text-green-600'
                          : 'border-gray-300 text-gray-400 group-hover:border-gray-400'
                      }`}
                    >
                      {isCompleted ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
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

                    {/* Label */}
                    <div className="mt-3 text-center">
                      <div
                        className={`text-sm font-semibold ${
                          isCurrent ? 'text-purple-600' : isPast || isCompleted ? 'text-gray-900' : 'text-gray-500'
                        }`}
                      >
                        {step.label}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Step 1: Campaign Setup */}
        {currentStep === 'details' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Campaign Info */}
              <div className="bg-white rounded-lg shadow p-3">
                <h3 className="text-sm font-semibold mb-2">Campaign Info</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Total Duration (months)
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setDuration(Math.max(1, duration - 1))}
                        className="w-8 h-8 flex items-center justify-center bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg font-bold transition-colors"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={duration}
                        onChange={(e) => setDuration(Math.max(1, Math.min(60, Number(e.target.value) || 1)))}
                        className="flex-1 p-1.5 text-center text-sm font-semibold border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                      />
                      <button
                        onClick={() => setDuration(Math.min(60, duration + 1))}
                        className="w-8 h-8 flex items-center justify-center bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg font-bold transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Per-Site Duration (weeks)
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPerSiteDuration(Math.max(1, perSiteDuration - 1))}
                        className="w-8 h-8 flex items-center justify-center bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg font-bold transition-colors"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="1"
                        max="52"
                        value={perSiteDuration}
                        onChange={(e) => setPerSiteDuration(Math.max(1, Math.min(52, Number(e.target.value) || 1)))}
                        className="flex-1 p-1.5 text-center text-sm font-semibold border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                      />
                      <button
                        onClick={() => setPerSiteDuration(Math.min(52, perSiteDuration + 1))}
                        className="w-8 h-8 flex items-center justify-center bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg font-bold transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Number of Sites
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSiteCount(Math.max(1, siteCount - 1))}
                        className="w-8 h-8 flex items-center justify-center bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg font-bold transition-colors"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="1"
                        max="500"
                        value={siteCount}
                        onChange={(e) => setSiteCount(Math.max(1, Math.min(500, Number(e.target.value) || 1)))}
                        className="flex-1 p-1.5 text-center text-sm font-semibold border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                      />
                      <button
                        onClick={() => setSiteCount(Math.min(500, siteCount + 1))}
                        className="w-8 h-8 flex items-center justify-center bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg font-bold transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Multi-Team Configuration */}
              <div className="bg-white rounded-lg shadow p-3">
                <h3 className="text-sm font-semibold mb-2">Multi-Team Setup</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Number of Teams
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setTeamCount(Math.max(1, teamCount - 1))}
                        className="w-8 h-8 flex items-center justify-center bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg font-bold transition-colors"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={teamCount}
                        onChange={(e) => setTeamCount(Math.max(1, Math.min(10, Number(e.target.value) || 1)))}
                        className="flex-1 p-1.5 text-center text-sm font-semibold border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                      />
                      <button
                        onClick={() => setTeamCount(Math.min(10, teamCount + 1))}
                        className="w-8 h-8 flex items-center justify-center bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg font-bold transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {Math.ceil(siteCount / teamCount)} sites per team
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">
                      Deployment Strategy
                    </label>
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          value="sequential"
                          checked={deploymentStrategy === 'sequential'}
                          onChange={(e) => setDeploymentStrategy(e.target.value as any)}
                          className="text-purple-600"
                        />
                        <span className="text-xs">Sequential (one after another)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          value="staggered"
                          checked={deploymentStrategy === 'staggered'}
                          onChange={(e) => setDeploymentStrategy(e.target.value as any)}
                          className="text-purple-600"
                        />
                        <span className="text-xs">Staggered (offset start)</span>
                      </label>
                      {deploymentStrategy === 'staggered' && (
                        <div className="ml-6 flex items-center gap-2">
                          <button
                            onClick={() => setStaggerWeeks(Math.max(1, staggerWeeks - 1))}
                            className="w-6 h-6 flex items-center justify-center bg-purple-50 hover:bg-purple-100 text-purple-700 rounded text-xs font-bold"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min="1"
                            max="12"
                            value={staggerWeeks}
                            onChange={(e) => setStaggerWeeks(Math.max(1, Math.min(12, Number(e.target.value) || 1)))}
                            className="w-12 p-1 text-center text-xs border border-gray-200 rounded focus:border-purple-500 focus:outline-none"
                          />
                          <button
                            onClick={() => setStaggerWeeks(Math.min(12, staggerWeeks + 1))}
                            className="w-6 h-6 flex items-center justify-center bg-purple-50 hover:bg-purple-100 text-purple-700 rounded text-xs font-bold"
                          >
                            +
                          </button>
                          <span className="text-xs text-gray-600">weeks</span>
                        </div>
                      )}
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          value="parallel"
                          checked={deploymentStrategy === 'parallel'}
                          onChange={(e) => setDeploymentStrategy(e.target.value as any)}
                          className="text-purple-600"
                        />
                        <span className="text-xs">Parallel (all start together)</span>
                      </label>
                    </div>
                  </div>
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
                    className="text-xs text-purple-600 hover:text-purple-800 font-semibold"
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
                            ? 'border-purple-500 bg-purple-500 text-white shadow-md'
                            : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow'
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
                  className="w-full p-1.5 text-xs border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none mb-2"
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

              {/* Contingency & Overhead */}
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
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-end">
              <button
                onClick={() => setCurrentStep('team')}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold"
              >
                Next: Team →
              </button>
            </div>
          </>
        )}

        {/* Step 2: Team Structure */}
        {currentStep === 'team' && (
          <>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Team Structure</h2>
              <p className="text-sm text-gray-600 mb-6">
                Define the standard team template (applied to all {teamCount} team{teamCount > 1 ? 's' : ''})
              </p>

              <TeamBuilder
                selectedDisciplines={selectedDisciplines}
                projectSize="MEDIUM"
                onTeamChange={setCampaignTeam}
                initialTeam={campaignTeam}
              />
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-6">
              <button
                onClick={() => setCurrentStep('details')}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
              >
                ← Back to Details
              </button>
              <button
                onClick={() => setCurrentStep('schedule')}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold"
              >
                Next: Schedule →
              </button>
            </div>
          </>
        )}

        {/* Step 3: Schedule */}
        {currentStep === 'schedule' && (
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Monthly Schedule</h2>
            <p className="text-sm text-gray-600 mb-6">Review monthly hour allocations</p>

            {project.campaign_monthly_hours && Object.keys(project.campaign_monthly_hours).length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Object.entries(project.campaign_monthly_hours).map(([month, hours]) => (
                  <div key={month} className="bg-purple-50 rounded-lg p-6 text-center">
                    <div className="text-sm font-semibold text-gray-600 mb-2">Month {month}</div>
                    <div className="text-3xl font-bold text-purple-600">{hours as number}</div>
                    <div className="text-xs text-gray-500 mt-1">hours</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>No monthly hours defined</p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <button
                onClick={() => setCurrentStep('team')}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold"
              >
                ← Back to Team
              </button>
              <button
                onClick={() => setCurrentStep('deliverables')}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold"
              >
                Next: Deliverables →
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Deliverables */}
        {currentStep === 'deliverables' && (
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Scheduled Deliverables</h2>
            <p className="text-sm text-gray-600 mb-6">Recurring and one-time deliverables</p>

            {project.campaign_scheduled_deliverables && project.campaign_scheduled_deliverables.length > 0 ? (
              <div className="space-y-3">
                {project.campaign_scheduled_deliverables.map((deliverable: any, index: number) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-6 flex justify-between items-center">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 text-lg">{deliverable.name}</div>
                      {deliverable.description && (
                        <div className="text-sm text-gray-600 mt-1">{deliverable.description}</div>
                      )}
                    </div>
                    <div className="text-right ml-6">
                      <div className="text-sm font-semibold text-purple-600 capitalize">
                        {deliverable.frequency || 'One-time'}
                      </div>
                      {deliverable.month && (
                        <div className="text-xs text-gray-500 mt-1">Month {deliverable.month}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>No deliverables scheduled</p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <button
                onClick={() => setCurrentStep('schedule')}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold"
              >
                ← Back
              </button>
              <button
                onClick={() => setCurrentStep('team')}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold"
              >
                Next: Team →
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Summary & Output */}
        {currentStep === 'summary' && (
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Campaign Summary</h2>
            <p className="text-sm text-gray-600 mb-6">Overview and output template</p>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-purple-50 rounded-lg p-6 text-center">
                <div className="text-sm font-semibold text-gray-600 mb-2">Total Hours</div>
                <div className="text-3xl font-bold text-purple-600">
                  {project.total_hours?.toLocaleString() || 0}
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-6 text-center">
                <div className="text-sm font-semibold text-gray-600 mb-2">Total Cost</div>
                <div className="text-3xl font-bold text-green-600">
                  ${project.total_cost?.toLocaleString() || 0}
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg p-6 text-center">
                <div className="text-sm font-semibold text-gray-600 mb-2">Status</div>
                <div className="text-3xl font-bold text-blue-600 capitalize">
                  {project.status}
                </div>
              </div>
            </div>

            {/* Output Template */}
            <div className="border-t pt-8">
              <CampaignOutputTemplate project={project} />
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <button
                onClick={() => setCurrentStep('deliverables')}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold"
              >
                ← Back to Deliverables
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
              >
                ✓ Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
