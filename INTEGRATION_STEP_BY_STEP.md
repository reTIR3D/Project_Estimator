# Step-by-Step Integration Guide
## Adding Equipment-Driven Estimation to Your Existing System

This guide shows **exactly** how to integrate the equipment-driven approach into your current ProjectEstimation.tsx while preserving ALL existing functionality.

---

## Integration Philosophy: Additive, Not Destructive

**Key Principle:** Add a new "Equipment" step between "Setup" and "Deliverables" that's **optional but recommended**.

```
Current Flow:
Setup → Team → Deliverables → WBS → RACI → Costs → Summary

Enhanced Flow:
Setup → Equipment (NEW) → Team → Deliverables → WBS → RACI → Costs → Summary
         ↓
         Auto-populates deliverables if equipment added
         Falls back to manual selection if skipped
```

---

## Phase 1: Add Equipment State & Types

### Step 1.1: Add Equipment Interface (Add to top of file)

```typescript
// Add after existing imports
interface Equipment {
  id: string;
  tag: string;
  templateKey: string;
  type: string; // vessel, pump, heat_exchanger, etc.
  size: 'small' | 'medium' | 'large';
  complexity: 'simple' | 'standard' | 'complex';
  notes?: string;
}

interface EquipmentTemplate {
  type: string;
  icon: string;
  deliverables: {
    name: string;
    discipline: string;
    baseHours: number;
  }[];
  complexityFactors: { simple: number; standard: number; complex: number };
  sizeFactors: { small: number; medium: number; large: number };
}
```

### Step 1.2: Add Equipment Templates (Add after interfaces)

```typescript
// Equipment templates - hardcoded initially, can move to database later
const EQUIPMENT_TEMPLATES: { [key: string]: EquipmentTemplate } = {
  vessel: {
    type: 'Pressure Vessel',
    icon: '⚗️',
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
    deliverables: [
      { name: 'Pump Datasheet', discipline: 'Process', baseHours: 12 },
      { name: 'Mechanical Seal Plan', discipline: 'Mechanical', baseHours: 8 },
      { name: 'Motor Specification', discipline: 'Electrical/Instrumentation', baseHours: 6 },
      { name: 'Foundation Design', discipline: 'Civil', baseHours: 16 },
    ],
    complexityFactors: { simple: 0.8, standard: 1.0, complex: 1.3 },
    sizeFactors: { small: 0.7, medium: 1.0, large: 1.2 },
  },
  // Add more templates as needed
};
```

### Step 1.3: Add Equipment State (Add to component state)

```typescript
// Add after existing state declarations (around line 47)
const [equipment, setEquipment] = useState<Equipment[]>([]);
const [useEquipmentMode, setUseEquipmentMode] = useState(false);
const [showAddEquipmentModal, setShowAddEquipmentModal] = useState(false);
```

---

## Phase 2: Update Stepper to Include Equipment

### Step 2.1: Modify EstimationStep Type

In `EstimationStepper.tsx`, update the type:

```typescript
// Change from:
export type EstimationStep = 'setup' | 'team' | 'deliverables' | 'wbs' | 'raci' | 'costs' | 'summary';

// To:
export type EstimationStep = 'setup' | 'equipment' | 'team' | 'deliverables' | 'wbs' | 'raci' | 'costs' | 'summary';
```

### Step 2.2: Update Progress Indicator

In the progress circles section (around line 389-446), add equipment step:

```typescript
{[
  { key: 'setup', label: 'Setup' },
  { key: 'equipment', label: 'Equipment' },  // NEW
  { key: 'team', label: 'Team' },
  { key: 'deliverables', label: 'Deliverables' },
  { key: 'wbs', label: 'WBS' },
  { key: 'raci', label: 'RACI' },
  { key: 'costs', label: 'Costs' },
  { key: 'summary', label: 'Summary' },
].map((step, index) => {
  // ... existing code
})}
```

---

## Phase 3: Add Equipment Step UI

### Step 3.1: Add Equipment Step Content (After setup step, around line 698)

```typescript
{/* Step 2: Equipment List (NEW) */}
{currentStep === 'equipment' && (
  <>
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Equipment List</h3>
          <p className="text-sm text-gray-600 mt-1">
            Add equipment to auto-generate deliverables (optional but recommended)
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setUseEquipmentMode(false);
              setCurrentStep('deliverables');
            }}
            className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Skip (Use Manual Mode)
          </button>
          <button
            onClick={() => setShowAddEquipmentModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            + Add Equipment
          </button>
        </div>
      </div>

      {/* Equipment Summary */}
      {equipment.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm font-semibold text-gray-600">Equipment Count</div>
            <div className="text-3xl font-bold text-blue-600">{equipment.length}</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-sm font-semibold text-gray-600">Auto-Generated Deliverables</div>
            <div className="text-3xl font-bold text-purple-600">
              {equipment.reduce((sum, eq) => {
                const template = EQUIPMENT_TEMPLATES[eq.templateKey];
                return sum + (template?.deliverables.length || 0);
              }, 0)}
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-sm font-semibold text-gray-600">Base Hours</div>
            <div className="text-3xl font-bold text-green-600">
              {equipment.reduce((sum, eq) => {
                const template = EQUIPMENT_TEMPLATES[eq.templateKey];
                if (!template) return sum;
                const sizeFactor = template.sizeFactors[eq.size];
                const complexityFactor = template.complexityFactors[eq.complexity];
                return sum + template.deliverables.reduce((s, d) =>
                  s + Math.round(d.baseHours * sizeFactor * complexityFactor), 0);
              }, 0)}
            </div>
          </div>
        </div>
      )}

      {/* Equipment List */}
      <div className="space-y-3">
        {equipment.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-4xl mb-4">📦</div>
            <div className="text-lg font-semibold text-gray-700">No equipment added yet</div>
            <div className="text-sm text-gray-500 mt-2">
              Add equipment to auto-generate deliverables, or skip to enter deliverables manually
            </div>
          </div>
        ) : (
          equipment.map((eq) => {
            const template = EQUIPMENT_TEMPLATES[eq.templateKey];
            if (!template) return null;

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
                        Generates {template.deliverables.length} deliverables
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setEquipment(equipment.filter(e => e.id !== eq.id))}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-semibold"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>

    {/* Navigation */}
    <div className="flex justify-between mt-6">
      <button
        onClick={() => setCurrentStep('setup')}
        className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
      >
        ← Back to Setup
      </button>
      <button
        onClick={() => {
          if (equipment.length > 0) {
            setUseEquipmentMode(true);
            // Auto-generate deliverables
            generateDeliverablesFromEquipment();
          }
          setCurrentStep('team');
        }}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
      >
        Next: Team →
      </button>
    </div>
  </>
)}
```

---

## Phase 4: Add Equipment Generation Logic

### Step 4.1: Add Deliverable Generation Function (Before component)

```typescript
// Add this function before the component
const generateDeliverablesFromEquipment = (
  equipmentList: Equipment[],
  projectType: string = 'DISCRETE_PROJECT'
) => {
  const generatedDeliverables: any[] = [];

  equipmentList.forEach((eq) => {
    const template = EQUIPMENT_TEMPLATES[eq.templateKey];
    if (!template) return;

    const sizeFactor = template.sizeFactors[eq.size];
    const complexityFactor = template.complexityFactors[eq.complexity];

    template.deliverables.forEach((deliv, idx) => {
      const baseHours = Math.round(deliv.baseHours * sizeFactor * complexityFactor);

      generatedDeliverables.push({
        name: deliv.name,
        description: `${eq.tag} - ${deliv.name}`,
        discipline: deliv.discipline,
        milestone: 'Design', // Default, can be enhanced based on project type
        base_hours: baseHours,
        adjusted_hours: baseHours,
        sequence: generatedDeliverables.length + 1,
        enabled: true,
        equipment_tag: eq.tag, // Link back to equipment
        equipment_type: template.type,
      });
    });
  });

  return generatedDeliverables;
};
```

### Step 4.2: Update generateDeliverablesFromEquipment Call

```typescript
// Add this inside the component (around line 300)
const generateDeliverablesFromEquipmentHandler = () => {
  if (equipment.length === 0) return;

  const generated = generateDeliverablesFromEquipment(equipment, project?.work_type || 'DISCRETE_PROJECT');
  setDeliverables(generated);

  // Calculate total
  const total = generated.reduce((sum, d) => sum + (d.adjusted_hours || d.base_hours || 0), 0);
  setDeliverablesTotal(total);

  // Auto-load into estimation if callback exists
  if (onLoadTemplate) {
    onLoadTemplate(generated);
  }
};
```

---

## Phase 5: Add Equipment Modal

### Step 5.1: Add Equipment Modal Component (At end of file, before export)

```typescript
// Add before the final export default
function AddEquipmentModal({
  onAdd,
  onClose
}: {
  onAdd: (eq: Equipment) => void;
  onClose: () => void;
}) {
  const [tag, setTag] = useState('');
  const [templateKey, setTemplateKey] = useState('');
  const [size, setSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [complexity, setComplexity] = useState<'simple' | 'standard' | 'complex'>('standard');
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    if (!tag || !templateKey) {
      alert('Please enter tag and select type');
      return;
    }

    const template = EQUIPMENT_TEMPLATES[templateKey];
    onAdd({
      id: Date.now().toString(),
      tag: tag.toUpperCase(),
      templateKey,
      type: template.type,
      size,
      complexity,
      notes: notes || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Add Equipment</h3>

        <div className="space-y-4">
          {!templateKey ? (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Select Equipment Type</label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(EQUIPMENT_TEMPLATES).map(([key, template]) => (
                  <button
                    key={key}
                    onClick={() => setTemplateKey(key)}
                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 text-left transition-all"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{template.icon}</span>
                      <span className="font-bold text-gray-900">{template.type}</span>
                    </div>
                    <div className="text-xs text-gray-600">{template.deliverables.length} deliverables</div>
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
                <button
                  onClick={() => setTemplateKey('')}
                  className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
                >
                  Change Type
                </button>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Equipment Tag *</label>
                <input
                  type="text"
                  value={tag}
                  onChange={(e) => setTag(e.target.value.toUpperCase())}
                  placeholder="V-101, P-205A, E-301..."
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none font-mono"
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
                        className={`flex-1 p-2 border-2 rounded-lg capitalize font-semibold transition-all ${
                          size === s ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200'
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
                        className={`flex-1 p-2 border-2 rounded-lg capitalize font-semibold transition-all ${
                          complexity === c ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Notes (optional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Spare pump, jacketed vessel, etc."
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
            </>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
          >
            Cancel
          </button>
          {templateKey && (
            <button
              onClick={handleSubmit}
              disabled={!tag}
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Add Equipment
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

### Step 5.2: Render Modal (Add before closing div of component)

```typescript
{/* Add Equipment Modal */}
{showAddEquipmentModal && (
  <AddEquipmentModal
    onAdd={(newEq) => {
      setEquipment([...equipment, newEq]);
      setShowAddEquipmentModal(false);
    }}
    onClose={() => setShowAddEquipmentModal(false)}
  />
)}
```

---

## Phase 6: Update Deliverables Matrix Integration

### Step 6.1: Modify DeliverablesMatrix Props

When rendering DeliverablesMatrix, pass equipment data:

```typescript
{currentStep === 'deliverables' && (
  <>
    <div className="bg-white rounded-lg shadow p-0">
      {useEquipmentMode && equipment.length > 0 ? (
        <div className="p-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-green-600 text-xl">✓</span>
              <div>
                <div className="font-semibold text-green-900">Equipment-Based Mode</div>
                <div className="text-sm text-green-700">
                  {deliverables.length} deliverables auto-generated from {equipment.length} equipment items
                </div>
              </div>
            </div>
          </div>

          {/* Show deliverables grouped by equipment */}
          <div className="space-y-4">
            {equipment.map((eq) => {
              const eqDeliverables = deliverables.filter(d => d.equipment_tag === eq.tag);
              const template = EQUIPMENT_TEMPLATES[eq.templateKey];

              return (
                <div key={eq.id} className="border-2 border-blue-200 rounded-lg">
                  <div className="bg-blue-50 p-4 border-b border-blue-200">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{template?.icon}</span>
                      <span className="font-bold text-gray-900">{eq.tag}</span>
                      <span className="text-sm text-gray-600">- {template?.type}</span>
                      <span className="ml-auto text-sm text-gray-600">
                        {eqDeliverables.length} deliverables
                      </span>
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    {eqDeliverables.map((deliv, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                        <div>
                          <div className="font-semibold text-gray-900">{deliv.name}</div>
                          <div className="text-xs text-gray-600">{deliv.discipline}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-blue-600">{deliv.adjusted_hours}h</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={() => {
                setUseEquipmentMode(false);
                setDeliverables([]);
              }}
              className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
            >
              ← Switch to Manual Deliverable Selection
            </button>
          </div>
        </div>
      ) : (
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
      )}
    </div>
    {/* ... rest of navigation ... */}
  </>
)}
```

---

## Phase 7: Backward Compatibility

### Step 7.1: Handle Legacy Projects

```typescript
// In the loadProject useEffect (around line 143)
useEffect(() => {
  if (id) {
    projectsApi.get(id).then((data) => {
      // ... existing code ...

      // NEW: Check if project has equipment
      if (data.equipment && data.equipment.length > 0) {
        setEquipment(data.equipment);
        setUseEquipmentMode(true);
        // Auto-generate deliverables from equipment
        const generated = generateDeliverablesFromEquipment(data.equipment, data.work_type);
        setDeliverables(generated);
      } else {
        // Legacy project - no equipment, use manual mode
        setUseEquipmentMode(false);
      }
    });
  }
}, [id, navigate]);
```

### Step 7.2: Update Save Handler

```typescript
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
      equipment: equipment.length > 0 ? equipment : undefined, // NEW: Save equipment
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
```

---

## Phase 8: Add Equipment Indicator to Setup Step

### Step 8.1: Add Toggle in Setup Step

```typescript
{/* Step 1: Setup */}
{currentStep === 'setup' && (
  <>
    {/* ... existing setup content ... */}

    {/* NEW: Equipment Mode Toggle */}
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-4 mt-6">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 text-3xl">⚙️</div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 mb-1">Equipment-Driven Estimation (Recommended)</h3>
          <p className="text-sm text-gray-600 mb-3">
            Add equipment to auto-generate deliverables for higher accuracy. Skip to use manual mode.
          </p>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="use-equipment"
              checked={useEquipmentMode || equipment.length > 0}
              onChange={(e) => {
                setUseEquipmentMode(e.target.checked);
                if (!e.target.checked) {
                  setEquipment([]);
                }
              }}
              className="h-4 w-4 text-blue-600 rounded"
            />
            <label htmlFor="use-equipment" className="text-sm font-semibold text-gray-700">
              Use equipment-based estimation
              {equipment.length > 0 && (
                <span className="ml-2 text-blue-600">({equipment.length} equipment added)</span>
              )}
            </label>
          </div>
        </div>
      </div>
    </div>

    {/* ... existing navigation ... */}
  </>
)}
```

---

## Summary of Changes

### Files Modified:
1. **ProjectEstimation.tsx** - Add equipment state, UI, and generation logic
2. **EstimationStepper.tsx** - Add 'equipment' step type
3. **Project type (backend)** - Add optional equipment field

### New Features Added:
✅ Equipment list builder
✅ Auto-deliverable generation
✅ Equipment templates (vessel, pump, etc.)
✅ Size & complexity multipliers
✅ Equipment → deliverable linkage
✅ Toggle between equipment/manual mode
✅ Backward compatibility with existing projects

### Preserved Features:
✅ All existing steps (setup, team, deliverables, WBS, RACI, costs, summary)
✅ Phase-gate tracker
✅ Campaign features
✅ Client management
✅ Rate sheets
✅ Manual deliverable selection
✅ All existing UI/UX

### User Experience:
- **New projects:** Encouraged to add equipment, but can skip
- **Existing projects:** Continue working exactly as before
- **Equipment mode:** Auto-generates deliverables, shows equipment grouping
- **Manual mode:** Works exactly like current system

---

## Testing Checklist

After integration, test these scenarios:

- [ ] Create new project with equipment → deliverables auto-generate
- [ ] Create new project without equipment → manual mode works
- [ ] Load existing project → works unchanged
- [ ] Add equipment mid-project → deliverables update
- [ ] Delete equipment → deliverables removed
- [ ] Switch from equipment to manual mode → works
- [ ] Save project with equipment → equipment persists
- [ ] Phase-gate project with equipment → phase tracker works
- [ ] Campaign project with equipment → campaign features work

---

## Next Steps

1. **Start with Phase 1-2:** Add types and state
2. **Test with Phase 3:** Add UI for equipment step
3. **Implement Phase 4-5:** Add generation logic and modal
4. **Integrate Phase 6:** Connect to deliverables matrix
5. **Ensure Phase 7:** Backward compatibility
6. **Polish Phase 8:** Setup step indicator

This integration is **100% additive** - nothing breaks, everything enhances! 🚀
