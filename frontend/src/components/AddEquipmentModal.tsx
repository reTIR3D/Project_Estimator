import { useState } from 'react';
import { Equipment, EquipmentTemplateKey, EquipmentScope } from '../types';
import { EQUIPMENT_TEMPLATES } from '../config/equipmentTemplates';
import { EQUIPMENT_SUBTYPES, EquipmentSubtype } from '../config/equipmentSubtypes';
import { DISCIPLINE_PACKAGES, getApplicablePackages, DisciplinePackage } from '../config/disciplinePackages';

interface AddEquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (equipment: Equipment) => void;
}

export default function AddEquipmentModal({ isOpen, onClose, onAdd }: AddEquipmentModalProps) {
  const [description, setDescription] = useState('');
  const [tag, setTag] = useState('');
  const [templateKey, setTemplateKey] = useState<EquipmentTemplateKey>('vessel');
  const [selectedSubtype, setSelectedSubtype] = useState<EquipmentSubtype | null>(null);
  const [scope, setScope] = useState<EquipmentScope>('typical');
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);
  const [equipmentCounter, setEquipmentCounter] = useState(1);

  if (!isOpen) return null;

  // Get tag prefix based on equipment type
  const getTagPrefix = (type: EquipmentTemplateKey): string => {
    const prefixes = {
      vessel: 'V',
      pump: 'P',
      pd_pump: 'PD',
      heat_exchanger: 'E',
      tank: 'TK',
      compressor: 'K',
      tower: 'T'
    };
    return prefixes[type] || 'EQ';
  };

  // Generate auto tag from description or use counter
  const generateAutoTag = (): string => {
    const prefix = getTagPrefix(templateKey);

    if (description.trim()) {
      // Create tag from description (e.g., "Feed Gas Separator" -> "V-Feed-Gas-Separator")
      const descPart = description.trim().replace(/\s+/g, '-').substring(0, 30);
      return `${prefix}-[${descPart}]`;
    } else {
      // Use counter-based tag
      return `${prefix}-TBD-${String(equipmentCounter).padStart(3, '0')}`;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      alert('Please enter an equipment description');
      return;
    }

    // Use provided tag or auto-generate
    const finalTag = tag.trim() || generateAutoTag();

    const newEquipment: Equipment = {
      id: `eq-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tag: finalTag,
      description: description.trim(),
      templateKey,
      subtypeId: selectedSubtype?.id,
      scope,
      selectedPackages,
    };

    onAdd(newEquipment);

    // Increment counter for next equipment
    setEquipmentCounter(prev => prev + 1);

    // Reset form
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setDescription('');
    setTag('');
    setTemplateKey('vessel');
    setSelectedSubtype(null);
    setScope('typical');
    setSelectedPackages([]);
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  // When category changes, update subtype and recommended settings
  const handleCategoryChange = (key: EquipmentTemplateKey) => {
    setTemplateKey(key);
    const subtypes = EQUIPMENT_SUBTYPES[key] || [];
    if (subtypes.length > 0) {
      const defaultSubtype = subtypes[0];
      setSelectedSubtype(defaultSubtype);
      setScope(defaultSubtype.recommendedScope);
    } else {
      setSelectedSubtype(null);
      setScope('typical');
    }
    setSelectedPackages([]); // Reset packages when category changes
  };

  // When subtype changes, update recommended settings
  const handleSubtypeChange = (subtype: EquipmentSubtype) => {
    setSelectedSubtype(subtype);
    setScope(subtype.recommendedScope);
  };

  // When scope changes
  const handleScopeChange = (newScope: EquipmentScope) => {
    setScope(newScope);
  };

  const togglePackage = (packageId: string) => {
    setSelectedPackages(prev =>
      prev.includes(packageId)
        ? prev.filter(id => id !== packageId)
        : [...prev, packageId]
    );
  };

  const selectedTemplate = EQUIPMENT_TEMPLATES[templateKey];
  const availableSubtypes = EQUIPMENT_SUBTYPES[templateKey] || [];
  const applicablePackages = getApplicablePackages(templateKey);

  // Calculate total hours based on scope and subtype deliverables
  const baseHours = selectedSubtype
    ? selectedSubtype.deliverables[scope].reduce((sum, d) => sum + d.hours, 0)
    : 0;
  const packageHours = selectedPackages.reduce((sum, pkgId) => {
    const pkg = DISCIPLINE_PACKAGES.find(p => p.id === pkgId);
    return sum + (pkg?.totalHours || 0);
  }, 0);
  const totalHours = baseHours + packageHours;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[95vh] flex flex-col">
        {/* Header - Sticky */}
        <div className="sticky top-0 bg-white rounded-t-lg border-b border-gray-200 z-10">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Add Equipment</h2>
                <p className="text-xs text-gray-500 mt-0.5">Configure equipment and select discipline packages</p>
              </div>

              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        {/* Two-Column Layout */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="px-6 py-4 grid grid-cols-[1fr,380px] gap-6">

            {/* Left Column - Main Configuration */}
            <div className="space-y-4">
              {/* Description and Tag Section */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {/* Description */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="e.g., Feed Gas Separator"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      required
                    />
                  </div>

                  {/* Tag (Optional) */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
                      Tag Number <span className="text-gray-400 normal-case">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) => setTag(e.target.value)}
                      placeholder={`e.g., ${generateAutoTag()}`}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Equipment Category */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Equipment Category</label>
                <div className="flex items-center gap-1 flex-wrap">
                  {Object.entries(EQUIPMENT_TEMPLATES).map(([key, template]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleCategoryChange(key as EquipmentTemplateKey)}
                      className={`flex flex-col items-center justify-center gap-1 w-[80px] h-[72px] rounded-lg transition-all ${
                        templateKey === key
                          ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-300'
                          : 'bg-white text-gray-700 hover:bg-blue-50 hover:shadow-md border border-gray-200'
                      }`}
                    >
                      <div className="w-8 h-8 flex items-center justify-center">
                        <span className="text-2xl leading-none">{template.icon}</span>
                      </div>
                      <span className="text-[9px] font-medium leading-tight text-center px-1">
                        {template.type}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Specific Type */}
              {availableSubtypes.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Specific Type</label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {availableSubtypes.map((subtype) => (
                      <button
                        key={subtype.id}
                        type="button"
                        onClick={() => handleSubtypeChange(subtype)}
                        className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-lg transition-all ${
                          selectedSubtype?.id === subtype.id
                            ? 'bg-blue-500 text-white shadow-md'
                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                        }`}
                      >
                        <span className="text-xs font-semibold leading-tight text-center">
                          {subtype.name}
                        </span>
                        <span className="text-[9px] leading-tight text-center opacity-80">
                          {subtype.description}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Equipment Scope */}
              {selectedSubtype && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Equipment Scope</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['basic', 'typical', 'complex'] as EquipmentScope[]).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleScopeChange(s)}
                        className={`px-2 py-2 rounded-lg border-2 transition-all ${
                          scope === s
                            ? 'border-blue-500 bg-blue-500 text-white shadow-md'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300 hover:bg-gray-100'
                        }`}
                      >
                        <div className="text-sm font-semibold capitalize text-center leading-tight">{s}</div>
                        <div className={`text-[10px] text-center leading-tight mt-1 ${scope === s ? 'text-blue-100' : 'text-gray-600'}`}>
                          {selectedSubtype.deliverables[s].length} deliverables • {selectedSubtype.deliverables[s].reduce((sum, d) => sum + d.hours, 0)}h
                        </div>
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-500 mt-2 italic">
                    💡 Deliverables can be viewed and adjusted on the deliverables page after adding equipment
                  </p>
                </div>
              )}
            </div>

            {/* Right Column - Discipline Packages */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Discipline Packages <span className="text-gray-400 normal-case">(Optional)</span></label>
              <div className="space-y-1.5">
                {applicablePackages.map((pkg) => {
                  const isSelected = selectedPackages.includes(pkg.id);

                  return (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() => togglePackage(pkg.id)}
                      className={`w-full px-2 py-1.5 rounded-lg border-2 transition-all text-left ${
                        isSelected
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-300 bg-white hover:border-blue-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{pkg.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold leading-tight truncate">{pkg.name}</div>
                          <div className="text-[10px] text-gray-600 leading-tight">
                            +{pkg.totalHours}h • {pkg.deliverables.length} items
                          </div>
                        </div>
                        {isSelected && <span className="text-green-600 text-sm">✓</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-gray-500 mt-2 italic">
                💡 Package deliverables can be viewed and adjusted on the deliverables page after adding equipment
              </p>
            </div>

          </div>

          {/* Summary Footer and Action Buttons - Sticky Footer */}
          <div className="sticky bottom-0 bg-white border-t rounded-b-lg">
            {/* Summary Panel */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border-b-2 border-blue-300 px-6 py-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900 truncate leading-tight">
                    {description || selectedTemplate.type} {tag ? `(${tag})` : description ? `(${generateAutoTag()})` : ''}
                  </h3>
                  <p className="text-xs text-gray-600 mt-0.5 leading-tight">
                    {selectedSubtype?.name || selectedTemplate.type} • <span className="capitalize">{scope}</span> scope
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-2xl font-bold text-blue-600 leading-none">{totalHours}h</div>
                  <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                    <div>
                      {selectedSubtype ? `${selectedSubtype.deliverables[scope].length} deliverables` : 'No equipment selected'}
                    </div>
                    {selectedPackages.length > 0 && (
                      <div className="text-green-600 font-medium">{selectedPackages.length} packages</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-6 py-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md"
              >
                Add Equipment
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
