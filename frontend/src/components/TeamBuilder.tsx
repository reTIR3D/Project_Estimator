import React, { useState, useEffect } from 'react';

export interface TeamMember {
  role: string;
  name?: string;
  discipline: string;
  isCore: boolean; // Core roles always included, discipline-specific can be toggled
}

interface TeamBuilderProps {
  selectedDisciplines: string[];
  projectSize: string;
  onTeamChange: (team: TeamMember[]) => void;
  initialTeam?: TeamMember[];
}

// Core roles for all projects
const CORE_ROLES = [
  { role: 'Project Manager', discipline: 'Project Management', isCore: true },
  { role: 'Lead Engineer', discipline: 'Project Management', isCore: true },
  { role: 'QA/QC Manager', discipline: 'Quality', isCore: true },
  { role: 'Client Representative', discipline: 'Project Management', isCore: true },
];

// Discipline-specific role mappings
const DISCIPLINE_ROLES: { [key: string]: { role: string; sizes: string[] }[] } = {
  'Civil': [
    { role: 'Civil Engineer', sizes: ['SMALL', 'MEDIUM', 'LARGE'] },
    { role: 'Civil Lead', sizes: ['MEDIUM', 'LARGE'] },
    { role: 'Civil Designer', sizes: ['LARGE'] },
    { role: 'Civil Drafter', sizes: ['MEDIUM', 'LARGE'] },
    { role: 'Civil Design Specialist', sizes: ['LARGE'] },
  ],
  'Structural': [
    { role: 'Structural Engineer', sizes: ['SMALL', 'MEDIUM', 'LARGE'] },
    { role: 'Structural Lead', sizes: ['MEDIUM', 'LARGE'] },
    { role: 'Structural Designer', sizes: ['LARGE'] },
    { role: 'Structural Drafter', sizes: ['MEDIUM', 'LARGE'] },
    { role: 'Structural Design Specialist', sizes: ['LARGE'] },
  ],
  'Mechanical': [
    { role: 'Mechanical Engineer', sizes: ['SMALL', 'MEDIUM', 'LARGE'] },
    { role: 'Mechanical Lead', sizes: ['MEDIUM', 'LARGE'] },
    { role: 'HVAC Engineer', sizes: ['LARGE'] },
    { role: 'Mechanical Designer', sizes: ['MEDIUM', 'LARGE'] },
    { role: 'Mechanical Drafter', sizes: ['MEDIUM', 'LARGE'] },
    { role: 'Piping Designer', sizes: ['LARGE'] },
  ],
  'Electrical/Instrumentation': [
    { role: 'Electrical Engineer', sizes: ['SMALL', 'MEDIUM', 'LARGE'] },
    { role: 'Electrical Lead', sizes: ['MEDIUM', 'LARGE'] },
    { role: 'Instrumentation Engineer', sizes: ['LARGE'] },
    { role: 'Electrical Designer', sizes: ['MEDIUM', 'LARGE'] },
    { role: 'Electrical Drafter', sizes: ['MEDIUM', 'LARGE'] },
    { role: 'I&E Design Specialist', sizes: ['LARGE'] },
  ],
  'Process': [
    { role: 'Chemical Engineer', sizes: ['SMALL', 'MEDIUM', 'LARGE'] },
    { role: 'Process Engineer', sizes: ['MEDIUM', 'LARGE'] },
    { role: 'Process Lead', sizes: ['LARGE'] },
    { role: 'Process Designer', sizes: ['MEDIUM', 'LARGE'] },
    { role: 'P&ID Specialist', sizes: ['LARGE'] },
  ],
  'Survey': [
    { role: 'Survey Engineer', sizes: ['SMALL', 'MEDIUM', 'LARGE'] },
    { role: 'Survey Lead', sizes: ['MEDIUM', 'LARGE'] },
    { role: 'Survey Technician', sizes: ['MEDIUM', 'LARGE'] },
  ],
  'Automation': [
    { role: 'Automation Engineer', sizes: ['SMALL', 'MEDIUM', 'LARGE'] },
    { role: 'Controls Engineer', sizes: ['MEDIUM', 'LARGE'] },
    { role: 'SCADA Engineer', sizes: ['LARGE'] },
    { role: 'PLC Programmer', sizes: ['MEDIUM', 'LARGE'] },
    { role: 'HMI Designer', sizes: ['LARGE'] },
  ],
};

// Sample company employee list - this could come from a database/API
const COMPANY_EMPLOYEES = [
  'John Smith',
  'Sarah Johnson',
  'Michael Brown',
  'Emily Davis',
  'David Wilson',
  'Jessica Martinez',
  'Robert Taylor',
  'Amanda Anderson',
  'Christopher Thomas',
  'Jennifer Jackson',
  'Matthew White',
  'Ashley Harris',
  'Daniel Martin',
  'Michelle Thompson',
  'James Garcia',
].sort();

export default function TeamBuilder({ selectedDisciplines, projectSize, onTeamChange, initialTeam }: TeamBuilderProps) {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [customRole, setCustomRole] = useState('');
  const [customDiscipline, setCustomDiscipline] = useState('');
  const [newRoleByDiscipline, setNewRoleByDiscipline] = useState<{ [key: string]: string }>({});
  const [newPersonByDiscipline, setNewPersonByDiscipline] = useState<{ [key: string]: string }>({});
  const [assigningRole, setAssigningRole] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Initialize team based on disciplines and project size
  useEffect(() => {
    const newTeam: TeamMember[] = [];

    // Add core roles
    CORE_ROLES.forEach(coreRole => {
      newTeam.push({ ...coreRole });
    });

    // Add discipline-specific roles
    selectedDisciplines.forEach(discipline => {
      const roles = DISCIPLINE_ROLES[discipline] || [];
      roles.forEach(({ role, sizes }) => {
        // Only add roles appropriate for project size
        if (sizes.includes(projectSize)) {
          newTeam.push({
            role,
            discipline,
            isCore: false,
            name: undefined,
          });
        }
      });
    });

    setTeam(newTeam);
    onTeamChange(newTeam);
  }, [selectedDisciplines, projectSize]);

  const handleToggleRole = (role: string) => {
    const updated = team.map(member =>
      member.role === role ? { ...member, enabled: !member.enabled } : member
    );
    setTeam(updated);
    onTeamChange(updated);
  };

  const handleNameChange = (role: string, name: string) => {
    const updated = team.map(member =>
      member.role === role ? { ...member, name: name || undefined } : member
    );
    setTeam(updated);
    onTeamChange(updated);
  };

  const handleAssignPerson = (role: string, personName: string) => {
    handleNameChange(role, personName);
    setAssigningRole(null);
    setSearchTerm('');
  };

  const handleUnassignPerson = (role: string) => {
    handleNameChange(role, '');
  };

  const filteredEmployees = COMPANY_EMPLOYEES.filter(emp =>
    emp.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCustomRole = () => {
    if (!customRole.trim()) return;

    const newMember: TeamMember = {
      role: customRole,
      discipline: customDiscipline || 'Custom',
      isCore: false,
      name: undefined,
    };

    const updated = [...team, newMember];
    setTeam(updated);
    onTeamChange(updated);
    setCustomRole('');
    setCustomDiscipline('');
  };

  const handleRemoveRole = (role: string) => {
    const updated = team.filter(member => member.role !== role);
    setTeam(updated);
    onTeamChange(updated);
  };

  const handleAddRoleToDiscipline = (discipline: string) => {
    const selectedRole = newRoleByDiscipline[discipline];
    const personName = newPersonByDiscipline[discipline];

    if (!selectedRole) return;

    const newMember: TeamMember = {
      role: selectedRole,
      discipline: discipline,
      isCore: false,
      name: personName || undefined,
    };

    const updated = [...team, newMember];
    setTeam(updated);
    onTeamChange(updated);

    // Clear the input fields for this discipline
    setNewRoleByDiscipline(prev => ({ ...prev, [discipline]: '' }));
    setNewPersonByDiscipline(prev => ({ ...prev, [discipline]: '' }));
  };

  // Get available roles for a discipline (all roles from DISCIPLINE_ROLES, not just size-filtered)
  const getAvailableRolesForDiscipline = (discipline: string): string[] => {
    const roles = DISCIPLINE_ROLES[discipline] || [];
    return roles.map(r => r.role);
  };

  // Group team members by discipline
  const groupedTeam = team.reduce((acc, member) => {
    if (!acc[member.discipline]) {
      acc[member.discipline] = [];
    }
    acc[member.discipline].push(member);
    return acc;
  }, {} as { [key: string]: TeamMember[] });

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Build Project Team</h2>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              Project Size: <span className="font-semibold">{projectSize}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">Team Members:</span>
              <span className="ml-2 text-lg font-bold text-blue-600">{team.length}</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-600 mt-1">
          Roles suggested based on disciplines and project size. Assign people or add/remove roles as needed.
        </p>
      </div>

      {/* Team Members by Discipline */}
      <div className="space-y-3 mb-4">
        {Object.entries(groupedTeam).map(([discipline, members]) => (
          <div key={discipline} className="border border-gray-200 rounded-lg p-3">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">{discipline}</h3>
            <div className="flex flex-wrap gap-2">
              {members.map(member => (
                <div key={member.role} className="relative group">
                  <button
                    onClick={() => setAssigningRole(member.role)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      member.name
                        ? 'bg-green-100 text-green-800 hover:bg-green-200 border-2 border-green-300'
                        : 'bg-orange-100 text-orange-800 hover:bg-orange-200 border-2 border-orange-300'
                    }`}
                  >
                    <div className="flex flex-col items-start">
                      <div className="flex items-center gap-1">
                        <span className="font-semibold">{member.role}</span>
                        {member.isCore && (
                          <span className="text-xs bg-blue-500 text-white px-1 rounded">Core</span>
                        )}
                      </div>
                      {member.name && (
                        <span className="text-xs mt-0.5 opacity-90">{member.name}</span>
                      )}
                      {!member.name && (
                        <span className="text-xs mt-0.5 italic opacity-75">Unassigned</span>
                      )}
                    </div>
                  </button>
                  {!member.isCore && (
                    <button
                      onClick={() => handleRemoveRole(member.role)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      title="Remove role"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}

              {/* Add role button */}
              {DISCIPLINE_ROLES[discipline] && (
                <div className="relative group">
                  <button
                    onClick={() => {
                      // Toggle the dropdown for this discipline
                      setNewRoleByDiscipline(prev => ({
                        ...prev,
                        [discipline]: prev[discipline] === undefined ? '' : undefined
                      }));
                    }}
                    className="px-3 py-2 rounded-lg text-xs font-medium transition-all bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-dashed border-gray-300 hover:border-gray-400 h-full min-h-[44px] flex items-center justify-center"
                    title="Add role"
                  >
                    <span className="text-lg">+</span>
                  </button>

                  {/* Dropdown appears when button is clicked */}
                  {newRoleByDiscipline[discipline] !== undefined && (
                    <div className="absolute top-full left-0 mt-1 z-10 bg-white border border-gray-300 rounded-lg shadow-lg min-w-[200px]">
                      <div className="p-2">
                        <select
                          value={newRoleByDiscipline[discipline] || ''}
                          onChange={(e) => {
                            setNewRoleByDiscipline(prev => ({ ...prev, [discipline]: e.target.value }));
                            if (e.target.value) {
                              handleAddRoleToDiscipline(discipline);
                            }
                          }}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          autoFocus
                        >
                          <option value="">Select role...</option>
                          {getAvailableRolesForDiscipline(discipline).map(role => (
                            <option key={role} value={role}>{role}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Custom Role */}
      <div className="border-t pt-3">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Add Custom Role</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={customRole}
            onChange={(e) => setCustomRole(e.target.value)}
            placeholder="Role name (e.g., 'Safety Officer')"
            className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
          <input
            type="text"
            value={customDiscipline}
            onChange={(e) => setCustomDiscipline(e.target.value)}
            placeholder="Discipline"
            className="w-32 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={handleAddCustomRole}
            disabled={!customRole.trim()}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-xs font-medium"
          >
            Add
          </button>
        </div>
      </div>

      {/* Assignment Modal */}
      {assigningRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setAssigningRole(null)}>
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Assign Team Member</h3>
                <p className="text-sm text-gray-600 mt-1">{assigningRole}</p>
              </div>
              <button
                onClick={() => setAssigningRole(null)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            {/* Current Assignment */}
            {team.find(m => m.role === assigningRole)?.name && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-green-600 font-semibold">Currently Assigned:</p>
                    <p className="text-sm text-green-900 font-medium">
                      {team.find(m => m.role === assigningRole)?.name}
                    </p>
                  </div>
                  <button
                    onClick={() => handleUnassignPerson(assigningRole)}
                    className="px-2 py-1 bg-red-100 text-red-600 rounded text-xs hover:bg-red-200"
                  >
                    Unassign
                  </button>
                </div>
              </div>
            )}

            {/* Search */}
            <div className="mb-3">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search employees..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                autoFocus
              />
            </div>

            {/* Employee List */}
            <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map(employee => (
                  <button
                    key={employee}
                    onClick={() => handleAssignPerson(assigningRole, employee)}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors"
                  >
                    {employee}
                  </button>
                ))
              ) : (
                <p className="px-4 py-3 text-sm text-gray-500 text-center">No employees found</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
