import React, { useState, useEffect } from 'react';

interface RACIEntry {
  deliverable: string;
  phase: string;
  responsible: string[];
  accountable: string[];
  consulted: string[];
  informed: string[];
}

interface RACIMatrixProps {
  deliverables?: any[];
  projectTeam?: string[];
}

const DEFAULT_ROLES = [
  'Project Manager',
  'Lead Engineer',
  'Civil Engineer',
  'Mechanical Engineer',
  'Electrical Engineer',
  'Structural Engineer',
  'Chemical Engineer',
  'QA/QC Manager',
  'Client Representative',
  'Construction Manager'
];

export default function RACIMatrix({ deliverables = [], projectTeam = DEFAULT_ROLES }: RACIMatrixProps) {
  const [raciData, setRaciData] = useState<{ [deliverableKey: string]: RACIEntry }>({});
  const [selectedDeliverable, setSelectedDeliverable] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [customRoles, setCustomRoles] = useState<string[]>([]);
  const [newRoleName, setNewRoleName] = useState('');
  const [showAddRole, setShowAddRole] = useState(false);
  const [disciplineFilter, setDisciplineFilter] = useState<string>('All');
  const [phaseFilter, setPhaseFilter] = useState<string>('All');

  const allRoles = [...projectTeam, ...customRoles];

  // Helper function to determine discipline from deliverable name
  const getDiscipline = (deliverableName: string): string => {
    const name = deliverableName.toLowerCase();

    if (name.includes('civil') || name.includes('site') || name.includes('grading') || name.includes('drainage')) return 'Civil';
    if (name.includes('structural') || name.includes('foundation') || name.includes('steel') || name.includes('concrete')) return 'Structural';
    if (name.includes('mechanical') || name.includes('hvac') || name.includes('piping') || name.includes('equipment')) return 'Mechanical';
    if (name.includes('electrical') || name.includes('instrument') || name.includes('control')) return 'Electrical/Instrumentation';
    if (name.includes('process') || name.includes('p&id') || name.includes('pfd') || name.includes('chemical')) return 'Process';
    if (name.includes('automation') || name.includes('scada') || name.includes('dcs')) return 'Automation';
    if (name.includes('survey')) return 'Survey';
    if (name.includes('project') || name.includes('management') || name.includes('plan') || name.includes('schedule')) return 'Project Management';

    return 'General';
  };

  // Get unique disciplines from deliverables
  const availableDisciplines = ['All', ...Array.from(new Set(deliverables.map(d => getDiscipline(d.name))))];

  // Get unique phases from deliverables
  const availablePhases = ['All', ...Array.from(new Set(deliverables.map(d => d.milestone)))];

  // Filter deliverables by discipline and phase
  const filteredDeliverables = deliverables.filter(d => {
    const disciplineMatch = disciplineFilter === 'All' || getDiscipline(d.name) === disciplineFilter;
    const phaseMatch = phaseFilter === 'All' || d.milestone === phaseFilter;
    return disciplineMatch && phaseMatch;
  });

  // Helper function to auto-assign RACI based on deliverable type
  const getDefaultRACIAssignment = (deliverableName: string): Partial<RACIEntry> => {
    const name = deliverableName.toLowerCase();

    // Default assignments based on deliverable type
    if (name.includes('project') && name.includes('plan')) {
      return {
        responsible: ['Project Manager'],
        accountable: ['Project Manager'],
        consulted: ['Lead Engineer', 'Client Representative'],
        informed: ['QA/QC Manager']
      };
    }

    if (name.includes('civil') || name.includes('site')) {
      return {
        responsible: ['Civil Engineer'],
        accountable: ['Lead Engineer'],
        consulted: ['Structural Engineer', 'Project Manager'],
        informed: ['Client Representative']
      };
    }

    if (name.includes('structural')) {
      return {
        responsible: ['Structural Engineer'],
        accountable: ['Lead Engineer'],
        consulted: ['Civil Engineer', 'Project Manager'],
        informed: ['Client Representative']
      };
    }

    if (name.includes('mechanical') || name.includes('hvac') || name.includes('piping')) {
      return {
        responsible: ['Mechanical Engineer'],
        accountable: ['Lead Engineer'],
        consulted: ['Project Manager', 'Chemical Engineer'],
        informed: ['Client Representative']
      };
    }

    if (name.includes('electrical') || name.includes('instrument')) {
      return {
        responsible: ['Electrical Engineer'],
        accountable: ['Lead Engineer'],
        consulted: ['Project Manager'],
        informed: ['Client Representative']
      };
    }

    if (name.includes('p&id') || name.includes('process') || name.includes('pfd')) {
      return {
        responsible: ['Chemical Engineer'],
        accountable: ['Lead Engineer'],
        consulted: ['Mechanical Engineer', 'Project Manager'],
        informed: ['Client Representative']
      };
    }

    if (name.includes('qa') || name.includes('qc') || name.includes('quality')) {
      return {
        responsible: ['QA/QC Manager'],
        accountable: ['Project Manager'],
        consulted: ['Lead Engineer'],
        informed: ['Client Representative']
      };
    }

    if (name.includes('construction') || name.includes('build')) {
      return {
        responsible: ['Construction Manager'],
        accountable: ['Project Manager'],
        consulted: ['Lead Engineer', 'QA/QC Manager'],
        informed: ['Client Representative']
      };
    }

    // Default generic assignment
    return {
      responsible: ['Lead Engineer'],
      accountable: ['Project Manager'],
      consulted: ['QA/QC Manager'],
      informed: ['Client Representative']
    };
  };

  useEffect(() => {
    // Initialize RACI entries for deliverables with default assignments
    const initialRaci: { [key: string]: RACIEntry } = {};
    deliverables.forEach((d) => {
      const key = `${d.milestone}-${d.name}`;
      if (!raciData[key]) {
        const defaults = getDefaultRACIAssignment(d.name);
        initialRaci[key] = {
          deliverable: d.name,
          phase: d.milestone,
          responsible: defaults.responsible || [],
          accountable: defaults.accountable || [],
          consulted: defaults.consulted || [],
          informed: defaults.informed || []
        };
      }
    });
    setRaciData(prev => ({ ...prev, ...initialRaci }));
  }, [deliverables]);

  const toggleRACIAssignment = (deliverableKey: string, role: string, type: 'responsible' | 'accountable' | 'consulted' | 'informed') => {
    setRaciData(prev => {
      const entry = prev[deliverableKey] || {
        deliverable: deliverableKey.split('-')[1],
        phase: deliverableKey.split('-')[0],
        responsible: [],
        accountable: [],
        consulted: [],
        informed: []
      };

      const currentList = entry[type];
      const newList = currentList.includes(role)
        ? currentList.filter(r => r !== role)
        : [...currentList, role];

      return {
        ...prev,
        [deliverableKey]: {
          ...entry,
          [type]: newList
        }
      };
    });
  };

  const addCustomRole = () => {
    if (newRoleName && !allRoles.includes(newRoleName)) {
      setCustomRoles([...customRoles, newRoleName]);
      setNewRoleName('');
      setShowAddRole(false);
    }
  };

  const deleteRole = (roleToDelete: string) => {
    // Only allow deleting custom roles, not default roles
    if (customRoles.includes(roleToDelete)) {
      setCustomRoles(customRoles.filter(r => r !== roleToDelete));

      // Remove the role from all RACI assignments
      setRaciData(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(key => {
          updated[key] = {
            ...updated[key],
            responsible: updated[key].responsible.filter(r => r !== roleToDelete),
            accountable: updated[key].accountable.filter(r => r !== roleToDelete),
            consulted: updated[key].consulted.filter(r => r !== roleToDelete),
            informed: updated[key].informed.filter(r => r !== roleToDelete)
          };
        });
        return updated;
      });
    }
  };

  const getRACIColor = (type: string) => {
    const colors = {
      responsible: 'bg-blue-100 text-blue-800 border-blue-300',
      accountable: 'bg-green-100 text-green-800 border-green-300',
      consulted: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      informed: 'bg-gray-100 text-gray-800 border-gray-300',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100';
  };

  const getRACILetter = (deliverableKey: string, role: string): string => {
    const entry = raciData[deliverableKey];
    if (!entry) return '';

    const letters = [];
    if (entry.responsible.includes(role)) letters.push('R');
    if (entry.accountable.includes(role)) letters.push('A');
    if (entry.consulted.includes(role)) letters.push('C');
    if (entry.informed.includes(role)) letters.push('I');

    return letters.join(',');
  };

  if (deliverables.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">RACI Matrix</h3>
        <div className="text-center text-gray-500 py-8">
          <p>No deliverables loaded. Please load deliverables from the template or custom selection first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">RACI Matrix</h3>
            <p className="text-sm text-gray-600 mt-1">
              Define roles and responsibilities for each deliverable
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddRole(true)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
            >
              + Add Role
            </button>
            <button
              onClick={() => setEditMode(!editMode)}
              className={`px-4 py-2 rounded-lg text-sm ${
                editMode
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {editMode ? 'Done Editing' : 'Edit Matrix'}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Discipline Filter */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Discipline:</label>
            <select
              value={disciplineFilter}
              onChange={(e) => setDisciplineFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {availableDisciplines.map(discipline => (
                <option key={discipline} value={discipline}>
                  {discipline} {discipline === 'All' ? `(${deliverables.length})` : `(${deliverables.filter(d => getDiscipline(d.name) === discipline).length})`}
                </option>
              ))}
            </select>
          </div>

          {/* Phase Filter */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Phase:</label>
            <select
              value={phaseFilter}
              onChange={(e) => setPhaseFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {availablePhases.map(phase => (
                <option key={phase} value={phase}>
                  {phase} {phase === 'All' ? `(${deliverables.length})` : `(${deliverables.filter(d => d.milestone === phase).length})`}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          {(disciplineFilter !== 'All' || phaseFilter !== 'All') && (
            <button
              onClick={() => {
                setDisciplineFilter('All');
                setPhaseFilter('All');
              }}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded border bg-blue-100 text-blue-800 border-blue-300 font-semibold">R</span>
            <span>Responsible - Does the work</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded border bg-green-100 text-green-800 border-green-300 font-semibold">A</span>
            <span>Accountable - Approves/Signs off</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded border bg-yellow-100 text-yellow-800 border-yellow-300 font-semibold">C</span>
            <span>Consulted - Provides input</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded border bg-gray-100 text-gray-800 border-gray-300 font-semibold">I</span>
            <span>Informed - Kept in the loop</span>
          </div>
        </div>
      </div>

      {/* RACI Table */}
      <div className="p-6">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="border-collapse">
            <thead className="sticky top-0 z-20">
              <tr>
                <th className="p-1 text-left border border-gray-300 bg-gray-100 sticky left-0 z-30" style={{ width: '180px' }}>
                  <div className="font-semibold text-xs">Deliverable</div>
                </th>
                <th className="p-1 text-center border border-gray-300 bg-gray-100" style={{ width: '80px' }}>
                  <div className="font-semibold text-xs">Phase</div>
                </th>
                {allRoles.map((role, idx) => {
                  // Split role name into words
                  const words = role.split(' ');
                  const isCustomRole = customRoles.includes(role);
                  return (
                    <th
                      key={idx}
                      className="p-1 text-center border border-gray-300 bg-gray-100 text-xs font-semibold relative"
                      style={{ minWidth: '60px' }}
                    >
                      {isCustomRole && (
                        <button
                          onClick={() => deleteRole(role)}
                          className="absolute top-0 right-0 text-red-600 hover:text-red-800 text-xs px-1"
                          title="Delete role"
                        >
                          ✕
                        </button>
                      )}
                      {words.map((word, i) => (
                        <div key={i}>{word}</div>
                      ))}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {filteredDeliverables.map((deliverable, idx) => {
                const key = `${deliverable.milestone}-${deliverable.name}`;
                return (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="p-1 border border-gray-200 sticky left-0 bg-white z-10" style={{ width: '180px' }}>
                      <div className="font-medium text-xs">{deliverable.name}</div>
                      <div className="text-xs text-gray-500 truncate">{deliverable.description}</div>
                    </td>
                    <td className="p-1 border border-gray-200 text-center">
                      <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-medium uppercase">
                        {deliverable.milestone}
                      </span>
                    </td>
                    {allRoles.map((role, roleIdx) => {
                      const raciLetters = getRACILetter(key, role);
                      return (
                        <td
                          key={roleIdx}
                          className="p-1 border border-gray-200 text-center cursor-pointer hover:bg-gray-100"
                          onClick={() => editMode && setSelectedDeliverable(key)}
                        >
                          {raciLetters ? (
                            <span className="px-1.5 py-0.5 rounded border bg-gray-100 text-gray-800 border-gray-300 font-semibold text-xs">
                              {raciLetters}
                            </span>
                          ) : editMode ? (
                            <span className="text-gray-400 text-xs">+</span>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editMode && selectedDeliverable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              Assign Roles: {raciData[selectedDeliverable]?.deliverable}
            </h3>
            <div className="space-y-6">
              {/* Responsible */}
              <div>
                <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <span className="px-2 py-1 rounded border bg-blue-100 text-blue-800 border-blue-300 font-semibold">R</span>
                  Responsible (Does the work)
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {allRoles.map((role) => (
                    <label key={role} className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={raciData[selectedDeliverable]?.responsible.includes(role)}
                        onChange={() => toggleRACIAssignment(selectedDeliverable, role, 'responsible')}
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="text-sm">{role}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Accountable */}
              <div>
                <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <span className="px-2 py-1 rounded border bg-green-100 text-green-800 border-green-300 font-semibold">A</span>
                  Accountable (Approves/Signs off)
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {allRoles.map((role) => (
                    <label key={role} className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={raciData[selectedDeliverable]?.accountable.includes(role)}
                        onChange={() => toggleRACIAssignment(selectedDeliverable, role, 'accountable')}
                        className="h-4 w-4 text-green-600"
                      />
                      <span className="text-sm">{role}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Consulted */}
              <div>
                <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <span className="px-2 py-1 rounded border bg-yellow-100 text-yellow-800 border-yellow-300 font-semibold">C</span>
                  Consulted (Provides input)
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {allRoles.map((role) => (
                    <label key={role} className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={raciData[selectedDeliverable]?.consulted.includes(role)}
                        onChange={() => toggleRACIAssignment(selectedDeliverable, role, 'consulted')}
                        className="h-4 w-4 text-yellow-600"
                      />
                      <span className="text-sm">{role}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Informed */}
              <div>
                <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <span className="px-2 py-1 rounded border bg-gray-100 text-gray-800 border-gray-300 font-semibold">I</span>
                  Informed (Kept in the loop)
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {allRoles.map((role) => (
                    <label key={role} className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={raciData[selectedDeliverable]?.informed.includes(role)}
                        onChange={() => toggleRACIAssignment(selectedDeliverable, role, 'informed')}
                        className="h-4 w-4 text-gray-600"
                      />
                      <span className="text-sm">{role}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => setSelectedDeliverable(null)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Role Modal */}
      {showAddRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Add Custom Role</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role Name
                </label>
                <input
                  type="text"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Enter role name"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddRole(false);
                  setNewRoleName('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={addCustomRole}
                disabled={!newRoleName || allRoles.includes(newRoleName)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}