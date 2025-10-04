export interface PackageDeliverable {
  name: string;
  baseHours: number;
}

export interface DisciplinePackage {
  id: string;
  name: string;
  icon: string;
  description: string;
  totalHours: number;
  deliverables: PackageDeliverable[];
  applicableToEquipment?: string[]; // If undefined, applies to all equipment
}

export const DISCIPLINE_PACKAGES: DisciplinePackage[] = [
  {
    id: 'instrumentation',
    name: 'Instrumentation Package',
    icon: '📊',
    description: 'Complete I&E documentation',
    totalHours: 24,
    deliverables: [
      { name: 'Instrument Datasheets', baseHours: 8 },
      { name: 'Loop Diagrams', baseHours: 6 },
      { name: 'Hookup Drawings', baseHours: 6 },
      { name: 'Instrument Index', baseHours: 4 }
    ]
  },
  {
    id: 'electrical',
    name: 'Electrical Package',
    icon: '⚡',
    description: 'Electrical design & documentation',
    totalHours: 16,
    deliverables: [
      { name: 'Motor Datasheets', baseHours: 4 },
      { name: 'Single Line Diagram', baseHours: 4 },
      { name: 'Cable Schedule', baseHours: 4 },
      { name: 'Area Classification Drawings', baseHours: 4 }
    ],
    applicableToEquipment: ['pump', 'compressor', 'tower'] // Equipment with motors
  },
  {
    id: 'civil_structural',
    name: 'Civil/Structural Package',
    icon: '🏗️',
    description: 'Foundation & structural support',
    totalHours: 20,
    deliverables: [
      { name: 'Foundation Design Calculations', baseHours: 8 },
      { name: 'Foundation Plan & Details', baseHours: 6 },
      { name: 'Anchor Bolt Plan', baseHours: 3 },
      { name: 'Structural Support Design', baseHours: 3 }
    ]
  },
  {
    id: 'piping',
    name: 'Piping Package',
    icon: '🔧',
    description: 'Piping design & documentation',
    totalHours: 18,
    deliverables: [
      { name: 'Piping Isometric Drawings', baseHours: 8 },
      { name: 'Nozzle Load Analysis', baseHours: 4 },
      { name: 'Pipe Support Design', baseHours: 4 },
      { name: 'Material Take-Off', baseHours: 2 }
    ]
  },
  {
    id: 'layout',
    name: 'Layout/Plot Plan Package',
    icon: '🗺️',
    description: 'Equipment arrangement & spacing',
    totalHours: 12,
    deliverables: [
      { name: 'Equipment Layout Plan', baseHours: 5 },
      { name: 'Plot Plan Update', baseHours: 4 },
      { name: 'Clearance Study', baseHours: 3 }
    ]
  },
  {
    id: 'safety',
    name: 'Safety & Relief Package',
    icon: '⚠️',
    description: 'Safety systems & relief devices',
    totalHours: 14,
    deliverables: [
      { name: 'Relief Valve Sizing Calculations', baseHours: 6 },
      { name: 'Relief Valve Datasheet', baseHours: 4 },
      { name: 'Flare/Vent System Integration', baseHours: 4 }
    ],
    applicableToEquipment: ['vessel', 'tower', 'heat_exchanger'] // Pressure equipment
  },
  {
    id: 'controls',
    name: 'Controls & Automation Package',
    icon: '🎛️',
    description: 'Control systems & logic',
    totalHours: 20,
    deliverables: [
      { name: 'Control Philosophy', baseHours: 6 },
      { name: 'P&ID Updates', baseHours: 6 },
      { name: 'Control Logic Diagrams', baseHours: 5 },
      { name: 'HMI Screen Layouts', baseHours: 3 }
    ]
  },
  {
    id: 'insulation',
    name: 'Insulation Package',
    icon: '🧊',
    description: 'Thermal insulation design',
    totalHours: 8,
    deliverables: [
      { name: 'Insulation Calculations', baseHours: 3 },
      { name: 'Insulation Specification', baseHours: 3 },
      { name: 'Insulation Details', baseHours: 2 }
    ],
    applicableToEquipment: ['vessel', 'tower', 'heat_exchanger', 'tank', 'pump'] // Hot/cold equipment
  }
];

// Helper function to get applicable packages for equipment type
export function getApplicablePackages(equipmentType: string): DisciplinePackage[] {
  return DISCIPLINE_PACKAGES.filter(pkg =>
    !pkg.applicableToEquipment || pkg.applicableToEquipment.includes(equipmentType)
  );
}
