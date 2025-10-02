import React, { useState, useEffect } from 'react';

interface WBSTask {
  id: string;
  name: string;
  description?: string;
  deliverable?: string;
  phase: string;
  discipline: string;
  duration_days: number;
  start_date?: string;
  end_date?: string;
  dependencies: string[]; // IDs of predecessor tasks
  progress: number; // 0-100
  assignee?: string;
  level: number; // 0 = deliverable, 1 = task, 2 = subtask
  parent_id?: string;
  children?: WBSTask[];
  expanded?: boolean;
  type?: 'task' | 'milestone' | 'hold_point'; // Task type
  is_critical_path?: boolean;
}

interface WBSProps {
  deliverables?: any[];
}

export default function WBS({ deliverables = [] }: WBSProps) {
  const [tasks, setTasks] = useState<WBSTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [parentTaskId, setParentTaskId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<WBSTask | null>(null);
  const [viewMode, setViewMode] = useState<'tree' | 'gantt'>('gantt');

  // Form state for adding/editing tasks
  const [taskName, setTaskName] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskDuration, setTaskDuration] = useState(5);
  const [taskDependencies, setTaskDependencies] = useState<string[]>([]);
  const [taskAssignee, setTaskAssignee] = useState('');
  const [taskType, setTaskType] = useState<'task' | 'milestone' | 'hold_point'>('task');

  useEffect(() => {
    // Initialize WBS from deliverables
    if (deliverables.length > 0) {
      initializeWBSFromDeliverables();
    }
  }, [deliverables]);

  const initializeWBSFromDeliverables = () => {
    // Phase order for dependencies
    const phaseOrder = ['ifd', 'ifr', 'ifh', 'ifa', 'ifc'];
    const phasesWithReviews = ['ifr', 'ifa', 'ifc']; // Only major milestones get client reviews

    // Group deliverables by phase
    const delsByPhase: { [phase: string]: any[] } = {};
    deliverables.forEach(d => {
      const phase = d.milestone.toLowerCase();
      if (!delsByPhase[phase]) delsByPhase[phase] = [];
      delsByPhase[phase].push(d);
    });

    const allTasks: WBSTask[] = [];
    const phaseLastTasks: { [phase: string]: string } = {}; // Track last task in each phase
    let taskIndex = 0;

    // Create tasks for each phase
    phaseOrder.forEach((phase, phaseIdx) => {
      const phaseDels = delsByPhase[phase] || [];
      if (phaseDels.length === 0) return; // Skip phases with no deliverables

      // Create phase group (parent task)
      const phaseGroupId = `phase-${phase}`;
      const phaseChildren: WBSTask[] = [];

      let previousTaskId: string | null = null;

      // Add deliverable tasks as children of phase group
      phaseDels.forEach((d, idx) => {
        const taskId = `del-${taskIndex++}`;
        const dependencies = [];

        // First task in phase depends on previous phase
        if (idx === 0 && phaseIdx > 0) {
          const prevPhase = phaseOrder[phaseIdx - 1];
          if (phaseLastTasks[prevPhase]) {
            dependencies.push(phaseLastTasks[prevPhase]);
          }
        } else if (previousTaskId) {
          // Sequential within phase
          dependencies.push(previousTaskId);
        }

        phaseChildren.push({
          id: taskId,
          name: d.name,
          description: d.description,
          deliverable: d.name,
          phase: d.milestone,
          discipline: d.description?.split(' - ')[0] || 'Unknown',
          duration_days: Math.ceil(d.adjusted_hours / 8),
          dependencies: dependencies,
          progress: 0,
          level: 1,
          type: 'task',
          parent_id: phaseGroupId,
          children: [],
          expanded: true
        });
        previousTaskId = taskId;
      });

      // Add client review hold point only at major milestones
      if (phasesWithReviews.includes(phase)) {
        const holdPointId = `hold-${phase}-review`;
        phaseChildren.push({
          id: holdPointId,
          name: `Client Review`,
          description: `Client review and approval for ${phase.toUpperCase()} phase`,
          phase: phase,
          discipline: 'Multidiscipline',
          duration_days: 3,
          dependencies: previousTaskId ? [previousTaskId] : [],
          progress: 0,
          level: 1,
          type: 'hold_point',
          assignee: 'Client Representative',
          parent_id: phaseGroupId,
          children: [],
          expanded: true
        });
        previousTaskId = holdPointId;
      }

      // Add phase group with children
      allTasks.push({
        id: phaseGroupId,
        name: phase.toUpperCase(),
        description: `${phase.toUpperCase()} Phase`,
        phase: phase,
        discipline: 'Multidiscipline',
        duration_days: phaseChildren.reduce((sum, t) => sum + t.duration_days, 0),
        dependencies: phaseIdx > 0 && phaseLastTasks[phaseOrder[phaseIdx - 1]] ? [phaseLastTasks[phaseOrder[phaseIdx - 1]]] : [],
        progress: 0,
        level: 0,
        type: 'task',
        children: phaseChildren,
        expanded: true
      });

      phaseLastTasks[phase] = previousTaskId || phaseGroupId;
    });

    // Calculate start and end dates based on dependencies
    calculateTaskDates(allTasks);

    setTasks(allTasks);
  };

  const calculateTaskDates = (taskList: WBSTask[]) => {
    const today = new Date();

    // Flatten all tasks including children
    const flattenTasks = (tasks: WBSTask[]): WBSTask[] => {
      const flat: WBSTask[] = [];
      tasks.forEach(t => {
        flat.push(t);
        if (t.children && t.children.length > 0) {
          flat.push(...flattenTasks(t.children));
        }
      });
      return flat;
    };

    const allTasks = flattenTasks(taskList);
    const taskMap = new Map(allTasks.map(t => [t.id, t]));

    // Helper to calculate task start date based on dependencies
    const getTaskStartDate = (task: WBSTask): Date => {
      if (task.dependencies.length === 0) {
        return today;
      }

      let latestEndDate = today;
      task.dependencies.forEach(depId => {
        const depTask = taskMap.get(depId);
        if (depTask && depTask.end_date) {
          const depEndDate = new Date(depTask.end_date);
          if (depEndDate > latestEndDate) {
            latestEndDate = depEndDate;
          }
        }
      });

      // Add 1 day buffer after dependency completes
      return new Date(latestEndDate.getTime() + 24 * 60 * 60 * 1000);
    };

    // Calculate dates for all tasks (process in order)
    allTasks.forEach(task => {
      const startDate = getTaskStartDate(task);
      const endDate = new Date(startDate.getTime() + task.duration_days * 24 * 60 * 60 * 1000);

      task.start_date = startDate.toISOString();
      task.end_date = endDate.toISOString();
    });

    // Update parent phase dates based on children
    taskList.forEach(phase => {
      if (phase.children && phase.children.length > 0) {
        const childStartDates = phase.children.map(c => c.start_date ? new Date(c.start_date) : today);
        const childEndDates = phase.children.map(c => c.end_date ? new Date(c.end_date) : today);

        phase.start_date = new Date(Math.min(...childStartDates.map(d => d.getTime()))).toISOString();
        phase.end_date = new Date(Math.max(...childEndDates.map(d => d.getTime()))).toISOString();
      }
    });
  };

  const toggleExpand = (taskId: string) => {
    const updateExpanded = (taskList: WBSTask[]): WBSTask[] => {
      return taskList.map(task => {
        if (task.id === taskId) {
          return { ...task, expanded: !task.expanded };
        }
        if (task.children) {
          return { ...task, children: updateExpanded(task.children) };
        }
        return task;
      });
    };
    setTasks(updateExpanded(tasks));
  };

  const openAddTaskModal = (parentId?: string) => {
    setParentTaskId(parentId || null);
    setEditingTask(null);
    setTaskName('');
    setTaskDescription('');
    setTaskDuration(5);
    setTaskDependencies([]);
    setTaskAssignee('');
    setTaskType('task');
    setShowAddTaskModal(true);
  };

  const openEditTaskModal = (task: WBSTask) => {
    setEditingTask(task);
    setTaskName(task.name);
    setTaskDescription(task.description || '');
    setTaskDuration(task.duration_days);
    setTaskDependencies(task.dependencies);
    setTaskAssignee(task.assignee || '');
    setTaskType(task.type || 'task');
    setShowAddTaskModal(true);
  };

  const addOrUpdateTask = () => {
    if (!taskName) return;

    if (editingTask) {
      // Update existing task
      const updateTask = (taskList: WBSTask[]): WBSTask[] => {
        return taskList.map(task => {
          if (task.id === editingTask.id) {
            return {
              ...task,
              name: taskName,
              description: taskDescription,
              duration_days: taskDuration,
              dependencies: taskDependencies,
              assignee: taskAssignee,
              type: taskType
            };
          }
          if (task.children) {
            return { ...task, children: updateTask(task.children) };
          }
          return task;
        });
      };
      setTasks(updateTask(tasks));
    } else {
      // Add new task
      const newTask: WBSTask = {
        id: `task-${Date.now()}`,
        name: taskName,
        description: taskDescription,
        phase: '',
        discipline: '',
        duration_days: taskDuration,
        dependencies: taskDependencies,
        progress: 0,
        level: parentTaskId ? getTaskLevel(parentTaskId) + 1 : 0,
        parent_id: parentTaskId || undefined,
        assignee: taskAssignee,
        type: taskType,
        children: [],
        expanded: true
      };

      if (parentTaskId) {
        // Add as child of parent task
        const addToParent = (taskList: WBSTask[]): WBSTask[] => {
          return taskList.map(task => {
            if (task.id === parentTaskId) {
              return {
                ...task,
                children: [...(task.children || []), newTask]
              };
            }
            if (task.children) {
              return { ...task, children: addToParent(task.children) };
            }
            return task;
          });
        };
        setTasks(addToParent(tasks));
      } else {
        // Add as top-level task
        setTasks([...tasks, newTask]);
      }
    }

    setShowAddTaskModal(false);
  };

  const getTaskLevel = (taskId: string): number => {
    const findLevel = (taskList: WBSTask[], currentLevel: number): number => {
      for (const task of taskList) {
        if (task.id === taskId) return currentLevel;
        if (task.children) {
          const foundLevel = findLevel(task.children, currentLevel + 1);
          if (foundLevel !== -1) return foundLevel;
        }
      }
      return -1;
    };
    return findLevel(tasks, 0);
  };

  const deleteTask = (taskId: string) => {
    const removeTask = (taskList: WBSTask[]): WBSTask[] => {
      return taskList
        .filter(task => task.id !== taskId)
        .map(task => ({
          ...task,
          children: task.children ? removeTask(task.children) : []
        }));
    };
    setTasks(removeTask(tasks));
    setSelectedTask(null);
  };

  const getAllTasks = (): WBSTask[] => {
    const flatten = (taskList: WBSTask[]): WBSTask[] => {
      return taskList.reduce((acc: WBSTask[], task) => {
        acc.push(task);
        if (task.children) {
          acc.push(...flatten(task.children));
        }
        return acc;
      }, []);
    };
    return flatten(tasks);
  };

  const renderTreeTask = (task: WBSTask, depth: number = 0) => {
    const indent = depth * 24;
    const hasChildren = task.children && task.children.length > 0;
    const isSelected = selectedTask === task.id;

    return (
      <React.Fragment key={task.id}>
        <div
          className={`flex items-center py-2 px-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer ${
            isSelected ? 'bg-blue-50' : ''
          } ${task.level === 0 ? 'bg-purple-50 font-semibold border-l-4 border-l-purple-500' : ''}`}
          style={{ paddingLeft: `${indent + 16}px` }}
          onClick={() => setSelectedTask(task.id)}
        >
          {/* Expand/Collapse Button */}
          <div className="w-6">
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand(task.id);
                }}
                className="text-gray-600 hover:text-gray-900"
              >
                {task.expanded ? '▼' : '▶'}
              </button>
            )}
          </div>

          {/* Task Icon */}
          <div className="w-8">
            {task.type === 'milestone' ? (
              <span className="text-yellow-600">🏁</span>
            ) : task.type === 'hold_point' ? (
              <span className="text-red-600">⏸️</span>
            ) : task.level === 0 ? (
              <span className="text-purple-600">📅</span>
            ) : (
              <span className="text-blue-600">📋</span>
            )}
          </div>

          {/* Task Name */}
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm">{task.name}</div>
            {task.description && (
              <div className="text-xs text-gray-500 truncate">{task.description}</div>
            )}
          </div>

          {/* Phase Badge */}
          {task.phase && (
            <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium uppercase mx-2">
              {task.phase}
            </div>
          )}

          {/* Duration */}
          <div className="w-20 text-sm text-gray-600 text-center">
            {task.duration_days}d
          </div>

          {/* Progress Bar */}
          <div className="w-32 mx-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${task.progress}%` }}
              />
            </div>
          </div>

          {/* Assignee */}
          <div className="w-32 text-sm text-gray-600 truncate">
            {task.assignee || '-'}
          </div>

          {/* Actions */}
          <div className="flex gap-2 ml-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                openAddTaskModal(task.id);
              }}
              className="text-blue-600 hover:text-blue-800 text-sm"
              title="Add subtask"
            >
              +
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                openEditTaskModal(task);
              }}
              className="text-green-600 hover:text-green-800 text-sm"
              title="Edit task"
            >
              ✎
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Delete "${task.name}"?`)) {
                  deleteTask(task.id);
                }
              }}
              className="text-red-600 hover:text-red-800 text-sm"
              title="Delete task"
            >
              ×
            </button>
          </div>
        </div>

        {/* Render children if expanded */}
        {task.expanded && hasChildren && task.children!.map(child => renderTreeTask(child, depth + 1))}
      </React.Fragment>
    );
  };

  const renderGanttView = () => {
    // Simple Gantt visualization
    const allTasks = getAllTasks();
    const today = new Date();
    const startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000); // 1 week ago
    const endDate = new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000); // 2 months ahead
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));

    return (
      <div className="overflow-x-auto">
        <div className="min-w-[1200px]">
          {/* Timeline Header */}
          <div className="flex border-b border-gray-300 bg-gray-100 sticky top-0">
            <div className="w-64 p-2 font-semibold border-r border-gray-300">Task</div>
            <div className="flex-1 flex">
              {Array.from({ length: Math.ceil(totalDays / 7) }, (_, i) => {
                const weekStart = new Date(startDate.getTime() + i * 7 * 24 * 60 * 60 * 1000);
                return (
                  <div
                    key={i}
                    className="flex-1 p-2 text-center text-xs border-r border-gray-300"
                  >
                    {weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Task Rows */}
          {allTasks.map((task) => {
            const taskStart = task.start_date ? new Date(task.start_date) : today;
            const taskEnd = task.end_date ? new Date(task.end_date) : new Date(taskStart.getTime() + task.duration_days * 24 * 60 * 60 * 1000);
            const leftPercent = ((taskStart.getTime() - startDate.getTime()) / (endDate.getTime() - startDate.getTime())) * 100;
            const widthPercent = ((taskEnd.getTime() - taskStart.getTime()) / (endDate.getTime() - startDate.getTime())) * 100;

            // Color based on task type
            let barColor = 'bg-blue-500';
            if (task.type === 'milestone') {
              barColor = 'bg-yellow-500';
            } else if (task.type === 'hold_point') {
              barColor = 'bg-red-500';
            }

            // Icon based on type
            let icon = '';
            if (task.type === 'milestone') {
              icon = '🏁 ';
            } else if (task.type === 'hold_point') {
              icon = '⏸️ ';
            }

            return (
              <div key={task.id} className="flex border-b border-gray-200 hover:bg-gray-50">
                <div className="w-64 p-2 text-sm border-r border-gray-300 truncate">
                  {'  '.repeat(task.level)}
                  {icon}{task.name}
                </div>
                <div className="flex-1 relative" style={{ height: '40px' }}>
                  {/* Dependency lines */}
                  {task.dependencies.map((depId) => {
                    const depTask = allTasks.find(t => t.id === depId);
                    if (depTask && depTask.end_date) {
                      const depEndDate = new Date(depTask.end_date);
                      const depEndPercent = ((depEndDate.getTime() - startDate.getTime()) / (endDate.getTime() - startDate.getTime())) * 100;
                      return (
                        <div
                          key={depId}
                          className="absolute border-t-2 border-gray-400 border-dashed"
                          style={{
                            left: `${Math.max(0, depEndPercent)}%`,
                            right: `${Math.max(0, 100 - leftPercent)}%`,
                            top: '8px'
                          }}
                        />
                      );
                    }
                    return null;
                  })}

                  {/* Task bar */}
                  <div
                    className={`absolute top-2 h-6 ${barColor} rounded ${task.type === 'milestone' ? 'w-3' : ''}`}
                    style={{
                      left: `${Math.max(0, leftPercent)}%`,
                      width: task.type === 'milestone' ? '12px' : `${Math.min(100 - leftPercent, widthPercent)}%`
                    }}
                    title={`${task.name}: ${task.duration_days} days`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (deliverables.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Work Breakdown Structure (WBS)</h3>
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
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Work Breakdown Structure (WBS)</h3>
            <p className="text-sm text-gray-600 mt-1">
              Break down deliverables into tasks and subtasks with dependencies
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('tree')}
              className={`px-4 py-2 rounded-lg text-sm ${
                viewMode === 'tree'
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Tree View
            </button>
            <button
              onClick={() => setViewMode('gantt')}
              className={`px-4 py-2 rounded-lg text-sm ${
                viewMode === 'gantt'
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Gantt View
            </button>
            <button
              onClick={() => openAddTaskModal()}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
            >
              + Add Task
            </button>
          </div>
        </div>
      </div>

      {/* View Content */}
      <div className="p-6">
        {viewMode === 'tree' ? (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Tree Header */}
            <div className="bg-gray-100 border-b border-gray-300 flex items-center py-2 px-4 text-sm font-semibold">
              <div className="w-6"></div>
              <div className="w-8"></div>
              <div className="flex-1">Task Name</div>
              <div className="w-20 text-center">Phase</div>
              <div className="w-20 text-center">Duration</div>
              <div className="w-32 text-center mx-2">Progress</div>
              <div className="w-32">Assignee</div>
              <div className="w-20">Actions</div>
            </div>

            {/* Tree Content */}
            <div className="max-h-[600px] overflow-y-auto">
              {tasks.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  No tasks yet. Click "Add Task" to create your first task.
                </div>
              ) : (
                tasks.map(task => renderTreeTask(task, 0))
              )}
            </div>
          </div>
        ) : (
          renderGanttView()
        )}
      </div>

      {/* Add/Edit Task Modal */}
      {showAddTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingTask ? 'Edit Task' : parentTaskId ? 'Add Subtask' : 'Add Task'}
            </h3>
            <div className="space-y-4">
              {/* Task Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Name *
                </label>
                <input
                  type="text"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Enter task name"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                  placeholder="Enter task description"
                />
              </div>

              {/* Task Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Type
                </label>
                <select
                  value={taskType}
                  onChange={(e) => setTaskType(e.target.value as 'task' | 'milestone' | 'hold_point')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="task">Task</option>
                  <option value="milestone">Milestone</option>
                  <option value="hold_point">Hold Point (Client Review)</option>
                </select>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (days)
                </label>
                <input
                  type="number"
                  value={taskDuration}
                  onChange={(e) => setTaskDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  min="0"
                  disabled={taskType === 'milestone'}
                />
                {taskType === 'milestone' && (
                  <p className="text-xs text-gray-500 mt-1">Milestones have 0 duration</p>
                )}
              </div>

              {/* Assignee */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assignee
                </label>
                <input
                  type="text"
                  value={taskAssignee}
                  onChange={(e) => setTaskAssignee(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Enter assignee name"
                />
              </div>

              {/* Dependencies */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dependencies (Predecessors)
                </label>
                <select
                  multiple
                  value={taskDependencies}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    setTaskDependencies(selected);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  size={5}
                >
                  {getAllTasks()
                    .filter(t => !editingTask || t.id !== editingTask.id)
                    .map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Hold Ctrl/Cmd to select multiple tasks
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddTaskModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={addOrUpdateTask}
                disabled={!taskName}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {editingTask ? 'Update Task' : 'Add Task'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}