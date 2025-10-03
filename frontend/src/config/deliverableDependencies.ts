/**
 * Standard deliverable dependency rules based on industry best practices.
 * These define typical prerequisite relationships in engineering projects.
 */

export interface DependencyRule {
  deliverableName: string;
  prerequisites: string[]; // Names of deliverables that must be completed first
  description?: string;
}

/**
 * General engineering deliverable dependencies (work across all equipment types)
 */
export const GENERAL_DEPENDENCIES: DependencyRule[] = [
  {
    deliverableName: 'Mechanical Datasheet',
    prerequisites: ['Process Datasheet'],
    description: 'Mechanical design requires process requirements first',
  },
  {
    deliverableName: 'Foundation Design',
    prerequisites: ['Mechanical Datasheet'],
    description: 'Foundation design requires equipment dimensions and loads',
  },
  {
    deliverableName: 'Instrumentation Hookup',
    prerequisites: ['Process Datasheet', 'Mechanical Datasheet'],
    description: 'Instrumentation requires both process and mechanical specs',
  },
  {
    deliverableName: 'Control System Integration',
    prerequisites: ['Process Datasheet', 'Mechanical Datasheet'],
    description: 'Control system design requires process and equipment info',
  },
  {
    deliverableName: 'Motor Specification',
    prerequisites: ['Mechanical Datasheet'],
    description: 'Motor sizing requires mechanical requirements',
  },
  {
    deliverableName: 'Relief Valve Sizing',
    prerequisites: ['Process Datasheet'],
    description: 'Relief sizing requires process conditions and scenarios',
  },
  {
    deliverableName: 'Relief System Design',
    prerequisites: ['Process Datasheet'],
    description: 'Relief system requires process safety analysis',
  },
];

/**
 * Equipment-specific dependency rules
 */
export const EQUIPMENT_SPECIFIC_DEPENDENCIES: Record<string, DependencyRule[]> = {
  vessel: [
    {
      deliverableName: 'Pressure Calculations',
      prerequisites: ['Mechanical Datasheet', 'Process Datasheet'],
      description: 'Pressure vessel calculations require both process and mechanical specs',
    },
    {
      deliverableName: 'Nozzle Orientation Drawing',
      prerequisites: ['Pressure Calculations', 'Instrumentation Hookup'],
      description: 'Nozzle layout requires vessel design and instrumentation locations',
    },
  ],
  pump: [
    {
      deliverableName: 'Pump Curve Analysis',
      prerequisites: ['Process Datasheet'],
      description: 'Pump curve selection requires process flow requirements',
    },
    {
      deliverableName: 'Motor Specification',
      prerequisites: ['Pump Curve Analysis'],
      description: 'Motor sizing requires pump power requirements',
    },
  ],
  heat_exchanger: [
    {
      deliverableName: 'Thermal Design Calculation',
      prerequisites: ['Process Datasheet'],
      description: 'Thermal design requires process heat duty and temperatures',
    },
    {
      deliverableName: 'Tube Layout Drawing',
      prerequisites: ['Thermal Design Calculation', 'Mechanical Datasheet'],
      description: 'Tube layout requires thermal design and mechanical constraints',
    },
  ],
  tank: [
    {
      deliverableName: 'Tank Sizing Calculation',
      prerequisites: ['Process Datasheet'],
      description: 'Tank sizing requires process volume and residence time requirements',
    },
    {
      deliverableName: 'Level Instrumentation',
      prerequisites: ['Tank Sizing Calculation'],
      description: 'Level instrumentation requires tank dimensions and operating levels',
    },
  ],
  compressor: [
    {
      deliverableName: 'Performance Calculations',
      prerequisites: ['Process Datasheet'],
      description: 'Compressor performance analysis requires process gas conditions',
    },
    {
      deliverableName: 'Vibration Analysis',
      prerequisites: ['Mechanical Datasheet', 'Performance Calculations'],
      description: 'Vibration analysis requires mechanical design and operating conditions',
    },
    {
      deliverableName: 'Noise Analysis',
      prerequisites: ['Performance Calculations'],
      description: 'Noise analysis requires operating conditions and flow rates',
    },
    {
      deliverableName: 'Motor & Control System',
      prerequisites: ['Performance Calculations'],
      description: 'Motor and controls require compressor power and control requirements',
    },
  ],
};

/**
 * Cross-deliverable dependencies (between different equipment/categories)
 */
export const CROSS_DELIVERABLE_DEPENDENCIES: DependencyRule[] = [
  {
    deliverableName: '3D Model',
    prerequisites: ['P&ID', 'Equipment Layout', 'Nozzle Orientation Drawing'],
    description: '3D modeling requires P&IDs, layout, and equipment nozzle information',
  },
  {
    deliverableName: 'Piping Isometric',
    prerequisites: ['P&ID', '3D Model'],
    description: 'Piping isometrics require P&IDs and 3D model',
  },
  {
    deliverableName: 'Electrical Single Line',
    prerequisites: ['Motor Specification', 'Control System Integration'],
    description: 'Electrical design requires motor and control system specs',
  },
  {
    deliverableName: 'Structural Design',
    prerequisites: ['Equipment Layout', 'Foundation Design'],
    description: 'Structural design requires equipment locations and foundation loads',
  },
];

/**
 * Apply dependency rules to a deliverable based on its name and equipment type
 */
export function getRecommendedDependencies(
  deliverableName: string,
  equipmentType?: string
): string[] {
  const prerequisites: string[] = [];

  // Check general dependencies
  const generalRule = GENERAL_DEPENDENCIES.find(
    (rule) => rule.deliverableName === deliverableName
  );
  if (generalRule) {
    prerequisites.push(...generalRule.prerequisites);
  }

  // Check equipment-specific dependencies
  if (equipmentType && EQUIPMENT_SPECIFIC_DEPENDENCIES[equipmentType]) {
    const equipRule = EQUIPMENT_SPECIFIC_DEPENDENCIES[equipmentType].find(
      (rule) => rule.deliverableName === deliverableName
    );
    if (equipRule) {
      prerequisites.push(...equipRule.prerequisites);
    }
  }

  // Check cross-deliverable dependencies
  const crossRule = CROSS_DELIVERABLE_DEPENDENCIES.find(
    (rule) => rule.deliverableName === deliverableName
  );
  if (crossRule) {
    prerequisites.push(...crossRule.prerequisites);
  }

  // Remove duplicates
  return [...new Set(prerequisites)];
}

/**
 * Get all dependency rules with descriptions for a given deliverable
 */
export function getDependencyRules(
  deliverableName: string,
  equipmentType?: string
): DependencyRule[] {
  const rules: DependencyRule[] = [];

  // General rules
  const generalRule = GENERAL_DEPENDENCIES.find(
    (rule) => rule.deliverableName === deliverableName
  );
  if (generalRule) {
    rules.push(generalRule);
  }

  // Equipment-specific rules
  if (equipmentType && EQUIPMENT_SPECIFIC_DEPENDENCIES[equipmentType]) {
    const equipRule = EQUIPMENT_SPECIFIC_DEPENDENCIES[equipmentType].find(
      (rule) => rule.deliverableName === deliverableName
    );
    if (equipRule) {
      rules.push(equipRule);
    }
  }

  // Cross-deliverable rules
  const crossRule = CROSS_DELIVERABLE_DEPENDENCIES.find(
    (rule) => rule.deliverableName === deliverableName
  );
  if (crossRule) {
    rules.push(crossRule);
  }

  return rules;
}
