import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface SizeSettings {
  id?: string;
  small_min_hours: number;
  small_max_hours: number;
  medium_min_hours: number;
  medium_max_hours: number;
  large_min_hours: number;
  large_max_hours: number;
  phase_gate_recommendation_hours: number;
  auto_adjust_project_size: boolean;
  warn_on_size_mismatch: boolean;
  recommend_phase_gate: boolean;
  is_active: boolean;
}

export default function ProjectSizeSettings() {
  const [settings, setSettings] = useState<SizeSettings>({
    small_min_hours: 0,
    small_max_hours: 500,
    medium_min_hours: 501,
    medium_max_hours: 2000,
    large_min_hours: 2001,
    large_max_hours: 10000,
    phase_gate_recommendation_hours: 5000,
    auto_adjust_project_size: false,
    warn_on_size_mismatch: true,
    recommend_phase_gate: true,
    is_active: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get('http://localhost:8000/api/v1/project-size-settings/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSettings(response.data);
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    setMessage('');
    try {
      const token = localStorage.getItem('access_token');

      if (settings.id) {
        // Update existing
        await axios.patch(
          `http://localhost:8000/api/v1/project-size-settings/${settings.id}`,
          settings,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // Create new
        const response = await axios.post(
          'http://localhost:8000/api/v1/project-size-settings/',
          settings,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSettings(response.data);
      }

      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
      setMessage('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof SizeSettings, value: number | boolean) => {
    setSettings({ ...settings, [field]: value });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900">Project Size Configuration</h1>
        <p className="text-gray-600 mt-1">Define hour thresholds for automatic project size classification</p>
      </div>

      {/* Size Thresholds - Stacked Slider */}
      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <h2 className="text-lg font-semibold text-gray-900">Size Thresholds (Hours)</h2>

        <div className="space-y-8 pt-4">
          {/* Visual Stacked Slider */}
          <div className="relative h-32 bg-gray-100 rounded-lg overflow-hidden">
            {/* Background colored sections */}
            <div className="absolute inset-0 flex">
              <div
                className="bg-gradient-to-r from-green-200 to-green-300"
                style={{ width: `${(settings.small_max_hours / 10000) * 100}%` }}
              />
              <div
                className="bg-gradient-to-r from-blue-200 to-blue-300"
                style={{ width: `${((settings.medium_max_hours - settings.small_max_hours) / 10000) * 100}%` }}
              />
              <div
                className="bg-gradient-to-r from-orange-200 to-orange-300"
                style={{ width: `${((settings.large_max_hours - settings.medium_max_hours) / 10000) * 100}%` }}
              />
            </div>

            {/* Labels */}
            <div className="absolute inset-0 flex items-center justify-around px-4">
              <div className="text-center">
                <div className="font-bold text-green-800 text-lg">SMALL</div>
                <div className="text-xs text-green-700 font-medium">0 - {settings.small_max_hours}h</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-blue-800 text-lg">MEDIUM</div>
                <div className="text-xs text-blue-700 font-medium">{settings.medium_min_hours} - {settings.medium_max_hours}h</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-orange-800 text-lg">LARGE</div>
                <div className="text-xs text-orange-700 font-medium">{settings.large_min_hours}h+</div>
              </div>
            </div>

            {/* Draggable dividers */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize hover:bg-blue-400 transition-colors"
              style={{ left: `${(settings.small_max_hours / 10000) * 100}%` }}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('threshold', 'small_max');
              }}
              onDrag={(e) => {
                if (e.clientX > 0) {
                  const container = e.currentTarget.parentElement;
                  if (container) {
                    const rect = container.getBoundingClientRect();
                    const percentage = ((e.clientX - rect.left) / rect.width);
                    const newValue = Math.round(percentage * 10000);
                    if (newValue > 0 && newValue < settings.medium_max_hours) {
                      updateField('small_max_hours', newValue);
                      updateField('medium_min_hours', newValue + 1);
                    }
                  }
                }
              }}
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded shadow text-xs font-bold whitespace-nowrap">
                {settings.small_max_hours}h
              </div>
            </div>

            <div
              className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize hover:bg-blue-400 transition-colors"
              style={{ left: `${(settings.medium_max_hours / 10000) * 100}%` }}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('threshold', 'medium_max');
              }}
              onDrag={(e) => {
                if (e.clientX > 0) {
                  const container = e.currentTarget.parentElement;
                  if (container) {
                    const rect = container.getBoundingClientRect();
                    const percentage = ((e.clientX - rect.left) / rect.width);
                    const newValue = Math.round(percentage * 10000);
                    if (newValue > settings.small_max_hours && newValue < 10000) {
                      updateField('medium_max_hours', newValue);
                      updateField('large_min_hours', newValue + 1);
                    }
                  }
                }
              }}
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded shadow text-xs font-bold whitespace-nowrap">
                {settings.medium_max_hours}h
              </div>
            </div>
          </div>

          {/* Fine-tune inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-green-700 mb-2">Small/Medium Threshold</label>
              <input
                type="number"
                value={settings.small_max_hours}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  updateField('small_max_hours', val);
                  updateField('medium_min_hours', val + 1);
                }}
                className="w-full px-3 py-2 border-2 border-green-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                min="0"
                max={settings.medium_max_hours - 1}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-700 mb-2">Medium/Large Threshold</label>
              <input
                type="number"
                value={settings.medium_max_hours}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  updateField('medium_max_hours', val);
                  updateField('large_min_hours', val + 1);
                }}
                className="w-full px-3 py-2 border-2 border-blue-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                min={settings.small_max_hours + 1}
                max={10000}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Phase-Gate Recommendation */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Phase-Gate Process Recommendation</h2>
        <p className="text-sm text-gray-600">
          Configure when to recommend phase-gate governance process based on project complexity and hours.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-purple-700 mb-2">
              Phase-Gate Recommendation Threshold (hours)
            </label>
            <input
              type="number"
              value={settings.phase_gate_recommendation_hours}
              onChange={(e) => updateField('phase_gate_recommendation_hours', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border-2 border-purple-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              min="0"
              max="10000"
            />
            <p className="text-xs text-gray-500 mt-1">
              Projects with total hours ≥ this threshold will receive a phase-gate process recommendation
            </p>
          </div>

          <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:border-purple-300 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={settings.recommend_phase_gate}
              onChange={(e) => updateField('recommend_phase_gate', e.target.checked)}
              className="mt-1 h-5 w-5 text-purple-600 rounded focus:ring-purple-500"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900">Enable Phase-Gate Recommendations</div>
              <div className="text-sm text-gray-600 mt-1">
                Show recommendations to use phase-gate process for large or complex projects
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Auto-Adjustment Options */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Automatic Size Management</h2>

        <div className="space-y-3">
          <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={settings.warn_on_size_mismatch}
              onChange={(e) => updateField('warn_on_size_mismatch', e.target.checked)}
              className="mt-1 h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
            />
            <div>
              <div className="font-medium text-gray-900">Show Size Warnings</div>
              <div className="text-sm text-gray-600">
                Display warnings when project hours don't match the selected size category
              </div>
            </div>
          </label>

          <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={settings.auto_adjust_project_size}
              onChange={(e) => updateField('auto_adjust_project_size', e.target.checked)}
              className="mt-1 h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
            />
            <div>
              <div className="font-medium text-gray-900">Auto-Adjust Project Size</div>
              <div className="text-sm text-gray-600">
                Automatically upgrade project size when hours exceed the current category threshold
              </div>
            </div>
          </label>

          <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:border-purple-300 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={settings.recommend_phase_gate}
              onChange={(e) => updateField('recommend_phase_gate', e.target.checked)}
              className="mt-1 h-5 w-5 text-purple-600 rounded focus:ring-purple-500"
            />
            <div>
              <div className="font-medium text-gray-900">Recommend Phase-Gate Process</div>
              <div className="text-sm text-gray-600">
                Suggest phase-gate governance for large/complex projects (≥{settings.phase_gate_recommendation_hours} hours)
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Visual Guide */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg shadow p-6 space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Size Configuration</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <div className="w-32 font-medium text-green-700">0 - {settings.small_max_hours}h</div>
              <div className="flex-1 h-8 bg-gradient-to-r from-green-200 to-green-400 rounded-lg flex items-center justify-center text-sm font-semibold text-green-900">
                SMALL
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-32 font-medium text-blue-700">{settings.medium_min_hours} - {settings.medium_max_hours}h</div>
              <div className="flex-1 h-8 bg-gradient-to-r from-blue-200 to-blue-400 rounded-lg flex items-center justify-center text-sm font-semibold text-blue-900">
                MEDIUM
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-32 font-medium text-orange-700">{settings.large_min_hours}h+</div>
              <div className="flex-1 h-8 bg-gradient-to-r from-orange-200 to-orange-400 rounded-lg flex items-center justify-center text-sm font-semibold text-orange-900">
                LARGE
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-purple-200">
          <h4 className="text-md font-semibold text-purple-900 mb-2">Phase-Gate Process Recommendation</h4>
          <div className="flex items-center gap-4">
            <div className="w-32 font-medium text-purple-700">≥{settings.phase_gate_recommendation_hours}h</div>
            <div className="flex-1 h-8 bg-gradient-to-r from-purple-200 to-purple-400 rounded-lg flex items-center justify-center text-sm font-semibold text-purple-900">
              SUGGEST PHASE-GATE PROCESS
            </div>
          </div>
          <p className="text-xs text-purple-700 mt-2">
            💡 Phase-gate is a <strong>governance type</strong>, not a size. Projects of any size can use phase-gate process.
          </p>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-between">
        <div>
          {message && (
            <div className={`text-sm font-medium ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </div>
          )}
        </div>
        <button
          onClick={saveSettings}
          disabled={saving}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold transition-colors"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
