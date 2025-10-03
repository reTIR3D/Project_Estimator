import { useState } from 'react';
import { Equipment, EquipmentTemplateKey, EquipmentSize, EquipmentComplexity } from '../types';
import { EQUIPMENT_TEMPLATES } from '../config/equipmentTemplates';

interface AddEquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (equipment: Equipment) => void;
}

export default function AddEquipmentModal({ isOpen, onClose, onAdd }: AddEquipmentModalProps) {
  const [tag, setTag] = useState('');
  const [templateKey, setTemplateKey] = useState<EquipmentTemplateKey>('vessel');
  const [size, setSize] = useState<EquipmentSize>('medium');
  const [complexity, setComplexity] = useState<EquipmentComplexity>('standard');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!tag.trim()) {
      alert('Please enter an equipment tag');
      return;
    }

    const newEquipment: Equipment = {
      id: `eq-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tag: tag.trim(),
      templateKey,
      size,
      complexity,
    };

    onAdd(newEquipment);

    // Reset form
    setTag('');
    setTemplateKey('vessel');
    setSize('medium');
    setComplexity('standard');

    onClose();
  };

  const handleCancel = () => {
    // Reset form
    setTag('');
    setTemplateKey('vessel');
    setSize('medium');
    setComplexity('standard');
    onClose();
  };

  const selectedTemplate = EQUIPMENT_TEMPLATES[templateKey];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Add Equipment</h2>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Equipment Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Equipment Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(EQUIPMENT_TEMPLATES).map(([key, template]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTemplateKey(key as EquipmentTemplateKey)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    templateKey === key
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-blue-300 hover:shadow'
                  }`}
                >
                  <div className="text-3xl mb-2">{template.icon}</div>
                  <div className="text-sm font-medium text-gray-900">{template.type}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {template.deliverables.length} deliverables
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Equipment Tag */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Equipment Tag <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="e.g., V-101, P-205A, E-301"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Unique identifier for this equipment (e.g., V-101 for Vessel 101)
            </p>
          </div>

          {/* Size */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Size
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['small', 'medium', 'large'] as EquipmentSize[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    size === s
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="text-sm font-medium capitalize">{s}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {selectedTemplate.sizeFactors[s]}× hours
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Complexity */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Complexity
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['simple', 'standard', 'complex'] as EquipmentComplexity[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setComplexity(c)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    complexity === c
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="text-sm font-medium capitalize">{c}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {selectedTemplate.complexityFactors[c]}× hours
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Will Generate {selectedTemplate.deliverables.length} Deliverables:
            </h3>
            <div className="space-y-2">
              {selectedTemplate.deliverables.map((deliv, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs">
                  <span className="text-blue-600">•</span>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{deliv.name}</div>
                    <div className="text-gray-500">
                      {deliv.discipline} • Base: {deliv.baseHours}h × {selectedTemplate.sizeFactors[size]} (size) × {selectedTemplate.complexityFactors[complexity]} (complexity) = {Math.round(deliv.baseHours * selectedTemplate.sizeFactors[size] * selectedTemplate.complexityFactors[complexity])}h
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Add Equipment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
