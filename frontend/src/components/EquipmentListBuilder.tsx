import React, { useState } from 'react';

/**
 * EQUIPMENT LIST BUILDER - PROTOTYPE
 *
 * This component demonstrates equipment-driven deliverable generation:
 * - Add equipment with tag, type, size, complexity
 * - Each equipment type has a template that generates deliverables
 * - Deliverables are auto-created across multiple disciplines
 * - Shows the power of the two-axis model: Equipment × Project Type
 */

// Equipment types with their deliverable templates
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
  complexityFactors: {
    simple: number;
    standard: number;
    complex: number;
  };
  sizeFactors: {
    small: number;
    medium: number;
    large: number;
  };
}

// Equipment templates - this is the magic!
const EQUIPMENT_TEMPLATES: { [key: string]: EquipmentTemplate } = {
  vessel: {
    type: 'Pressure Vessel',
    icon: '⚗️',
    description: 'Pressure vessels, reactors, receivers',
    deliverables: [
      { name: 'Process Datasheet', discipline: 'Process', baseHours: 16, description: 'Process requirements & operating conditions' },
      { name: 'Mechanical Datasheet', discipline: 'Mechanical', baseHours: 12, description: 'Mechanical design specification' },
      { name: 'Pressure Calculations', discipline: 'Mechanical', baseHours: 20, description: 'ASME VIII stress analysis' },
      { name: 'Nozzle Orientation Drawing', discipline: 'Mechanical', baseHours: 16, description: 'Nozzle schedule & layout' },
      { name: 'Foundation Design', discipline: 'Civil', baseHours: 24, description: 'Foundation loads & design' },
      { name: 'Instrumentation Hookup', discipline: 'Electrical/Instrumentation', baseHours: 8, description: 'Instrument connections' },
      { name: 'Relief Valve Sizing', discipline: 'Safety', baseHours: 8, description: 'PSV sizing calculations' },
    ],
    complexityFactors: { simple: 0.8, standard: 1.0, complex: 1.4 },
    sizeFactors: { small: 0.8, medium: 1.0, large: 1.3 },
  },
  pump: {
    type: 'Centrifugal Pump',
    icon: '🔄',
    description: 'Centrifugal pumps, positive displacement',
    deliverables: [
      { name: 'Pump Datasheet', discipline: 'Process', baseHours: 12, description: 'Process requirements & hydraulics' },
      { name: 'Mechanical Seal Plan', discipline: 'Mechanical', baseHours: 8, description: 'API 682 seal system' },
      { name: 'Motor Specification', discipline: 'Electrical/Instrumentation', baseHours: 6, description: 'Motor sizing & specs' },
      { name: 'Alignment Procedure', discipline: 'Mechanical', baseHours: 4, description: 'Installation alignment' },
      { name: 'Foundation Design', discipline: 'Civil', baseHours: 16, description: 'Skid or foundation loads' },
      { name: 'Vibration Analysis', discipline: 'Mechanical', baseHours: 12, description: 'Vibration assessment' },
    ],
    complexityFactors: { simple: 0.8, standard: 1.0, complex: 1.3 },
    sizeFactors: { small: 0.7, medium: 1.0, large: 1.2 },
  },
  heat_exchanger: {
    type: 'Heat Exchanger',
    icon: '🌡️',
    description: 'Shell & tube, plate, air coolers',
    deliverables: [
      { name: 'Thermal Datasheet', discipline: 'Process', baseHours: 20, description: 'TEMA datasheet, heat duty' },
      { name: 'Thermal Design Calculations', discipline: 'Process', baseHours: 16, description: 'Heat transfer calculations' },
      { name: 'Mechanical Specification', discipline: 'Mechanical', baseHours: 10, description: 'Tube bundle, shell design' },
      { name: 'Tube Pulling Study', discipline: 'Mechanical', baseHours: 8, description: 'Maintenance clearances' },
      { name: 'Foundation Design', discipline: 'Civil', baseHours: 20, description: 'Support structure' },
      { name: 'Instrumentation Hookup', discipline: 'Electrical/Instrumentation', baseHours: 6, description: 'Temperature controls' },
    ],
    complexityFactors: { simple: 0.9, standard: 1.0, complex: 1.3 },
    sizeFactors: { small: 0.8, medium: 1.0, large: 1.2 },
  },
  tank: {
    type: 'Storage Tank',
    icon: '🗄️',
    description: 'Atmospheric tanks, API 650/620',
    deliverables: [
      { name: 'Tank Specification', discipline: 'Process', baseHours: 12, description: 'API 650/620 requirements' },
      { name: 'Shell Design Calculations', discipline: 'Mechanical', baseHours: 16, description: 'Plate thickness, wind/seismic' },
      { name: 'Foundation Ring Design', discipline: 'Civil', baseHours: 28, description: 'Ring wall or slab foundation' },
      { name: 'Dike Sizing Calculation', discipline: 'Civil', baseHours: 12, description: '110% spill containment' },
      { name: 'Emission Calculations', discipline: 'Environmental', baseHours: 10, description: 'VOC emissions (if applicable)' },
      { name: 'Level Instrumentation', discipline: 'Electrical/Instrumentation', baseHours: 6, description: 'Level gauging system' },
    ],
    complexityFactors: { simple: 0.9, standard: 1.0, complex: 1.2 },
    sizeFactors: { small: 0.7, medium: 1.0, large: 1.4 },
  },
  compressor: {
    type: 'Compressor',
    icon: '💨',
    description: 'Centrifugal, reciprocating compressors',
    deliverables: [
      { name: 'Compressor Datasheet', discipline: 'Process', baseHours: 18, description: 'Performance requirements' },
      { name: 'Performance Curves', discipline: 'Process', baseHours: 12, description: 'Operating envelope curves' },
      { name: 'Surge Analysis', discipline: 'Process', baseHours: 16, description: 'Anti-surge system design' },
      { name: 'Vibration Analysis', discipline: 'Mechanical', baseHours: 14, description: 'API 617/618 vibration' },
      { name: 'Lube Oil System', discipline: 'Mechanical', baseHours: 20, description: 'Lubrication system design' },
      { name: 'Motor/Turbine Specification', discipline: 'Electrical/Instrumentation', baseHours: 10, description: 'Driver sizing' },
      { name: 'Foundation Design', discipline: 'Civil', baseHours: 32, description: 'Vibration-isolated foundation' },
    ],
    complexityFactors: { simple: 0.9, standard: 1.0, complex: 1.5 },
    sizeFactors: { small: 0.8, medium: 1.0, large: 1.3 },
  },
};

interface Equipment {
  id: string;
  tag: string;
  templateKey: string;
  size: 'small' | 'medium' | 'large';
  complexity: 'simple' | 'standard' | 'complex';
  notes?: string;
}

interface GeneratedDeliverable extends DeliverableTemplate {
  equipmentTag: string;
  equipmentType: string;
  calculatedHours: number;
  id: string;
}

export default function EquipmentListBuilder() {
  const [equipment, setEquipment] = useState<Equipment[]>([
    { id: '1', tag: 'V-101', templateKey: 'vessel', size: 'medium', complexity: 'standard' },
    { id: '2', tag: 'P-101A', templateKey: 'pump', size: 'medium', complexity: 'standard' },
    { id: '3', tag: 'P-101B', templateKey: 'pump', size: 'medium', complexity: 'standard', notes: 'Spare pump' },
    { id: '4', tag: 'E-101', templateKey: 'heat_exchanger', size: 'medium', complexity: 'standard' },
  ]);

  const [expandedEquipment, setExpandedEquipment] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  // New equipment form state
  const [newEquipment, setNewEquipment] = useState({
    tag: '',
    templateKey: '',
    size: 'medium' as 'small' | 'medium' | 'large',
    complexity: 'standard' as 'simple' | 'standard' | 'complex',
    notes: '',
  });

  // Calculate hours for a deliverable based on equipment factors
  const calculateDeliverableHours = (
    baseHours: number,
    template: EquipmentTemplate,
    size: 'small' | 'medium' | 'large',
    complexity: 'simple' | 'standard' | 'complex'
  ): number => {
    const sizeFactor = template.sizeFactors[size];
    const complexityFactor = template.complexityFactors[complexity];
    return Math.round(baseHours * sizeFactor * complexityFactor);
  };

  // Generate all deliverables from equipment list
  const generateDeliverables = (): GeneratedDeliverable[] => {
    const deliverables: GeneratedDeliverable[] = [];

    equipment.forEach((eq) => {
      const template = EQUIPMENT_TEMPLATES[eq.templateKey];
      if (!template) return;

      template.deliverables.forEach((deliv, idx) => {
        deliverables.push({
          ...deliv,
          equipmentTag: eq.tag,
          equipmentType: template.type,
          calculatedHours: calculateDeliverableHours(
            deliv.baseHours,
            template,
            eq.size,
            eq.complexity
          ),
          id: `${eq.id}-${idx}`,
        });
      });
    });

    return deliverables;
  };

  const allDeliverables = generateDeliverables();

  // Calculate totals
  const totalEquipment = equipment.length;
  const totalDeliverables = allDeliverables.length;
  const totalHours = allDeliverables.reduce((sum, d) => sum + d.calculatedHours, 0);

  // Group deliverables by discipline
  const deliverablesByDiscipline = allDeliverables.reduce((acc, deliv) => {
    if (!acc[deliv.discipline]) {
      acc[deliv.discipline] = [];
    }
    acc[deliv.discipline].push(deliv);
    return acc;
  }, {} as { [discipline: string]: GeneratedDeliverable[] });

  const addEquipment = () => {
    if (!newEquipment.tag || !newEquipment.templateKey) {
      alert('Please enter equipment tag and select type');
      return;
    }

    const newEq: Equipment = {
      id: Date.now().toString(),
      tag: newEquipment.tag,
      templateKey: newEquipment.templateKey,
      size: newEquipment.size,
      complexity: newEquipment.complexity,
      notes: newEquipment.notes || undefined,
    };

    setEquipment([...equipment, newEq]);
    setNewEquipment({ tag: '', templateKey: '', size: 'medium', complexity: 'standard', notes: '' });
    setShowAddModal(false);
    setShowTemplateSelector(false);
  };

  const deleteEquipment = (id: string) => {
    const eq = equipment.find(e => e.id === id);
    if (eq) {
      const template = EQUIPMENT_TEMPLATES[eq.templateKey];
      const delivCount = template?.deliverables.length || 0;
      if (confirm(`Delete ${eq.tag}? This will remove ${delivCount} associated deliverables.`)) {
        setEquipment(equipment.filter(e => e.id !== id));
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Equipment List Builder</h2>
            <p className="text-sm text-gray-600 mt-1">Add equipment to auto-generate deliverables</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Auto-Generated Deliverables</div>
            <div className="text-3xl font-bold text-green-600">{totalDeliverables}</div>
            <div className="text-xs text-gray-500">{totalHours.toLocaleString()} hours total</div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="text-sm font-semibold text-gray-600">Equipment Count</div>
            <div className="text-3xl font-bold text-blue-600">{totalEquipment}</div>
            <div className="text-xs text-gray-500 mt-1">items in list</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="text-sm font-semibold text-gray-600">Deliverables Generated</div>
            <div className="text-3xl font-bold text-purple-600">{totalDeliverables}</div>
            <div className="text-xs text-gray-500 mt-1">across {Object.keys(deliverablesByDiscipline).length} disciplines</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="text-sm font-semibold text-gray-600">Estimated Hours</div>
            <div className="text-3xl font-bold text-green-600">{totalHours.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-1">before review cycles</div>
          </div>
        </div>
      </div>

      {/* Quick Add Buttons */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-semibold text-gray-700">Quick Add:</span>
          {Object.entries(EQUIPMENT_TEMPLATES).map(([key, template]) => (
            <button
              key={key}
              onClick={() => {
                setNewEquipment({ ...newEquipment, templateKey: key });
                setShowAddModal(true);
              }}
              className="px-3 py-2 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-sm font-medium"
            >
              <span className="mr-1">{template.icon}</span>
              {template.type}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold text-sm"
          >
            + Add Equipment
          </button>
          <button
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold text-sm"
            title="Coming soon"
          >
            📥 Import Excel
          </button>
        </div>
      </div>

      {/* Equipment List */}
      <div className="p-6">
        <div className="space-y-3">
          {equipment.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">📦</div>
              <div className="text-lg font-semibold">No equipment added yet</div>
              <div className="text-sm mt-2">Click "Quick Add" or "+ Add Equipment" to get started</div>
            </div>
          ) : (
            equipment.map((eq) => {
              const template = EQUIPMENT_TEMPLATES[eq.templateKey];
              if (!template) return null;

              const isExpanded = expandedEquipment === eq.id;
              const equipmentDeliverables = allDeliverables.filter(d => d.equipmentTag === eq.tag);
              const equipmentHours = equipmentDeliverables.reduce((sum, d) => sum + d.calculatedHours, 0);

              return (
                <div
                  key={eq.id}
                  className="border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-all"
                >
                  {/* Equipment Header */}
                  <div className="p-4 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{template.icon}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-gray-900">{eq.tag}</h3>
                            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {template.type}
                            </span>
                            <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                              {eq.size}
                            </span>
                            <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                              {eq.complexity}
                            </span>
                          </div>
                          {eq.notes && (
                            <div className="text-xs text-gray-600 mt-1">📝 {eq.notes}</div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-sm text-gray-600">Generates</div>
                          <div className="text-xl font-bold text-purple-600">
                            {equipmentDeliverables.length} deliverables
                          </div>
                          <div className="text-xs text-gray-500">{equipmentHours} hours</div>
                        </div>
                        <button
                          onClick={() => setExpandedEquipment(isExpanded ? null : eq.id)}
                          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold"
                        >
                          {isExpanded ? '▼ Hide' : '▶ Show'} Deliverables
                        </button>
                        <button
                          onClick={() => deleteEquipment(eq.id)}
                          className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-semibold"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Deliverables */}
                  {isExpanded && (
                    <div className="p-4 bg-white border-t border-gray-200">
                      <h4 className="text-sm font-bold text-gray-700 mb-3">
                        Auto-Generated Deliverables for {eq.tag}:
                      </h4>
                      <div className="space-y-2">
                        {equipmentDeliverables.map((deliv) => (
                          <div
                            key={deliv.id}
                            className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg"
                          >
                            <div className="flex-shrink-0 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">✓</span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-semibold text-gray-900">{deliv.name}</div>
                                  <div className="text-xs text-gray-600 mt-1">{deliv.description}</div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded font-semibold">
                                    {deliv.discipline}
                                  </div>
                                  <div className="text-xs text-gray-600 mt-1">
                                    {deliv.calculatedHours}h
                                    {deliv.calculatedHours !== deliv.baseHours && (
                                      <span className="text-blue-600 ml-1">
                                        (base: {deliv.baseHours}h)
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Deliverables by Discipline Summary */}
      {equipment.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Deliverables by Discipline</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(deliverablesByDiscipline)
              .sort((a, b) => b[1].length - a[1].length)
              .map(([discipline, delivs]) => {
                const disciplineHours = delivs.reduce((sum, d) => sum + d.calculatedHours, 0);
                return (
                  <div key={discipline} className="bg-white rounded-lg p-3 shadow border border-gray-200">
                    <div className="text-xs font-semibold text-gray-600">{discipline}</div>
                    <div className="text-2xl font-bold text-blue-600 mt-1">{delivs.length}</div>
                    <div className="text-xs text-gray-500">{disciplineHours} hours</div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Add Equipment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Add Equipment</h3>

            <div className="space-y-4">
              {/* Equipment Type Selection */}
              {!newEquipment.templateKey ? (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Select Equipment Type *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(EQUIPMENT_TEMPLATES).map(([key, template]) => (
                      <button
                        key={key}
                        onClick={() => setNewEquipment({ ...newEquipment, templateKey: key })}
                        className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-left"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{template.icon}</span>
                          <span className="font-bold text-gray-900">{template.type}</span>
                        </div>
                        <div className="text-xs text-gray-600">{template.description}</div>
                        <div className="text-xs text-blue-600 mt-2 font-semibold">
                          {template.deliverables.length} deliverables
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {/* Selected Template Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{EQUIPMENT_TEMPLATES[newEquipment.templateKey].icon}</span>
                        <div>
                          <div className="font-bold text-gray-900">
                            {EQUIPMENT_TEMPLATES[newEquipment.templateKey].type}
                          </div>
                          <div className="text-xs text-gray-600">
                            Generates {EQUIPMENT_TEMPLATES[newEquipment.templateKey].deliverables.length} deliverables
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setNewEquipment({ ...newEquipment, templateKey: '' })}
                        className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        Change Type
                      </button>
                    </div>
                  </div>

                  {/* Equipment Tag */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Equipment Tag *
                    </label>
                    <input
                      type="text"
                      value={newEquipment.tag}
                      onChange={(e) => setNewEquipment({ ...newEquipment, tag: e.target.value.toUpperCase() })}
                      placeholder="V-101, P-205A, E-301..."
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none font-mono"
                    />
                  </div>

                  {/* Size */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Size</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['small', 'medium', 'large'] as const).map((size) => (
                        <button
                          key={size}
                          onClick={() => setNewEquipment({ ...newEquipment, size })}
                          className={`p-3 border-2 rounded-lg font-semibold capitalize transition-all ${
                            newEquipment.size === size
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Complexity */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Complexity</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['simple', 'standard', 'complex'] as const).map((complexity) => (
                        <button
                          key={complexity}
                          onClick={() => setNewEquipment({ ...newEquipment, complexity })}
                          className={`p-3 border-2 rounded-lg font-semibold capitalize transition-all ${
                            newEquipment.complexity === complexity
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {complexity}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Notes (optional)
                    </label>
                    <input
                      type="text"
                      value={newEquipment.notes}
                      onChange={(e) => setNewEquipment({ ...newEquipment, notes: e.target.value })}
                      placeholder="Spare pump, jacketed vessel, etc."
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  {/* Preview */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="text-sm font-semibold text-green-900 mb-2">
                      Will Generate {EQUIPMENT_TEMPLATES[newEquipment.templateKey].deliverables.length} Deliverables:
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {EQUIPMENT_TEMPLATES[newEquipment.templateKey].deliverables.map((deliv, idx) => (
                        <div key={idx} className="flex items-center gap-1">
                          <span className="text-green-600">✓</span>
                          <span className="text-gray-700">{deliv.name}</span>
                          <span className="text-gray-500">({deliv.discipline})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewEquipment({ tag: '', templateKey: '', size: 'medium', complexity: 'standard', notes: '' });
                }}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
              >
                Cancel
              </button>
              {newEquipment.templateKey && (
                <button
                  onClick={addEquipment}
                  disabled={!newEquipment.tag}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Add Equipment
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
