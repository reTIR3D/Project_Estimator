import { useState } from 'react';
import { getRecommendedDependencies } from '../config/deliverableDependencies';

interface Deliverable {
  id: string;
  name: string;
  discipline: string;
  base_hours: number;
  category?: string;
  equipment_id?: string;
  dependencies?: any[];
  issue_states?: string[];
  review_cycles?: number;
  rework_factor?: number;
}

interface AddDeliverableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (deliverable: Deliverable) => void;
  existingDeliverables: Deliverable[];
}

interface DeliverableTemplate {
  name: string;
  baseHours: number;
  description?: string;
}

const CATEGORIES = [
  'Design Deliverables',
  'Engineering Studies',
  'Safety Documents',
  'Project Management',
  'Procurement',
  'Construction Support',
  'Commissioning',
  'Regulatory/Permits',
  'Other',
];

const DISCIPLINES = [
  'Process',
  'Mechanical',
  'Electrical/Instrumentation',
  'Civil/Structural',
  'Safety',
  'Environmental',
  'Project Management',
  'Quality',
  'Other',
];

// Pre-defined deliverable templates by category and discipline
const DELIVERABLE_TEMPLATES: Record<string, Record<string, DeliverableTemplate[]>> = {
  'Design Deliverables': {
    'Process': [
      { name: 'Process Flow Diagram (PFD)', baseHours: 60, description: 'High-level process flow' },
      { name: 'P&ID', baseHours: 120, description: 'Piping & Instrumentation Diagram' },
      { name: 'Process Datasheet', baseHours: 40, description: 'Equipment process specifications' },
      { name: 'Heat & Material Balance', baseHours: 80, description: 'Process stream calculations' },
      { name: 'Process Description', baseHours: 40, description: 'Detailed process narrative' },
      { name: 'Utility Summary', baseHours: 30, description: 'Utility requirements' },
    ],
    'Mechanical': [
      { name: 'Mechanical Datasheet', baseHours: 50, description: 'Equipment mechanical specs' },
      { name: 'Equipment Layout', baseHours: 80, description: 'Equipment arrangement drawing' },
      { name: 'Nozzle Orientation Drawing', baseHours: 40, description: 'Vessel nozzle locations' },
      { name: 'Pressure Calculations', baseHours: 60, description: 'Vessel pressure design' },
      { name: 'Foundation Design', baseHours: 70, description: 'Equipment foundation drawings' },
      { name: '3D Model', baseHours: 160, description: '3D plant model' },
    ],
    'Electrical/Instrumentation': [
      { name: 'Instrumentation Hookup', baseHours: 50, description: 'Instrument installation details' },
      { name: 'Control System Integration', baseHours: 100, description: 'Control system design' },
      { name: 'Motor Specification', baseHours: 40, description: 'Motor sizing and specs' },
      { name: 'Electrical Single Line', baseHours: 80, description: 'Electrical distribution diagram' },
      { name: 'Loop Drawings', baseHours: 60, description: 'Control loop diagrams' },
    ],
    'Civil/Structural': [
      { name: 'Structural Design', baseHours: 120, description: 'Structural steel design' },
      { name: 'Civil Site Plan', baseHours: 80, description: 'Site layout and grading' },
      { name: 'Piping Isometric', baseHours: 90, description: 'Piping fabrication drawings' },
    ],
  },
  'Engineering Studies': {
    'Process': [
      { name: 'Process Simulation', baseHours: 120, description: 'Dynamic process modeling' },
      { name: 'Optimization Study', baseHours: 100, description: 'Process optimization analysis' },
      { name: 'Debottlenecking Study', baseHours: 80, description: 'Capacity improvement analysis' },
    ],
    'Mechanical': [
      { name: 'Vibration Analysis', baseHours: 60, description: 'Equipment vibration study' },
      { name: 'Noise Analysis', baseHours: 50, description: 'Acoustic analysis' },
      { name: 'Thermal Design Calculation', baseHours: 70, description: 'Heat exchanger thermal design' },
    ],
    'Safety': [
      { name: 'HAZOP Study', baseHours: 200, description: 'Hazard and operability study' },
      { name: 'Risk Assessment', baseHours: 150, description: 'Quantitative risk analysis' },
      { name: 'SIL Determination', baseHours: 120, description: 'Safety integrity level analysis' },
    ],
  },
  'Safety Documents': {
    'Safety': [
      { name: 'Relief Valve Sizing', baseHours: 60, description: 'PSV sizing calculations' },
      { name: 'Relief System Design', baseHours: 80, description: 'Relief system layout' },
      { name: 'Fire Protection Design', baseHours: 100, description: 'Fire safety systems' },
      { name: 'Safety Instrumented System', baseHours: 140, description: 'SIS design documentation' },
    ],
    'Process': [
      { name: 'Operating Procedures', baseHours: 80, description: 'Standard operating procedures' },
      { name: 'Emergency Shutdown Procedures', baseHours: 60, description: 'ESD procedures' },
    ],
  },
  'Project Management': {
    'Project Management': [
      { name: 'Project Schedule', baseHours: 80, description: 'Detailed project timeline' },
      { name: 'Cost Estimate', baseHours: 60, description: 'Project cost breakdown' },
      { name: 'Resource Plan', baseHours: 40, description: 'Staffing and resource allocation' },
      { name: 'Progress Reports', baseHours: 30, description: 'Monthly status reports' },
    ],
  },
  'Procurement': {
    'Mechanical': [
      { name: 'Technical Bid Evaluation', baseHours: 60, description: 'Vendor proposal review' },
      { name: 'Vendor Drawing Review', baseHours: 40, description: 'Supplier submittal review' },
    ],
    'Project Management': [
      { name: 'Procurement Schedule', baseHours: 50, description: 'Equipment delivery timeline' },
    ],
  },
  'Construction Support': {
    'Mechanical': [
      { name: 'Field Support', baseHours: 120, description: 'On-site construction support' },
      { name: 'RFI Responses', baseHours: 60, description: 'Request for information responses' },
    ],
    'Process': [
      { name: 'Startup Procedures', baseHours: 80, description: 'Equipment startup documentation' },
    ],
  },
  'Commissioning': {
    'Process': [
      { name: 'Commissioning Plan', baseHours: 80, description: 'Commissioning scope and schedule' },
      { name: 'Pre-Commissioning Checklist', baseHours: 40, description: 'System readiness verification' },
    ],
    'Electrical/Instrumentation': [
      { name: 'Loop Check Procedures', baseHours: 60, description: 'Control loop testing' },
      { name: 'Instrument Calibration', baseHours: 70, description: 'Instrument calibration records' },
    ],
  },
  'Regulatory/Permits': {
    'Environmental': [
      { name: 'Environmental Impact Assessment', baseHours: 120, description: 'Environmental study' },
      { name: 'Air Permit Application', baseHours: 80, description: 'Air emissions permit' },
      { name: 'Water Discharge Permit', baseHours: 70, description: 'Wastewater permit' },
    ],
    'Safety': [
      { name: 'Safety Case', baseHours: 200, description: 'Regulatory safety documentation' },
    ],
  },
};

export default function AddDeliverableModal({ isOpen, onClose, onAdd, existingDeliverables }: AddDeliverableModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [category, setCategory] = useState<string>('');
  const [discipline, setDiscipline] = useState<string>('');
  const [selectedTemplates, setSelectedTemplates] = useState<DeliverableTemplate[]>([]);
  const [customName, setCustomName] = useState('');
  const [customHours, setCustomHours] = useState(40);
  const [isCustom, setIsCustom] = useState(false);
  const [suggestedToAdd, setSuggestedToAdd] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const handleReset = () => {
    setStep(1);
    setCategory('');
    setDiscipline('');
    setSelectedTemplates([]);
    setCustomName('');
    setCustomHours(40);
    setIsCustom(false);
    setSuggestedToAdd(new Set());
  };

  const handleCancel = () => {
    handleReset();
    onClose();
  };

  const handleCategorySelect = (cat: string) => {
    setCategory(cat);
    setDiscipline('');
    setSelectedTemplates([]);
    setStep(2);
  };

  const handleDisciplineSelect = (disc: string) => {
    setDiscipline(disc);
    setSelectedTemplates([]);
    setIsCustom(false);
    setStep(3);
  };

  const handleTemplateToggle = (template: DeliverableTemplate) => {
    setIsCustom(false);
    setSelectedTemplates((prev) => {
      const exists = prev.find(t => t.name === template.name);
      if (exists) {
        return prev.filter(t => t.name !== template.name);
      } else {
        return [...prev, template];
      }
    });
  };

  const handleToggleSuggested = (prereqName: string) => {
    setSuggestedToAdd((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(prereqName)) {
        newSet.delete(prereqName);
      } else {
        newSet.add(prereqName);
      }
      return newSet;
    });
  };

  const handleCustomSelect = () => {
    setIsCustom(true);
    setSelectedTemplates([]);
  };

  const handleSubmit = () => {
    const deliverablestoAdd: Deliverable[] = [];
    const addedNames = new Set<string>(); // Track what we're adding to avoid duplicates

    // Helper function to find template by name across all categories/disciplines
    const findTemplateByName = (name: string): DeliverableTemplate | null => {
      for (const catTemplates of Object.values(DELIVERABLE_TEMPLATES)) {
        for (const disciplineTemplates of Object.values(catTemplates)) {
          const found = disciplineTemplates.find(t => t.name === name);
          if (found) return found;
        }
      }
      return null;
    };

    // First, add suggested prerequisites
    suggestedToAdd.forEach((prereqName) => {
      const template = findTemplateByName(prereqName);
      if (template && !addedNames.has(prereqName)) {
        // Get dependencies for this prerequisite
        const recommendedPrereqs = getRecommendedDependencies(prereqName);
        const dependencies: any[] = [];

        recommendedPrereqs.forEach((prereqOfPrereq) => {
          const prereqDelivs = existingDeliverables.filter(d => d.name === prereqOfPrereq);
          prereqDelivs.forEach(prereqDeliv => {
            dependencies.push({
              deliverable_id: prereqDeliv.id,
              dependency_type: 'prerequisite',
            });
          });
        });

        deliverablestoAdd.push({
          id: `deliv-${Date.now()}-suggested-${Math.random().toString(36).substr(2, 9)}`,
          name: prereqName,
          discipline: discipline || 'Other',
          category: category || 'Other',
          base_hours: template.baseHours,
          dependencies,
          issue_states: ['IFR', 'IFC'],
          review_cycles: 1,
          rework_factor: 25,
        });
        addedNames.add(prereqName);
      }
    });

    // Then add the main selections
    if (isCustom) {
      if (!customName.trim()) {
        alert('Please enter a deliverable name');
        return;
      }

      // Get recommended dependencies
      const recommendedPrereqs = getRecommendedDependencies(customName.trim());
      const dependencies: any[] = [];

      recommendedPrereqs.forEach((prereqName) => {
        // Check in existing deliverables
        const prereqDelivs = existingDeliverables.filter(d => d.name === prereqName);
        prereqDelivs.forEach(prereqDeliv => {
          dependencies.push({
            deliverable_id: prereqDeliv.id,
            dependency_type: 'prerequisite',
          });
        });

        // Also check in deliverables we're about to add
        const prereqInNewDelivs = deliverablestoAdd.find(d => d.name === prereqName);
        if (prereqInNewDelivs) {
          dependencies.push({
            deliverable_id: prereqInNewDelivs.id,
            dependency_type: 'prerequisite',
          });
        }
      });

      deliverablestoAdd.push({
        id: `deliv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: customName.trim(),
        discipline,
        category,
        base_hours: customHours,
        dependencies,
        issue_states: ['IFR', 'IFC'],
        review_cycles: 1,
        rework_factor: 25,
      });
    } else if (selectedTemplates.length > 0) {
      selectedTemplates.forEach((template, idx) => {
        // Get recommended dependencies
        const recommendedPrereqs = getRecommendedDependencies(template.name);
        const dependencies: any[] = [];

        recommendedPrereqs.forEach((prereqName) => {
          // Check in existing deliverables
          const prereqDelivs = existingDeliverables.filter(d => d.name === prereqName);
          prereqDelivs.forEach(prereqDeliv => {
            dependencies.push({
              deliverable_id: prereqDeliv.id,
              dependency_type: 'prerequisite',
            });
          });

          // Also check in deliverables we're about to add (including suggested ones)
          const prereqInNewDelivs = deliverablestoAdd.find(d => d.name === prereqName);
          if (prereqInNewDelivs) {
            dependencies.push({
              deliverable_id: prereqInNewDelivs.id,
              dependency_type: 'prerequisite',
            });
          }
        });

        deliverablestoAdd.push({
          id: `deliv-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 9)}`,
          name: template.name,
          discipline,
          category,
          base_hours: template.baseHours,
          dependencies,
          issue_states: ['IFR', 'IFC'],
          review_cycles: 1,
          rework_factor: 25,
        });
      });
    } else {
      alert('Please select at least one deliverable or enter a custom one');
      return;
    }

    // Add all deliverables
    deliverablestoAdd.forEach(deliv => onAdd(deliv));

    handleReset();
    onClose();
  };

  const availableDisciplines = category && DELIVERABLE_TEMPLATES[category]
    ? Object.keys(DELIVERABLE_TEMPLATES[category])
    : [];

  const availableTemplates = category && discipline && DELIVERABLE_TEMPLATES[category]?.[discipline]
    ? DELIVERABLE_TEMPLATES[category][discipline]
    : [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Add Deliverable</h2>
            <p className="text-sm text-gray-500 mt-1">
              {step === 1 && 'Step 1: Select a category'}
              {step === 2 && 'Step 2: Select a discipline'}
              {step === 3 && 'Step 3: Choose a deliverable'}
            </p>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="px-6 py-3 bg-gray-50 border-b">
          <div className="flex items-center justify-center gap-2">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
              step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              1
            </div>
            <div className={`h-1 w-16 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
              step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              2
            </div>
            <div className={`h-1 w-16 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
              step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              3
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Step 1: Category Selection */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Category</h3>
              <div className="grid grid-cols-2 gap-3">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategorySelect(cat)}
                    className="p-4 text-left border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <div className="font-semibold text-gray-900">{cat}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {DELIVERABLE_TEMPLATES[cat]
                        ? `${Object.values(DELIVERABLE_TEMPLATES[cat]).flat().length} templates available`
                        : 'Custom deliverables'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Discipline Selection */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={() => setStep(1)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  ← Back
                </button>
                <span className="text-gray-400">|</span>
                <span className="text-sm font-medium text-gray-700">{category}</span>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Discipline</h3>
              <div className="grid grid-cols-2 gap-3">
                {availableDisciplines.length > 0 ? (
                  availableDisciplines.map((disc) => (
                    <button
                      key={disc}
                      onClick={() => handleDisciplineSelect(disc)}
                      className="p-4 text-left border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                    >
                      <div className="font-semibold text-gray-900">{disc}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {DELIVERABLE_TEMPLATES[category][disc].length} deliverables
                      </div>
                    </button>
                  ))
                ) : (
                  DISCIPLINES.map((disc) => (
                    <button
                      key={disc}
                      onClick={() => handleDisciplineSelect(disc)}
                      className="p-4 text-left border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                    >
                      <div className="font-semibold text-gray-900">{disc}</div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Step 3: Deliverable Selection */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={() => setStep(2)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  ← Back
                </button>
                <span className="text-gray-400">|</span>
                <span className="text-sm font-medium text-gray-700">{category}</span>
                <span className="text-gray-400">›</span>
                <span className="text-sm font-medium text-gray-700">{discipline}</span>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Deliverable</h3>

              {/* Pre-defined templates */}
              {availableTemplates.length > 0 && (
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-semibold text-gray-700">Standard Deliverables</h4>
                    {selectedTemplates.length > 0 && (
                      <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                        {selectedTemplates.length} selected
                      </span>
                    )}
                  </div>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {availableTemplates.map((template, idx) => {
                      const isSelected = selectedTemplates.some(t => t.name === template.name);

                      // Get dependencies for this deliverable
                      const prerequisites = getRecommendedDependencies(template.name);

                      // Check which prerequisites are missing
                      const missingPrereqs = prerequisites.filter(prereqName =>
                        !existingDeliverables.some(d => d.name === prereqName) &&
                        !selectedTemplates.some(t => t.name === prereqName)
                      );

                      // Check which prerequisites already exist
                      const existingPrereqs = prerequisites.filter(prereqName =>
                        existingDeliverables.some(d => d.name === prereqName)
                      );

                      // Check which prerequisites are in current selection
                      const selectedPrereqs = prerequisites.filter(prereqName =>
                        selectedTemplates.some(t => t.name === prereqName)
                      );

                      return (
                        <div key={idx}>
                          <button
                            onClick={() => handleTemplateToggle(template)}
                            className={`w-full p-3 text-left border-2 rounded-lg transition-colors ${
                              isSelected
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                                isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                              }`}>
                                {isSelected && (
                                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="font-semibold text-gray-900">{template.name}</div>
                                {template.description && (
                                  <div className="text-xs text-gray-500 mt-1">{template.description}</div>
                                )}

                                {/* Dependencies info */}
                                {prerequisites.length > 0 && (
                                  <div className="mt-2 text-xs">
                                    <div className="flex flex-wrap gap-1">
                                      <span className="text-gray-600">Dependencies:</span>
                                      {existingPrereqs.map((prereq, i) => (
                                        <span key={i} className="bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                          ✓ {prereq}
                                        </span>
                                      ))}
                                      {selectedPrereqs.map((prereq, i) => (
                                        <span key={i} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                          ⊕ {prereq}
                                        </span>
                                      ))}
                                      {missingPrereqs.map((prereq, i) => (
                                        <span key={i} className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                                          ⚠ {prereq}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className="text-sm font-semibold text-blue-600 ml-4">
                                {template.baseHours}h
                              </div>
                            </div>
                          </button>

                          {/* Missing dependencies warning */}
                          {isSelected && missingPrereqs.length > 0 && (
                            <div className="ml-8 mt-1 mb-2 p-3 bg-orange-50 border border-orange-200 rounded text-xs">
                              <div className="font-semibold text-orange-800 mb-2 flex items-center gap-1">
                                💡 Suggested Prerequisites
                              </div>
                              <div className="space-y-1.5">
                                {missingPrereqs.map((prereqName, i) => (
                                  <label
                                    key={i}
                                    className="flex items-center gap-2 cursor-pointer hover:bg-orange-100 p-1.5 rounded transition-colors"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={suggestedToAdd.has(prereqName)}
                                      onChange={() => handleToggleSuggested(prereqName)}
                                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                                    />
                                    <span className="text-orange-900 font-medium">{prereqName}</span>
                                  </label>
                                ))}
                              </div>
                              {suggestedToAdd.size > 0 && (
                                <div className="mt-2 pt-2 border-t border-orange-300 text-orange-800 font-medium">
                                  {suggestedToAdd.size} prerequisite{suggestedToAdd.size > 1 ? 's' : ''} will be added automatically
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Custom deliverable option */}
              <div className="border-t pt-4">
                <button
                  onClick={handleCustomSelect}
                  className={`w-full p-3 text-left border-2 rounded-lg transition-colors ${
                    isCustom
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-semibold text-gray-900">+ Custom Deliverable</div>
                  <div className="text-xs text-gray-500 mt-1">Enter your own deliverable name and hours</div>
                </button>

                {isCustom && (
                  <div className="mt-4 space-y-3 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Deliverable Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        placeholder="e.g., Custom Process Study"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Estimated Hours <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={customHours}
                        onChange={(e) => setCustomHours(parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-between items-center">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>

          {step === 3 && (
            <button
              onClick={handleSubmit}
              disabled={selectedTemplates.length === 0 && !isCustom}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {selectedTemplates.length > 1
                ? `Add ${selectedTemplates.length} Deliverables`
                : isCustom
                ? 'Add Deliverable'
                : selectedTemplates.length === 1
                ? 'Add Deliverable'
                : 'Add Deliverable'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
