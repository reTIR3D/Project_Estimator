import React from 'react';

export type EstimationStep = 'setup' | 'team' | 'equipment' | 'deliverables' | 'wbs' | 'raci' | 'costs' | 'summary';

interface Step {
  id: EstimationStep;
  name: string;
  description: string;
}

const steps: Step[] = [
  { id: 'setup', name: 'Setup', description: 'Project configuration' },
  { id: 'team', name: 'Team', description: 'Build project team' },
  { id: 'equipment', name: 'Equipment', description: 'Equipment list (optional)' },
  { id: 'deliverables', name: 'Deliverables', description: 'Select deliverables' },
  { id: 'wbs', name: 'Work Breakdown', description: 'Structure & tasks' },
  { id: 'raci', name: 'RACI', description: 'Role assignments' },
  { id: 'costs', name: 'Cost Analysis', description: 'Breakdown & summary' },
  { id: 'summary', name: 'Summary', description: 'Final estimation' },
];

interface EstimationStepperProps {
  currentStep: EstimationStep;
  onStepChange: (step: EstimationStep) => void;
  completedSteps?: EstimationStep[];
}

export default function EstimationStepper({ currentStep, onStepChange, completedSteps = [] }: EstimationStepperProps) {
  const currentIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <div className="bg-white rounded-lg shadow p-5 mb-6">
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200">
          <div
            className="h-full bg-blue-500 transition-all duration-500"
            style={{ width: `${currentIndex >= 0 ? (currentIndex / (steps.length - 1)) * 100 : 0}%` }}
          />
        </div>

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.includes(step.id);
            const isCurrent = step.id === currentStep;
            const isPast = index < currentIndex;

            return (
              <button
                key={step.id}
                onClick={() => onStepChange(step.id)}
                className="flex flex-col items-center group relative z-10"
                style={{ flex: 1 }}
              >
                {/* Circle */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all border-4 bg-white ${
                    isCurrent
                      ? 'border-blue-500 text-blue-600 scale-110 shadow-lg'
                      : isPast || isCompleted
                      ? 'border-green-500 text-green-600'
                      : 'border-gray-300 text-gray-400 group-hover:border-gray-400'
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>

                {/* Label */}
                <div className="mt-3 text-center">
                  <div
                    className={`text-sm font-semibold ${
                      isCurrent ? 'text-blue-600' : isPast || isCompleted ? 'text-gray-900' : 'text-gray-500'
                    }`}
                  >
                    {step.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 hidden lg:block">{step.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
