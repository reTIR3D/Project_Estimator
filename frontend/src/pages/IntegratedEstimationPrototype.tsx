import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * INTEGRATED ESTIMATION PROTOTYPE
 *
 * This combines Equipment Builder + Deliverables Configurator into a complete workflow
 * showing how the two-axis model would work in production:
 *
 * Step 1: Project Setup (Client, Type, Complexity)
 * Step 2: Equipment List (Equipment → Auto-generate deliverables)
 * Step 3: Deliverable Configuration (Issue states, review cycles)
 * Step 4: Review & Export (Summary, WBS, costs)
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type ProjectType = 'PHASE_GATE' | 'FAST_TRACK' | 'CAMPAIGN';
type ClientProfile = 'TYPE_A' | 'TYPE_B' | 'TYPE_C';
type IssueState = 'IFD' | 'IFR' | 'IFA' | 'IFB' | 'IFC' | 'IFI' | 'IFP' | 'IFM';

interface Equipment {
  id: string;
  tag: string;
  templateKey: string;
  size: 'small' | 'medium' | 'large';
  complexity: 'simple' | 'standard' | 'complex';
  notes?: string;
}

interface DeliverableTemplate {
  name: string;
  discipline: string;
  baseHours: number;
  description?: string;
}

interface EquipmentTemplate {
  type: string;
  icon: string;
  description: string;
  deliverables: DeliverableTemplate[];
  complexityFactors: { simple: number; standard: number; complex: number };
  sizeFactors: { small: number; medium: number; large: number };
}

interface GeneratedDeliverable {
  id: string;
  name: string;
  discipline: string;
  baseHours: number;
  equipmentTag: string;
  equipmentType: string;

  // Configuration
  issueStates: IssueState[];
  reviewCycles: number;
  reworkFactor: number;

  // Calculated
  stateEffortHours: number;
  reviewReworkHours: number;
  totalHours: number;

  selected: boolean;
}

// ============================================================================
// EQUIPMENT TEMPLATES (Same as Equipment Builder)
// ============================================================================

const EQUIPMENT_TEMPLATES: { [key: string]: EquipmentTemplate } = {
  vessel: {
    type: 'Pressure Vessel',
    icon: '⚗️',
    description: 'Pressure vessels, reactors, receivers',
    deliverables: [
      { name: 'Process Datasheet', discipline: 'Process', baseHours: 16 },
      { name: 'Mechanical Datasheet', discipline: 'Mechanical', baseHours: 12 },
      { name: 'Pressure Calculations', discipline: 'Mechanical', baseHours: 20 },
      { name: 'Nozzle Orientation Drawing', discipline: 'Mechanical', baseHours: 16 },
      { name: 'Foundation Design', discipline: 'Civil', baseHours: 24 },
      { name: 'Instrumentation Hookup', discipline: 'Electrical/Instrumentation', baseHours: 8 },
      { name: 'Relief Valve Sizing', discipline: 'Safety', baseHours: 8 },
    ],
    complexityFactors: { simple: 0.8, standard: 1.0, complex: 1.4 },
    sizeFactors: { small: 0.8, medium: 1.0, large: 1.3 },
  },
  pump: {
    type: 'Centrifugal Pump',
    icon: '🔄',
    description: 'Centrifugal pumps, positive displacement',
    deliverables: [
      { name: 'Pump Datasheet', discipline: 'Process', baseHours: 12 },
      { name: 'Mechanical Seal Plan', discipline: 'Mechanical', baseHours: 8 },
      { name: 'Motor Specification', discipline: 'Electrical/Instrumentation', baseHours: 6 },
      { name: 'Alignment Procedure', discipline: 'Mechanical', baseHours: 4 },
      { name: 'Foundation Design', discipline: 'Civil', baseHours: 16 },
      { name: 'Vibration Analysis', discipline: 'Mechanical', baseHours: 12 },
    ],
    complexityFactors: { simple: 0.8, standard: 1.0, complex: 1.3 },
    sizeFactors: { small: 0.7, medium: 1.0, large: 1.2 },
  },
  heat_exchanger: {
    type: 'Heat Exchanger',
    icon: '🌡️',
    description: 'Shell & tube, plate, air coolers',
    deliverables: [
      { name: 'Thermal Datasheet', discipline: 'Process', baseHours: 20 },
      { name: 'Thermal Design Calculations', discipline: 'Process', baseHours: 16 },
      { name: 'Mechanical Specification', discipline: 'Mechanical', baseHours: 10 },
      { name: 'Tube Pulling Study', discipline: 'Mechanical', baseHours: 8 },
      { name: 'Foundation Design', discipline: 'Civil', baseHours: 20 },
      { name: 'Instrumentation Hookup', discipline: 'Electrical/Instrumentation', baseHours: 6 },
    ],
    complexityFactors: { simple: 0.9, standard: 1.0, complex: 1.3 },
    sizeFactors: { small: 0.8, medium: 1.0, large: 1.2 },
  },
};

// ============================================================================
// ISSUE STATE CONFIGURATIONS
// ============================================================================

const ISSUE_STATE_MULTIPLIERS: { [key in IssueState]: number } = {
  IFD: 0.4, IFR: 0.6, IFA: 0.7, IFB: 0.9, IFC: 1.0,
  IFI: 0.3, IFP: 0.8, IFM: 0.9,
};

// Project type determines default issue state progression
const PROJECT_TYPE_DEFAULTS = {
  PHASE_GATE: {
    issueStates: ['IFD', 'IFR', 'IFA', 'IFB', 'IFC'] as IssueState[],
    reviewCycles: 3,
    reworkFactor: 0.25,
  },
  FAST_TRACK: {
    issueStates: ['IFR', 'IFC'] as IssueState[],
    reviewCycles: 1,
    reworkFactor: 0.20,
  },
  CAMPAIGN: {
    issueStates: ['IFC'] as IssueState[],
    reviewCycles: 0,
    reworkFactor: 0.10,
  },
};

// Client profile affects review cycles and rework
const CLIENT_PROFILES = {
  TYPE_A: { reviewMultiplier: 1.5, reworkMultiplier: 1.3, name: 'Heavy Oversight' },
  TYPE_B: { reviewMultiplier: 1.0, reworkMultiplier: 1.0, name: 'Standard Process' },
  TYPE_C: { reviewMultiplier: 0.7, reworkMultiplier: 0.8, name: 'Minimal Oversight' },
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function IntegratedEstimationPrototype() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Project Configuration
  const [projectType, setProjectType] = useState<ProjectType>('PHASE_GATE');
  const [clientProfile, setClientProfile] = useState<ClientProfile>('TYPE_B');
  const [projectName, setProjectName] = useState('Sample Pharma Expansion');

  // Step 2: Equipment List
  const [equipment, setEquipment] = useState<Equipment[]>([
    { id: '1', tag: 'V-101', templateKey: 'vessel', size: 'medium', complexity: 'standard' },
    { id: '2', tag: 'P-101A', templateKey: 'pump', size: 'medium', complexity: 'standard' },
    { id: '3', tag: 'E-101', templateKey: 'heat_exchanger', size: 'medium', complexity: 'standard' },
  ]);
  const [showAddEquipmentModal, setShowAddEquipmentModal] = useState(false);

  // Step 3: Generated Deliverables
  const [deliverables, setDeliverables] = useState<GeneratedDeliverable[]>([]);
  const [expandedDeliverable, setExpandedDeliverable] = useState<string | null>(null);

  // Generate deliverables when equipment or project type changes
  useEffect(() => {
    const generated: GeneratedDeliverable[] = [];
    const defaults = PROJECT_TYPE_DEFAULTS[projectType];

    equipment.forEach((eq) => {
      const template = EQUIPMENT_TEMPLATES[eq.templateKey];
      if (!template) return;

      const sizeFactor = template.sizeFactors[eq.size];
      const complexityFactor = template.complexityFactors[eq.complexity];

      template.deliverables.forEach((deliv, idx) => {
        const baseHours = Math.round(deliv.baseHours * sizeFactor * complexityFactor);

        // Calculate state effort
        const stateEffort = defaults.issueStates.reduce((sum, state) => {
          return sum + (baseHours * ISSUE_STATE_MULTIPLIERS[state]);
        }, 0);

        // Calculate review rework
        const clientMultiplier = CLIENT_PROFILES[clientProfile];
        const adjustedCycles = Math.ceil(defaults.reviewCycles * clientMultiplier.reviewMultiplier);
        const adjustedRework = defaults.reworkFactor * clientMultiplier.reworkMultiplier;
        const reviewRework = stateEffort * (adjustedCycles * adjustedRework);

        const totalHours = Math.round(stateEffort + reviewRework);

        generated.push({
          id: `${eq.id}-${idx}`,
          name: deliv.name,
          discipline: deliv.discipline,
          baseHours,
          equipmentTag: eq.tag,
          equipmentType: template.type,
          issueStates: [...defaults.issueStates],
          reviewCycles: defaults.reviewCycles,
          reworkFactor: defaults.reworkFactor,
          stateEffortHours: Math.round(stateEffort),
          reviewReworkHours: Math.round(reviewRework),
          totalHours,
          selected: true,
        });
      });
    });

    setDeliverables(generated);
  }, [equipment, projectType, clientProfile]);

  // Calculate totals
  const selectedDeliverables = deliverables.filter(d => d.selected);
  const totalBaseHours = selectedDeliverables.reduce((sum, d) => sum + d.baseHours, 0);
  const totalStateHours = selectedDeliverables.reduce((sum, d) => sum + d.stateEffortHours, 0);
  const totalReviewHours = selectedDeliverables.reduce((sum, d) => sum + d.reviewReworkHours, 0);
  const totalHours = selectedDeliverables.reduce((sum, d) => sum + d.totalHours, 0);

  // Group by discipline
  const byDiscipline = selectedDeliverables.reduce((acc, d) => {
    if (!acc[d.discipline]) acc[d.discipline] = [];
    acc[d.discipline].push(d);
    return acc;
  }, {} as { [key: string]: GeneratedDeliverable[] });

  // Add equipment handler
  const addEquipment = (newEq: Omit<Equipment, 'id'>) => {
    setEquipment([...equipment, { ...newEq, id: Date.now().toString() }]);
    setShowAddEquipmentModal(false);
  };

  // Delete equipment handler
  const deleteEquipment = (id: string) => {
    const eq = equipment.find(e => e.id === id);
    if (eq && confirm(`Delete ${eq.tag}?`)) {
      setEquipment(equipment.filter(e => e.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-800 mb-2 inline-block text-sm"
          >
            ← Back to Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Integrated Estimation Workflow</h1>
              <p className="text-gray-600 text-sm mt-1">
                Equipment-Driven, Two-Axis Estimation Model
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Total Estimated Hours</div>
              <div className="text-3xl font-bold text-green-600">{totalHours.toLocaleString()}</div>
              <div className="text-xs text-gray-500">
                {selectedDeliverables.length} deliverables • {equipment.length} equipment
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Step Progress Bar */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200">
              <div
                className="h-full bg-blue-500 transition-all duration-500"
                style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
              />
            </div>

            {/* Steps */}
            <div className="relative flex justify-between">
              {[
                { num: 1, label: 'Project Setup', icon: '⚙️' },
                { num: 2, label: 'Equipment List', icon: '📋' },
                { num: 3, label: 'Configure Deliverables', icon: '🔧' },
                { num: 4, label: 'Review & Export', icon: '📊' },
              ].map((step) => (
                <button
                  key={step.num}
                  onClick={() => setCurrentStep(step.num as 1 | 2 | 3 | 4)}
                  className="flex flex-col items-center relative z-10"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all border-4 bg-white ${
                      currentStep >= step.num
                        ? 'border-blue-500 text-blue-600'
                        : 'border-gray-300 text-gray-400'
                    }`}
                  >
                    {currentStep > step.num ? '✓' : step.icon}
                  </div>
                  <div className={`mt-2 text-sm font-semibold ${
                    currentStep >= step.num ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {step.label}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Step 1: Project Setup */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Step 1: Project Configuration</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Project Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* Project Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Project Execution Type (HOW)
                  </label>
                  <div className="space-y-3">
                    {(['PHASE_GATE', 'FAST_TRACK', 'CAMPAIGN'] as ProjectType[]).map((type) => {
                      const defaults = PROJECT_TYPE_DEFAULTS[type];
                      return (
                        <button
                          key={type}
                          onClick={() => setProjectType(type)}
                          className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                            projectType === type
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          <div className="font-bold text-gray-900 mb-1">
                            {type.replace('_', '-')}
                          </div>
                          <div className="text-xs text-gray-600 space-y-1">
                            <div>• States: {defaults.issueStates.join(' → ')}</div>
                            <div>• Review Cycles: {defaults.reviewCycles}</div>
                            <div>• Rework Factor: {(defaults.reworkFactor * 100).toFixed(0)}%</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Client Profile */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Client Complexity Profile
                  </label>
                  <div className="space-y-3">
                    {(['TYPE_A', 'TYPE_B', 'TYPE_C'] as ClientProfile[]).map((profile) => {
                      const config = CLIENT_PROFILES[profile];
                      return (
                        <button
                          key={profile}
                          onClick={() => setClientProfile(profile)}
                          className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                            clientProfile === profile
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-purple-300'
                          }`}
                        >
                          <div className="font-bold text-gray-900 mb-1">
                            {profile} - {config.name}
                          </div>
                          <div className="text-xs text-gray-600 space-y-1">
                            <div>• Review Cycles: ×{config.reviewMultiplier}</div>
                            <div>• Rework Factor: ×{config.reworkMultiplier}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-bold text-blue-900 mb-2">Configuration Summary</h3>
                <div className="text-sm text-blue-800 space-y-1">
                  <div>
                    <strong>Project Type:</strong> {projectType.replace('_', '-')}
                    <span className="ml-2 text-xs">
                      ({PROJECT_TYPE_DEFAULTS[projectType].issueStates.length} issue states,
                      {PROJECT_TYPE_DEFAULTS[projectType].reviewCycles} review cycles)
                    </span>
                  </div>
                  <div>
                    <strong>Client Profile:</strong> {clientProfile} - {CLIENT_PROFILES[clientProfile].name}
                    <span className="ml-2 text-xs">
                      (Review cycles will be multiplied by {CLIENT_PROFILES[clientProfile].reviewMultiplier}×)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-end">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-lg shadow-lg"
              >
                Next: Add Equipment →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Equipment List */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Step 2: Equipment List</h2>
                <button
                  onClick={() => setShowAddEquipmentModal(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                >
                  + Add Equipment
                </button>
              </div>

              {/* Equipment Summary */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-sm font-semibold text-gray-600">Equipment Count</div>
                  <div className="text-3xl font-bold text-blue-600">{equipment.length}</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-sm font-semibold text-gray-600">Generated Deliverables</div>
                  <div className="text-3xl font-bold text-purple-600">{deliverables.length}</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-sm font-semibold text-gray-600">Base Hours</div>
                  <div className="text-3xl font-bold text-green-600">{totalBaseHours.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Before issue states & reviews</div>
                </div>
              </div>

              {/* Equipment List */}
              <div className="space-y-3">
                {equipment.map((eq) => {
                  const template = EQUIPMENT_TEMPLATES[eq.templateKey];
                  if (!template) return null;
                  const eqDeliverables = deliverables.filter(d => d.equipmentTag === eq.tag);
                  const eqHours = eqDeliverables.reduce((sum, d) => sum + d.baseHours, 0);

                  return (
                    <div key={eq.id} className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{template.icon}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-gray-900">{eq.tag}</span>
                              <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {template.type}
                              </span>
                              <span className="text-xs bg-gray-200 px-2 py-1 rounded">{eq.size}</span>
                              <span className="text-xs bg-gray-200 px-2 py-1 rounded">{eq.complexity}</span>
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              Generates {eqDeliverables.length} deliverables • {eqHours} base hours
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteEquipment(eq.id)}
                          className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-semibold"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
              >
                ← Back to Setup
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-lg shadow-lg"
              >
                Next: Configure Deliverables →
              </button>
            </div>

            {/* Add Equipment Modal */}
            {showAddEquipmentModal && (
              <QuickAddEquipmentModal
                onAdd={addEquipment}
                onClose={() => setShowAddEquipmentModal(false)}
              />
            )}
          </div>
        )}

        {/* Step 3: Configure Deliverables */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Step 3: Configure Deliverables</h2>

              {/* Configuration Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="font-semibold text-gray-600">Base Hours</div>
                    <div className="text-2xl font-bold text-gray-900">{totalBaseHours.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-600">State Effort</div>
                    <div className="text-2xl font-bold text-blue-600">+{totalStateHours.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">
                      {PROJECT_TYPE_DEFAULTS[projectType].issueStates.length} states
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-600">Review Rework</div>
                    <div className="text-2xl font-bold text-purple-600">+{totalReviewHours.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">
                      {Math.ceil(PROJECT_TYPE_DEFAULTS[projectType].reviewCycles * CLIENT_PROFILES[clientProfile].reviewMultiplier)} cycles
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-600">Total Hours</div>
                    <div className="text-2xl font-bold text-green-600">{totalHours.toLocaleString()}</div>
                    <div className="text-xs text-green-600">
                      {((totalHours / totalBaseHours - 1) * 100).toFixed(0)}% increase
                    </div>
                  </div>
                </div>
              </div>

              {/* Deliverables by Equipment */}
              <div className="space-y-4">
                {equipment.map((eq) => {
                  const template = EQUIPMENT_TEMPLATES[eq.templateKey];
                  if (!template) return null;
                  const eqDeliverables = deliverables.filter(d => d.equipmentTag === eq.tag && d.selected);
                  const eqTotalHours = eqDeliverables.reduce((sum, d) => sum + d.totalHours, 0);

                  return (
                    <div key={eq.id} className="border-2 border-gray-200 rounded-lg">
                      <div className="bg-gray-50 p-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{template.icon}</span>
                            <span className="font-bold text-gray-900">{eq.tag}</span>
                            <span className="text-sm text-gray-600">- {template.type}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-600">
                              {eqDeliverables.length} deliverables • {eqTotalHours.toLocaleString()} hours
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 space-y-2">
                        {eqDeliverables.map((deliv) => (
                          <div key={deliv.id} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-900">{deliv.name}</span>
                                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                                  {deliv.discipline}
                                </span>
                              </div>
                              <div className="text-xs text-gray-600 mt-1">
                                Base: {deliv.baseHours}h
                                → States: +{deliv.stateEffortHours}h
                                → Reviews: +{deliv.reviewReworkHours}h
                                → Total: {deliv.totalHours}h
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-bold text-green-600">{deliv.totalHours}h</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
              >
                ← Back to Equipment
              </button>
              <button
                onClick={() => setCurrentStep(4)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-lg shadow-lg"
              >
                Review Results →
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Review & Export */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Step 4: Review & Export</h2>

              {/* Summary Dashboard */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
                  <div className="text-sm opacity-90">Total Hours</div>
                  <div className="text-3xl font-bold">{totalHours.toLocaleString()}</div>
                  <div className="text-xs opacity-75">{selectedDeliverables.length} deliverables</div>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white">
                  <div className="text-sm opacity-90">Equipment</div>
                  <div className="text-3xl font-bold">{equipment.length}</div>
                  <div className="text-xs opacity-75">{Object.keys(byDiscipline).length} disciplines</div>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white">
                  <div className="text-sm opacity-90">Effort Multiplier</div>
                  <div className="text-3xl font-bold">{(totalHours / totalBaseHours).toFixed(1)}×</div>
                  <div className="text-xs opacity-75">from base hours</div>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-4 text-white">
                  <div className="text-sm opacity-90">Est. Duration</div>
                  <div className="text-3xl font-bold">{Math.ceil(totalHours / 160)}</div>
                  <div className="text-xs opacity-75">weeks (1 FTE)</div>
                </div>
              </div>

              {/* Breakdown by Discipline */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Hours by Discipline</h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(byDiscipline)
                    .sort((a, b) => {
                      const aHours = a[1].reduce((sum, d) => sum + d.totalHours, 0);
                      const bHours = b[1].reduce((sum, d) => sum + d.totalHours, 0);
                      return bHours - aHours;
                    })
                    .map(([discipline, delivs]) => {
                      const hours = delivs.reduce((sum, d) => sum + d.totalHours, 0);
                      const percentage = (hours / totalHours * 100).toFixed(1);
                      return (
                        <div key={discipline} className="border-2 border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-semibold text-gray-900">{discipline}</div>
                            <div className="text-sm text-gray-600">{delivs.length} items</div>
                          </div>
                          <div className="flex items-end justify-between">
                            <div className="text-2xl font-bold text-blue-600">{hours.toLocaleString()}h</div>
                            <div className="text-sm text-gray-500">{percentage}%</div>
                          </div>
                          <div className="mt-2 h-2 bg-gray-200 rounded-full">
                            <div
                              className="h-2 bg-blue-500 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Breakdown by Equipment */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Hours by Equipment</h3>
                <div className="space-y-2">
                  {equipment.map((eq) => {
                    const template = EQUIPMENT_TEMPLATES[eq.templateKey];
                    if (!template) return null;
                    const eqDelivs = deliverables.filter(d => d.equipmentTag === eq.tag && d.selected);
                    const hours = eqDelivs.reduce((sum, d) => sum + d.totalHours, 0);
                    const percentage = (hours / totalHours * 100).toFixed(1);

                    return (
                      <div key={eq.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                        <span className="text-2xl">{template.icon}</span>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{eq.tag}</div>
                          <div className="text-xs text-gray-600">{template.type} • {eqDelivs.length} deliverables</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-blue-600">{hours.toLocaleString()}h</div>
                          <div className="text-xs text-gray-500">{percentage}%</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Export Options */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Export Options</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-green-400 hover:shadow-lg transition-all text-left">
                    <div className="text-2xl mb-2">📊</div>
                    <div className="font-bold text-gray-900">Excel Breakdown</div>
                    <div className="text-xs text-gray-600">Deliverables by equipment & discipline</div>
                  </button>
                  <button className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-green-400 hover:shadow-lg transition-all text-left">
                    <div className="text-2xl mb-2">📅</div>
                    <div className="font-bold text-gray-900">MS Project Schedule</div>
                    <div className="text-xs text-gray-600">WBS with dependencies</div>
                  </button>
                  <button className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-green-400 hover:shadow-lg transition-all text-left">
                    <div className="text-2xl mb-2">💰</div>
                    <div className="font-bold text-gray-900">Cost Breakdown</div>
                    <div className="text-xs text-gray-600">Hours × rates by discipline</div>
                  </button>
                  <button className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-green-400 hover:shadow-lg transition-all text-left">
                    <div className="text-2xl mb-2">📄</div>
                    <div className="font-bold text-gray-900">PDF Report</div>
                    <div className="text-xs text-gray-600">Executive summary</div>
                  </button>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep(3)}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
              >
                ← Back to Configuration
              </button>
              <button
                onClick={() => alert('In production, this would save the project and redirect to project detail page')}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold text-lg shadow-lg"
              >
                💾 Save Project
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function QuickAddEquipmentModal({ onAdd, onClose }: {
  onAdd: (eq: Omit<Equipment, 'id'>) => void;
  onClose: () => void;
}) {
  const [tag, setTag] = useState('');
  const [templateKey, setTemplateKey] = useState('');
  const [size, setSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [complexity, setComplexity] = useState<'simple' | 'standard' | 'complex'>('standard');

  const handleSubmit = () => {
    if (!tag || !templateKey) {
      alert('Please enter tag and select type');
      return;
    }
    onAdd({ tag: tag.toUpperCase(), templateKey, size, complexity });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Add Equipment</h3>

        <div className="space-y-4">
          {!templateKey ? (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Select Type</label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(EQUIPMENT_TEMPLATES).map(([key, template]) => (
                  <button
                    key={key}
                    onClick={() => setTemplateKey(key)}
                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-400 text-left"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{template.icon}</span>
                      <span className="font-bold">{template.type}</span>
                    </div>
                    <div className="text-xs text-gray-600">{template.description}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="bg-blue-50 p-3 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{EQUIPMENT_TEMPLATES[templateKey].icon}</span>
                  <span className="font-bold">{EQUIPMENT_TEMPLATES[templateKey].type}</span>
                </div>
                <button onClick={() => setTemplateKey('')} className="text-sm text-blue-600">Change</button>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Equipment Tag</label>
                <input
                  type="text"
                  value={tag}
                  onChange={(e) => setTag(e.target.value.toUpperCase())}
                  placeholder="V-101, P-205A..."
                  className="w-full p-3 border-2 border-gray-200 rounded-lg font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Size</label>
                  <div className="flex gap-2">
                    {(['small', 'medium', 'large'] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => setSize(s)}
                        className={`flex-1 p-2 border-2 rounded capitalize ${
                          size === s ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Complexity</label>
                  <div className="flex gap-2">
                    {(['simple', 'standard', 'complex'] as const).map((c) => (
                      <button
                        key={c}
                        onClick={() => setComplexity(c)}
                        className={`flex-1 p-2 border-2 rounded capitalize ${
                          complexity === c ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg">
            Cancel
          </button>
          {templateKey && (
            <button
              onClick={handleSubmit}
              disabled={!tag}
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300"
            >
              Add Equipment
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
