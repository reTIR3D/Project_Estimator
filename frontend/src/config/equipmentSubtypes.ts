import { EquipmentTemplateKey } from '../types';

export type EquipmentScope = 'basic' | 'typical' | 'complex';

export interface DeliverableDefinition {
  name: string;
  discipline: string;
  hours: number;
  typicalSheets?: number; // Typical number of sheets for this deliverable
  hoursPerSheet?: number; // Hours per sheet estimate
}

export interface EquipmentSubtype {
  id: string;
  name: string;
  category: EquipmentTemplateKey;
  description: string;
  recommendedScope: EquipmentScope;
  scopeGuidance: {
    basic: string;
    typical: string;
    complex: string;
  };
  deliverables: {
    basic: DeliverableDefinition[];
    typical: DeliverableDefinition[];
    complex: DeliverableDefinition[];
  };
}

export const EQUIPMENT_SUBTYPES: Record<string, EquipmentSubtype[]> = {
  vessel: [
    {
      id: 'separator_2phase',
      name: '2-Phase Separator',
      category: 'vessel',
      description: 'Gas-liquid separation',
      recommendedScope: 'typical',
      scopeGuidance: {
        basic: 'Small vessel (<4ft dia), no internals, standard service',
        typical: 'Medium vessel (4-8ft dia), basic internals (mist eliminator)',
        complex: 'Large vessel (>8ft dia), advanced internals, special materials or high pressure'
      },
      deliverables: {
        basic: [
          { name: 'Process Datasheet', discipline: 'Process', hours: 12 },
          { name: 'Mechanical Datasheet', discipline: 'Mechanical', hours: 8 },
          { name: 'Nozzle Orientation Drawing', discipline: 'Mechanical', hours: 12 }
        ],
        typical: [
          { name: 'Process Datasheet', discipline: 'Process', hours: 16, typicalSheets: 2, hoursPerSheet: 8 },
          { name: 'Mechanical Datasheet', discipline: 'Mechanical', hours: 12, typicalSheets: 2, hoursPerSheet: 6 },
          { name: 'Pressure Calculations', discipline: 'Mechanical', hours: 16, typicalSheets: 4, hoursPerSheet: 4 },
          { name: 'Nozzle Orientation Drawing', discipline: 'Mechanical', hours: 16, typicalSheets: 2, hoursPerSheet: 8 },
          { name: 'Foundation Design', discipline: 'Civil', hours: 20, typicalSheets: 3, hoursPerSheet: 6.7 },
          { name: 'Instrumentation Hookup', discipline: 'Electrical/Instrumentation', hours: 8, typicalSheets: 1, hoursPerSheet: 8 },
          { name: 'Relief Valve Sizing', discipline: 'Safety', hours: 8, typicalSheets: 2, hoursPerSheet: 4 }
        ],
        complex: [
          { name: 'Process Datasheet', discipline: 'Process', hours: 20 },
          { name: 'Mechanical Datasheet', discipline: 'Mechanical', hours: 16 },
          { name: 'Pressure Calculations', discipline: 'Mechanical', hours: 24 },
          { name: 'Internals Design Calculations', discipline: 'Process', hours: 16 },
          { name: 'Nozzle Orientation Drawing', discipline: 'Mechanical', hours: 20 },
          { name: 'Foundation Design', discipline: 'Civil', hours: 28 },
          { name: 'Instrumentation Hookup', discipline: 'Electrical/Instrumentation', hours: 12 },
          { name: 'Relief Valve Sizing', discipline: 'Safety', hours: 12 },
          { name: 'Vibration Analysis', discipline: 'Mechanical', hours: 12 }
        ]
      }
    },
    {
      id: 'separator_3phase',
      name: '3-Phase Separator',
      category: 'vessel',
      description: 'Gas-oil-water separation',
      recommendedScope: 'complex',
      scopeGuidance: {
        basic: 'Small 3-phase (<6ft dia), basic internals',
        typical: 'Medium 3-phase (6-10ft dia), standard internals and controls',
        complex: 'Large 3-phase (>10ft dia), advanced internals, coalescers, level controls'
      },
      deliverables: {
        basic: [
          { name: 'Process Datasheet', discipline: 'Process', hours: 16 },
          { name: 'Mechanical Datasheet', discipline: 'Mechanical', hours: 12 },
          { name: 'Nozzle Orientation Drawing', discipline: 'Mechanical', hours: 14 }
        ],
        typical: [
          { name: 'Process Datasheet', discipline: 'Process', hours: 20 },
          { name: 'Mechanical Datasheet', discipline: 'Mechanical', hours: 14 },
          { name: 'Pressure Calculations', discipline: 'Mechanical', hours: 20 },
          { name: 'Internals Design', discipline: 'Process', hours: 16 },
          { name: 'Nozzle Orientation Drawing', discipline: 'Mechanical', hours: 18 },
          { name: 'Foundation Design', discipline: 'Civil', hours: 24 },
          { name: 'Instrumentation Hookup', discipline: 'Electrical/Instrumentation', hours: 12 },
          { name: 'Relief Valve Sizing', discipline: 'Safety', hours: 10 }
        ],
        complex: [
          { name: 'Process Datasheet', discipline: 'Process', hours: 28 },
          { name: 'Mechanical Datasheet', discipline: 'Mechanical', hours: 20 },
          { name: 'Pressure Calculations', discipline: 'Mechanical', hours: 28 },
          { name: 'Advanced Internals Design', discipline: 'Process', hours: 24 },
          { name: 'Coalescer Selection', discipline: 'Process', hours: 12 },
          { name: 'Nozzle Orientation Drawing', discipline: 'Mechanical', hours: 24 },
          { name: 'Foundation Design', discipline: 'Civil', hours: 32 },
          { name: 'Advanced Instrumentation & Controls', discipline: 'Electrical/Instrumentation', hours: 20 },
          { name: 'Relief Valve Sizing', discipline: 'Safety', hours: 12 },
          { name: 'Vibration Analysis', discipline: 'Mechanical', hours: 12 }
        ]
      }
    },
    {
      id: 'knockout_drum',
      name: 'Knock-Out Drum',
      category: 'vessel',
      description: 'Simple liquid removal',
      recommendedScope: 'basic',
      scopeGuidance: {
        basic: 'Small drum (<3ft dia), minimal internals',
        typical: 'Medium drum (3-5ft dia), basic internals',
        complex: 'Large drum (>5ft dia) or special service'
      },
      deliverables: {
        basic: [
          { name: 'Process Datasheet', discipline: 'Process', hours: 8 },
          { name: 'Mechanical Datasheet', discipline: 'Mechanical', hours: 6 },
          { name: 'Nozzle Orientation Drawing', discipline: 'Mechanical', hours: 8 }
        ],
        typical: [
          { name: 'Process Datasheet', discipline: 'Process', hours: 12 },
          { name: 'Mechanical Datasheet', discipline: 'Mechanical', hours: 10 },
          { name: 'Pressure Calculations', discipline: 'Mechanical', hours: 12 },
          { name: 'Nozzle Orientation Drawing', discipline: 'Mechanical', hours: 12 },
          { name: 'Foundation Design', discipline: 'Civil', hours: 16 },
          { name: 'Instrumentation Hookup', discipline: 'Electrical/Instrumentation', hours: 6 }
        ],
        complex: [
          { name: 'Process Datasheet', discipline: 'Process', hours: 16 },
          { name: 'Mechanical Datasheet', discipline: 'Mechanical', hours: 12 },
          { name: 'Pressure Calculations', discipline: 'Mechanical', hours: 16 },
          { name: 'Nozzle Orientation Drawing', discipline: 'Mechanical', hours: 16 },
          { name: 'Foundation Design', discipline: 'Civil', hours: 20 },
          { name: 'Instrumentation Hookup', discipline: 'Electrical/Instrumentation', hours: 8 },
          { name: 'Relief Valve Sizing', discipline: 'Safety', hours: 8 }
        ]
      }
    },
    {
      id: 'flash_drum',
      name: 'Flash Drum',
      category: 'vessel',
      description: 'Pressure reduction/flashing',
      recommendedScope: 'typical',
      scopeGuidance: {
        basic: 'Small flash drum (<4ft dia), basic inlet device',
        typical: 'Medium flash drum (4-7ft dia), inlet device and mist eliminator',
        complex: 'Large flash drum (>7ft dia), advanced internals or multi-stage'
      },
      deliverables: {
        basic: [
          { name: 'Process Datasheet', discipline: 'Process', hours: 10 },
          { name: 'Mechanical Datasheet', discipline: 'Mechanical', hours: 8 },
          { name: 'Nozzle Orientation Drawing', discipline: 'Mechanical', hours: 10 }
        ],
        typical: [
          { name: 'Process Datasheet', discipline: 'Process', hours: 14 },
          { name: 'Mechanical Datasheet', discipline: 'Mechanical', hours: 12 },
          { name: 'Pressure Calculations', discipline: 'Mechanical', hours: 16 },
          { name: 'Flash Calculations', discipline: 'Process', hours: 12 },
          { name: 'Nozzle Orientation Drawing', discipline: 'Mechanical', hours: 14 },
          { name: 'Foundation Design', discipline: 'Civil', hours: 20 },
          { name: 'Instrumentation Hookup', discipline: 'Electrical/Instrumentation', hours: 8 }
        ],
        complex: [
          { name: 'Process Datasheet', discipline: 'Process', hours: 20 },
          { name: 'Mechanical Datasheet', discipline: 'Mechanical', hours: 16 },
          { name: 'Pressure Calculations', discipline: 'Mechanical', hours: 24 },
          { name: 'Advanced Flash Calculations', discipline: 'Process', hours: 20 },
          { name: 'Internals Design', discipline: 'Process', hours: 16 },
          { name: 'Nozzle Orientation Drawing', discipline: 'Mechanical', hours: 18 },
          { name: 'Foundation Design', discipline: 'Civil', hours: 28 },
          { name: 'Instrumentation Hookup', discipline: 'Electrical/Instrumentation', hours: 12 },
          { name: 'Relief Valve Sizing', discipline: 'Safety', hours: 10 }
        ]
      }
    },
    {
      id: 'accumulator',
      name: 'Accumulator',
      category: 'vessel',
      description: 'Liquid storage/surge',
      recommendedScope: 'basic',
      scopeGuidance: {
        basic: 'Small accumulator (<4ft dia), minimal internals',
        typical: 'Medium accumulator (4-8ft dia), level control',
        complex: 'Large accumulator (>8ft dia) or special requirements'
      },
      deliverables: {
        basic: [
          { name: 'Process Datasheet', discipline: 'Process', hours: 8 },
          { name: 'Mechanical Datasheet', discipline: 'Mechanical', hours: 6 },
          { name: 'Nozzle Orientation Drawing', discipline: 'Mechanical', hours: 8 }
        ],
        typical: [
          { name: 'Process Datasheet', discipline: 'Process', hours: 12 },
          { name: 'Mechanical Datasheet', discipline: 'Mechanical', hours: 10 },
          { name: 'Pressure Calculations', discipline: 'Mechanical', hours: 12 },
          { name: 'Surge Sizing Calculation', discipline: 'Process', hours: 10 },
          { name: 'Nozzle Orientation Drawing', discipline: 'Mechanical', hours: 12 },
          { name: 'Foundation Design', discipline: 'Civil', hours: 18 },
          { name: 'Level Control System', discipline: 'Electrical/Instrumentation', hours: 10 }
        ],
        complex: [
          { name: 'Process Datasheet', discipline: 'Process', hours: 16 },
          { name: 'Mechanical Datasheet', discipline: 'Mechanical', hours: 12 },
          { name: 'Pressure Calculations', discipline: 'Mechanical', hours: 16 },
          { name: 'Advanced Surge Analysis', discipline: 'Process', hours: 16 },
          { name: 'Nozzle Orientation Drawing', discipline: 'Mechanical', hours: 16 },
          { name: 'Foundation Design', discipline: 'Civil', hours: 24 },
          { name: 'Advanced Level Control System', discipline: 'Electrical/Instrumentation', hours: 14 },
          { name: 'Relief Valve Sizing', discipline: 'Safety', hours: 8 }
        ]
      }
    }
  ],

  tower: [
    {
      id: 'distillation_tower',
      name: 'Distillation Tower (Trayed)',
      category: 'tower',
      description: 'Separation by boiling point',
      recommendedScope: 'complex',
      scopeGuidance: {
        basic: 'Simple tower (<3ft dia, <10 trays)',
        typical: 'Standard tower (3-8ft dia, 10-20 trays)',
        complex: 'Large tower (>8ft dia, >20 trays) or high efficiency/special service'
      },
      deliverables: {
        basic: [
          { name: 'Process Datasheet', discipline: 'Process', hours: 16 },
          { name: 'Basic Tray Design', discipline: 'Process', hours: 20 },
          { name: 'Mechanical Datasheet', discipline: 'Mechanical', hours: 12 }
        ],
        typical: [
          { name: 'Process Datasheet', discipline: 'Process', hours: 20 },
          { name: 'Tray Design', discipline: 'Process', hours: 32 },
          { name: 'Hydraulic Calculations', discipline: 'Process', hours: 24 },
          { name: 'Mechanical Datasheet', discipline: 'Mechanical', hours: 16 },
          { name: 'Vessel Design Calculations', discipline: 'Mechanical', hours: 28 },
          { name: 'Nozzle Orientation', discipline: 'Mechanical', hours: 12 },
          { name: 'Foundation Design', discipline: 'Civil', hours: 32 },
          { name: 'Instrumentation Hookup', discipline: 'Electrical/Instrumentation', hours: 10 }
        ],
        complex: [
          { name: 'Process Datasheet', discipline: 'Process', hours: 28 },
          { name: 'Advanced Tray Design', discipline: 'Process', hours: 48 },
          { name: 'Detailed Hydraulic Calculations', discipline: 'Process', hours: 32 },
          { name: 'Tray Rating Study', discipline: 'Process', hours: 20 },
          { name: 'Mechanical Datasheet', discipline: 'Mechanical', hours: 24 },
          { name: 'Advanced Vessel Design Calculations', discipline: 'Mechanical', hours: 40 },
          { name: 'Nozzle Orientation', discipline: 'Mechanical', hours: 16 },
          { name: 'Foundation Design', discipline: 'Civil', hours: 48 },
          { name: 'Advanced Instrumentation & Controls', discipline: 'Electrical/Instrumentation', hours: 16 },
          { name: 'Vibration Analysis', discipline: 'Mechanical', hours: 16 }
        ]
      }
    },
    {
      id: 'packed_tower',
      name: 'Packed Tower',
      category: 'tower',
      description: 'Packed bed separation',
      recommendedScope: 'typical',
      scopeGuidance: {
        basic: 'Small tower (<2ft dia), single packed bed',
        typical: 'Medium tower (2-6ft dia), multiple beds',
        complex: 'Large tower (>6ft dia), structured packing or special internals'
      },
      deliverables: {
        basic: [
          { name: 'Process Datasheet', discipline: 'Process', hours: 12 },
          { name: 'Packing Selection', discipline: 'Process', hours: 12 },
          { name: 'Mechanical Datasheet', discipline: 'Mechanical', hours: 10 }
        ],
        typical: [
          { name: 'Process Datasheet', discipline: 'Process', hours: 18 },
          { name: 'Packing Design', discipline: 'Process', hours: 24 },
          { name: 'Hydraulic Calculations', discipline: 'Process', hours: 20 },
          { name: 'Mechanical Datasheet', discipline: 'Mechanical', hours: 14 },
          { name: 'Vessel Design Calculations', discipline: 'Mechanical', hours: 24 },
          { name: 'Foundation Design', discipline: 'Civil', hours: 28 },
          { name: 'Instrumentation Hookup', discipline: 'Electrical/Instrumentation', hours: 8 }
        ],
        complex: [
          { name: 'Process Datasheet', discipline: 'Process', hours: 24 },
          { name: 'Structured Packing Design', discipline: 'Process', hours: 36 },
          { name: 'Advanced Hydraulic Calculations', discipline: 'Process', hours: 28 },
          { name: 'Internals Design', discipline: 'Process', hours: 20 },
          { name: 'Mechanical Datasheet', discipline: 'Mechanical', hours: 20 },
          { name: 'Advanced Vessel Design Calculations', discipline: 'Mechanical', hours: 32 },
          { name: 'Foundation Design', discipline: 'Civil', hours: 40 },
          { name: 'Advanced Instrumentation & Controls', discipline: 'Electrical/Instrumentation', hours: 12 }
        ]
      }
    },
    {
      id: 'absorber',
      name: 'Absorber',
      category: 'tower',
      description: 'Gas absorption',
      recommendedScope: 'typical',
      scopeGuidance: {
        basic: 'Small absorber (<3ft dia), basic internals',
        typical: 'Medium absorber (3-7ft dia), multiple stages',
        complex: 'Large absorber (>7ft dia), advanced internals or high efficiency'
      },
      deliverables: {
        basic: [
          { name: 'Process Datasheet', discipline: 'Process', hours: 12 },
          { name: 'Basic Absorption Design', discipline: 'Process', hours: 16 },
          { name: 'Mechanical Datasheet', discipline: 'Mechanical', hours: 10 }
        ],
        typical: [
          { name: 'Process Datasheet', discipline: 'Process', hours: 18 },
          { name: 'Absorption Design', discipline: 'Process', hours: 28 },
          { name: 'Mass Transfer Calculations', discipline: 'Process', hours: 20 },
          { name: 'Mechanical Datasheet', discipline: 'Mechanical', hours: 14 },
          { name: 'Vessel Design Calculations', discipline: 'Mechanical', hours: 24 },
          { name: 'Foundation Design', discipline: 'Civil', hours: 28 },
          { name: 'Instrumentation Hookup', discipline: 'Electrical/Instrumentation', hours: 10 }
        ],
        complex: [
          { name: 'Process Datasheet', discipline: 'Process', hours: 24 },
          { name: 'Advanced Absorption Design', discipline: 'Process', hours: 40 },
          { name: 'Detailed Mass Transfer Calculations', discipline: 'Process', hours: 28 },
          { name: 'Internals Design', discipline: 'Process', hours: 20 },
          { name: 'Mechanical Datasheet', discipline: 'Mechanical', hours: 20 },
          { name: 'Advanced Vessel Design Calculations', discipline: 'Mechanical', hours: 32 },
          { name: 'Foundation Design', discipline: 'Civil', hours: 40 },
          { name: 'Advanced Instrumentation & Controls', discipline: 'Electrical/Instrumentation', hours: 14 }
        ]
      }
    },
    {
      id: 'stripper',
      name: 'Stripper',
      category: 'tower',
      description: 'Component stripping',
      recommendedScope: 'typical',
      scopeGuidance: {
        basic: 'Small stripper (<2ft dia), basic configuration',
        typical: 'Medium stripper (2-5ft dia), multiple stages',
        complex: 'Large stripper (>5ft dia), reboiler integration or complex service'
      },
      deliverables: {
        basic: [
          { name: 'Process Datasheet', discipline: 'Process', hours: 12 },
          { name: 'Basic Stripping Design', discipline: 'Process', hours: 16 },
          { name: 'Mechanical Datasheet', discipline: 'Mechanical', hours: 10 }
        ],
        typical: [
          { name: 'Process Datasheet', discipline: 'Process', hours: 18 },
          { name: 'Stripping Design', discipline: 'Process', hours: 28 },
          { name: 'Mass Transfer Calculations', discipline: 'Process', hours: 20 },
          { name: 'Mechanical Datasheet', discipline: 'Mechanical', hours: 14 },
          { name: 'Vessel Design Calculations', discipline: 'Mechanical', hours: 24 },
          { name: 'Foundation Design', discipline: 'Civil', hours: 28 },
          { name: 'Instrumentation Hookup', discipline: 'Electrical/Instrumentation', hours: 8 }
        ],
        complex: [
          { name: 'Process Datasheet', discipline: 'Process', hours: 24 },
          { name: 'Advanced Stripping Design', discipline: 'Process', hours: 40 },
          { name: 'Detailed Mass Transfer Calculations', discipline: 'Process', hours: 28 },
          { name: 'Reboiler Integration Design', discipline: 'Process', hours: 20 },
          { name: 'Mechanical Datasheet', discipline: 'Mechanical', hours: 20 },
          { name: 'Advanced Vessel Design Calculations', discipline: 'Mechanical', hours: 32 },
          { name: 'Foundation Design', discipline: 'Civil', hours: 40 },
          { name: 'Advanced Instrumentation & Controls', discipline: 'Electrical/Instrumentation', hours: 12 }
        ]
      }
    }
  ],

  pump: [
    {
      id: 'centrifugal_oh2',
      name: 'Centrifugal (OH2)',
      category: 'pump',
      description: 'Overhung, 2-bearing',
      recommendedScope: 'typical',
      scopeGuidance: {
        basic: 'Small pump (<50 HP), clean service',
        typical: 'Medium pump (50-200 HP), normal service',
        complex: 'Large pump (>200 HP), high temp/pressure or API 610'
      },
      deliverables: {
        basic: [
          { name: 'Process Datasheet', discipline: 'Process', hours: 8 },
          { name: 'Mechanical Datasheet', discipline: 'Mechanical', hours: 6 },
          { name: 'Motor Specification', discipline: 'Electrical/Instrumentation', hours: 4 }
        ],
        typical: [
          { name: 'Process Datasheet', discipline: 'Process', hours: 12 },
          { name: 'Mechanical Datasheet', discipline: 'Mechanical', hours: 10 },
          { name: 'Pump Curve Analysis', discipline: 'Mechanical', hours: 8 },
          { name: 'Foundation Design', discipline: 'Civil', hours: 16 },
          { name: 'Motor Specification', discipline: 'Electrical/Instrumentation', hours: 6 },
          { name: 'Control System Integration', discipline: 'Electrical/Instrumentation', hours: 8 }
        ],
        complex: [
          { name: 'Process Datasheet', discipline: 'Process', hours: 16 },
          { name: 'API 610 Mechanical Datasheet', discipline: 'Mechanical', hours: 16 },
          { name: 'Advanced Pump Curve Analysis', discipline: 'Mechanical', hours: 12 },
          { name: 'NPSH Calculations', discipline: 'Process', hours: 8 },
          { name: 'Foundation Design', discipline: 'Civil', hours: 24 },
          { name: 'Motor Specification', discipline: 'Electrical/Instrumentation', hours: 8 },
          { name: 'Advanced Control System', discipline: 'Electrical/Instrumentation', hours: 12 },
          { name: 'Vibration Analysis', discipline: 'Mechanical', hours: 10 }
        ]
      }
    },
    {
      id: 'centrifugal_bb2',
      name: 'Centrifugal (BB2)',
      category: 'pump',
      description: 'Between-bearing, 2-stage',
      recommendedScope: 'complex',
      scopeGuidance: {
        basic: 'Standard 2-stage (100-300 HP)',
        typical: 'Large 2-stage (300-500 HP)',
        complex: 'Multi-stage (>500 HP) or API 610'
      },
      deliverables: {
        basic: [
          { name: 'Process Datasheet', discipline: 'Process', hours: 12 },
          { name: 'Mechanical Datasheet', discipline: 'Mechanical', hours: 10 },
          { name: 'Pump Curve Analysis', discipline: 'Mechanical', hours: 10 }
        ],
        typical: [
          { name: 'Process Datasheet', discipline: 'Process', hours: 16 },
          { name: 'Mechanical Datasheet', discipline: 'Mechanical', hours: 14 },
          { name: 'Pump Curve Analysis', discipline: 'Mechanical', hours: 12 },
          { name: 'NPSH Calculations', discipline: 'Process', hours: 8 },
          { name: 'Foundation Design', discipline: 'Civil', hours: 20 },
          { name: 'Motor Specification', discipline: 'Electrical/Instrumentation', hours: 8 },
          { name: 'Control System Integration', discipline: 'Electrical/Instrumentation', hours: 10 }
        ],
        complex: [
          { name: 'Process Datasheet', discipline: 'Process', hours: 20 },
          { name: 'API 610 Mechanical Datasheet', discipline: 'Mechanical', hours: 20 },
          { name: 'Multi-stage Pump Analysis', discipline: 'Mechanical', hours: 18 },
          { name: 'Advanced NPSH Calculations', discipline: 'Process', hours: 12 },
          { name: 'Foundation Design', discipline: 'Civil', hours: 28 },
          { name: 'Motor Specification', discipline: 'Electrical/Instrumentation', hours: 10 },
          { name: 'Advanced Control System', discipline: 'Electrical/Instrumentation', hours: 14 },
          { name: 'Vibration & Rotordynamics', discipline: 'Mechanical', hours: 16 }
        ]
      }
    },
  ],

  pd_pump: [
    {
      id: 'reciprocating',
      name: 'Reciprocating',
      category: 'pd_pump',
      description: 'Piston/plunger pump',
      recommendedScope: 'typical',
      scopeGuidance: {
        basic: 'Small reciprocating pump (<25 HP), standard service',
        typical: 'Medium reciprocating pump (25-100 HP), normal service',
        complex: 'Large reciprocating pump (>100 HP), high pressure or pulsation concerns'
      },
      deliverables: {
        basic: [
          { name: 'Process Datasheet', discipline: 'Process', hours: 10 },
          { name: 'Mechanical Datasheet', discipline: 'Mechanical', hours: 8 },
          { name: 'Motor Specification', discipline: 'Electrical/Instrumentation', hours: 4 }
        ],
        typical: [
          { name: 'Process Datasheet', discipline: 'Process', hours: 14 },
          { name: 'Mechanical Datasheet', discipline: 'Mechanical', hours: 12 },
          { name: 'Performance Calculations', discipline: 'Mechanical', hours: 10 },
          { name: 'Foundation Design', discipline: 'Civil', hours: 18 },
          { name: 'Motor Specification', discipline: 'Electrical/Instrumentation', hours: 6 },
          { name: 'Control System Integration', discipline: 'Electrical/Instrumentation', hours: 10 },
          { name: 'Relief Valve Sizing', discipline: 'Safety', hours: 6 }
        ],
        complex: [
          { name: 'Process Datasheet', discipline: 'Process', hours: 18 },
          { name: 'Advanced Mechanical Datasheet', discipline: 'Mechanical', hours: 16 },
          { name: 'Advanced Performance Calculations', discipline: 'Mechanical', hours: 14 },
          { name: 'Pulsation Study', discipline: 'Mechanical', hours: 20 },
          { name: 'Foundation Design', discipline: 'Civil', hours: 24 },
          { name: 'Motor Specification', discipline: 'Electrical/Instrumentation', hours: 8 },
          { name: 'Advanced Control System', discipline: 'Electrical/Instrumentation', hours: 14 },
          { name: 'Relief Valve Sizing', discipline: 'Safety', hours: 8 }
        ]
      }
    },
    {
      id: 'rotary',
      name: 'Rotary',
      category: 'pd_pump',
      description: 'Gear/screw/lobe pump',
      recommendedScope: 'typical',
      scopeGuidance: {
        basic: 'Small rotary pump (<25 HP), clean service',
        typical: 'Medium rotary pump (25-100 HP), viscous service',
        complex: 'Large rotary pump (>100 HP), high viscosity or special service'
      },
      deliverables: {
        basic: [
          { name: 'Process Datasheet', discipline: 'Process', hours: 8 },
          { name: 'Mechanical Datasheet', discipline: 'Mechanical', hours: 6 },
          { name: 'Motor Specification', discipline: 'Electrical/Instrumentation', hours: 4 }
        ],
        typical: [
          { name: 'Process Datasheet', discipline: 'Process', hours: 12 },
          { name: 'Mechanical Datasheet', discipline: 'Mechanical', hours: 10 },
          { name: 'Performance Calculations', discipline: 'Mechanical', hours: 8 },
          { name: 'Foundation Design', discipline: 'Civil', hours: 16 },
          { name: 'Motor Specification', discipline: 'Electrical/Instrumentation', hours: 6 },
          { name: 'Control System Integration', discipline: 'Electrical/Instrumentation', hours: 8 },
          { name: 'Relief Valve Sizing', discipline: 'Safety', hours: 4 }
        ],
        complex: [
          { name: 'Process Datasheet', discipline: 'Process', hours: 16 },
          { name: 'Advanced Mechanical Datasheet', discipline: 'Mechanical', hours: 14 },
          { name: 'Advanced Performance Calculations', discipline: 'Mechanical', hours: 12 },
          { name: 'Vibration Analysis', discipline: 'Mechanical', hours: 10 },
          { name: 'Foundation Design', discipline: 'Civil', hours: 22 },
          { name: 'Motor Specification', discipline: 'Electrical/Instrumentation', hours: 8 },
          { name: 'Advanced Control System', discipline: 'Electrical/Instrumentation', hours: 12 },
          { name: 'Relief Valve Sizing', discipline: 'Safety', hours: 6 }
        ]
      }
    }
  ],

  heat_exchanger: [
    {
      id: 'shell_tube',
      name: 'Shell & Tube',
      category: 'heat_exchanger',
      description: 'Standard heat exchanger',
      recommendedScope: 'typical',
      scopeGuidance: {
        basic: 'Small exchanger (<500 sqft), single pass',
        typical: 'Medium exchanger (500-2000 sqft), multi-pass',
        complex: 'Large exchanger (>2000 sqft), high pressure/TEMA or special service'
      },
      deliverables: {
        basic: [
          { name: 'Process Datasheet', discipline: 'Process', hours: 10 },
          { name: 'Basic Thermal Design', discipline: 'Process', hours: 12 },
          { name: 'Mechanical Datasheet', discipline: 'Mechanical', hours: 8 }
        ],
        typical: [
          { name: 'Process Datasheet', discipline: 'Process', hours: 14 },
          { name: 'Thermal Design Calculation', discipline: 'Process', hours: 20 },
          { name: 'Mechanical Datasheet', discipline: 'Mechanical', hours: 10 },
          { name: 'Tube Layout Drawing', discipline: 'Mechanical', hours: 12 },
          { name: 'Foundation Design', discipline: 'Civil', hours: 18 },
          { name: 'Instrumentation Hookup', discipline: 'Electrical/Instrumentation', hours: 6 }
        ],
        complex: [
          { name: 'Process Datasheet', discipline: 'Process', hours: 20 },
          { name: 'Advanced Thermal Design & Rating', discipline: 'Process', hours: 28 },
          { name: 'TEMA Mechanical Datasheet', discipline: 'Mechanical', hours: 16 },
          { name: 'Detailed Tube Layout Drawing', discipline: 'Mechanical', hours: 16 },
          { name: 'Stress Analysis', discipline: 'Mechanical', hours: 12 },
          { name: 'Foundation Design', discipline: 'Civil', hours: 24 },
          { name: 'Instrumentation Hookup', discipline: 'Electrical/Instrumentation', hours: 8 },
          { name: 'Vibration Analysis', discipline: 'Mechanical', hours: 10 }
        ]
      }
    },
    {
      id: 'air_cooler',
      name: 'Air Cooler',
      category: 'heat_exchanger',
      description: 'Air-cooled heat exchanger',
      recommendedScope: 'typical',
      scopeGuidance: {
        basic: 'Small air cooler (1 bay), forced draft',
        typical: 'Medium air cooler (2-3 bays), induced draft',
        complex: 'Large air cooler (>3 bays), variable speed or special service'
      },
      deliverables: {
        basic: [
          { name: 'Process Datasheet', discipline: 'Process', hours: 10 },
          { name: 'Basic Thermal Design', discipline: 'Process', hours: 14 },
          { name: 'Mechanical Datasheet', discipline: 'Mechanical', hours: 8 }
        ],
        typical: [
          { name: 'Process Datasheet', discipline: 'Process', hours: 14 },
          { name: 'Thermal Design Calculation', discipline: 'Process', hours: 20 },
          { name: 'Mechanical Datasheet', discipline: 'Mechanical', hours: 12 },
          { name: 'Fan & Motor Selection', discipline: 'Electrical/Instrumentation', hours: 8 },
          { name: 'Foundation Design', discipline: 'Civil', hours: 20 },
          { name: 'Instrumentation Hookup', discipline: 'Electrical/Instrumentation', hours: 6 }
        ],
        complex: [
          { name: 'Process Datasheet', discipline: 'Process', hours: 20 },
          { name: 'Advanced Thermal Design & Rating', discipline: 'Process', hours: 28 },
          { name: 'Mechanical Datasheet', discipline: 'Mechanical', hours: 16 },
          { name: 'Advanced Fan & VFD Selection', discipline: 'Electrical/Instrumentation', hours: 12 },
          { name: 'Foundation Design', discipline: 'Civil', hours: 28 },
          { name: 'Advanced Instrumentation & Controls', discipline: 'Electrical/Instrumentation', hours: 10 },
          { name: 'Noise Analysis', discipline: 'Safety', hours: 8 }
        ]
      }
    },
    {
      id: 'plate_frame',
      name: 'Plate & Frame',
      category: 'heat_exchanger',
      description: 'Plate heat exchanger',
      recommendedScope: 'basic',
      scopeGuidance: {
        basic: 'Small plate exchanger (<100 sqft), standard plates',
        typical: 'Medium plate exchanger (100-500 sqft), gasket selection required',
        complex: 'Large plate exchanger (>500 sqft), brazed or special materials'
      },
      deliverables: {
        basic: [
          { name: 'Process Datasheet', discipline: 'Process', hours: 8 },
          { name: 'Basic Thermal Design', discipline: 'Process', hours: 10 },
          { name: 'Mechanical Datasheet', discipline: 'Mechanical', hours: 6 }
        ],
        typical: [
          { name: 'Process Datasheet', discipline: 'Process', hours: 12 },
          { name: 'Thermal Design Calculation', discipline: 'Process', hours: 16 },
          { name: 'Mechanical Datasheet', discipline: 'Mechanical', hours: 8 },
          { name: 'Gasket Selection Study', discipline: 'Mechanical', hours: 6 },
          { name: 'Foundation Design', discipline: 'Civil', hours: 12 },
          { name: 'Instrumentation Hookup', discipline: 'Electrical/Instrumentation', hours: 4 }
        ],
        complex: [
          { name: 'Process Datasheet', discipline: 'Process', hours: 16 },
          { name: 'Advanced Thermal Design', discipline: 'Process', hours: 24 },
          { name: 'Mechanical Datasheet', discipline: 'Mechanical', hours: 12 },
          { name: 'Advanced Material & Gasket Selection', discipline: 'Mechanical', hours: 10 },
          { name: 'Foundation Design', discipline: 'Civil', hours: 16 },
          { name: 'Instrumentation Hookup', discipline: 'Electrical/Instrumentation', hours: 6 }
        ]
      }
    }
  ],

  tank: [
    {
      id: 'atmospheric_tank',
      name: 'Atmospheric Storage Tank',
      category: 'tank',
      description: 'Ambient pressure storage',
      recommendedScope: 'typical',
      scopeGuidance: {
        basic: 'Small tank (<10k gal), fixed roof',
        typical: 'Medium tank (10k-50k gal), floating roof',
        complex: 'Large tank (>50k gal), special coatings or requirements'
      },
      deliverables: {
        basic: [
          { name: 'Process Datasheet', discipline: 'Process', hours: 6 },
          { name: 'Mechanical Datasheet', discipline: 'Mechanical', hours: 6 },
          { name: 'Tank Sizing Calculation', discipline: 'Mechanical', hours: 8 }
        ],
        typical: [
          { name: 'Process Datasheet', discipline: 'Process', hours: 10 },
          { name: 'Mechanical Datasheet', discipline: 'Mechanical', hours: 8 },
          { name: 'Tank Sizing Calculation', discipline: 'Mechanical', hours: 12 },
          { name: 'Foundation Design', discipline: 'Civil', hours: 20 },
          { name: 'Level Instrumentation', discipline: 'Electrical/Instrumentation', hours: 6 }
        ],
        complex: [
          { name: 'Process Datasheet', discipline: 'Process', hours: 14 },
          { name: 'API 650 Mechanical Datasheet', discipline: 'Mechanical', hours: 12 },
          { name: 'Tank Sizing & Stress Calculation', discipline: 'Mechanical', hours: 16 },
          { name: 'Foundation Design', discipline: 'Civil', hours: 28 },
          { name: 'Advanced Level Instrumentation', discipline: 'Electrical/Instrumentation', hours: 10 },
          { name: 'Coating Specification', discipline: 'Mechanical', hours: 8 }
        ]
      }
    },
    {
      id: 'day_tank',
      name: 'Day Tank',
      category: 'tank',
      description: 'Daily supply storage',
      recommendedScope: 'basic',
      scopeGuidance: {
        basic: 'Small day tank (<1k gal), basic design',
        typical: 'Medium day tank (1k-5k gal), level control required',
        complex: 'Large day tank (>5k gal) or special requirements'
      },
      deliverables: {
        basic: [
          { name: 'Process Datasheet', discipline: 'Process', hours: 4 },
          { name: 'Mechanical Datasheet', discipline: 'Mechanical', hours: 4 },
          { name: 'Tank Sizing Calculation', discipline: 'Mechanical', hours: 6 }
        ],
        typical: [
          { name: 'Process Datasheet', discipline: 'Process', hours: 8 },
          { name: 'Mechanical Datasheet', discipline: 'Mechanical', hours: 6 },
          { name: 'Tank Sizing Calculation', discipline: 'Mechanical', hours: 8 },
          { name: 'Foundation Design', discipline: 'Civil', hours: 12 },
          { name: 'Level Control System', discipline: 'Electrical/Instrumentation', hours: 6 }
        ],
        complex: [
          { name: 'Process Datasheet', discipline: 'Process', hours: 12 },
          { name: 'Mechanical Datasheet', discipline: 'Mechanical', hours: 10 },
          { name: 'Tank Sizing & Design Calculation', discipline: 'Mechanical', hours: 12 },
          { name: 'Foundation Design', discipline: 'Civil', hours: 16 },
          { name: 'Advanced Level Control System', discipline: 'Electrical/Instrumentation', hours: 10 }
        ]
      }
    }
  ],

  compressor: [
    {
      id: 'reciprocating',
      name: 'Reciprocating Compressor',
      category: 'compressor',
      description: 'Piston-type compression',
      recommendedScope: 'complex',
      scopeGuidance: {
        basic: 'Small recip (<500 HP), single stage',
        typical: 'Medium recip (500-2000 HP), multi-stage',
        complex: 'Large recip (>2000 HP), API 618 or special service'
      },
      deliverables: {
        basic: [
          { name: 'Process Datasheet', discipline: 'Process', hours: 14 },
          { name: 'Performance Calculations', discipline: 'Process', hours: 16 },
          { name: 'Mechanical Datasheet', discipline: 'Mechanical', hours: 10 }
        ],
        typical: [
          { name: 'Process Datasheet', discipline: 'Process', hours: 18 },
          { name: 'Performance Calculations', discipline: 'Process', hours: 24 },
          { name: 'Mechanical Datasheet', discipline: 'Mechanical', hours: 14 },
          { name: 'Foundation Design', discipline: 'Civil', hours: 28 },
          { name: 'Motor & Control System', discipline: 'Electrical/Instrumentation', hours: 12 },
          { name: 'Relief System Design', discipline: 'Safety', hours: 10 }
        ],
        complex: [
          { name: 'Process Datasheet', discipline: 'Process', hours: 24 },
          { name: 'Advanced Performance Calculations', discipline: 'Process', hours: 32 },
          { name: 'API 618 Mechanical Datasheet', discipline: 'Mechanical', hours: 20 },
          { name: 'Vibration & Pulsation Analysis', discipline: 'Mechanical', hours: 24 },
          { name: 'Foundation Design', discipline: 'Civil', hours: 40 },
          { name: 'Advanced Motor & Control System', discipline: 'Electrical/Instrumentation', hours: 16 },
          { name: 'Relief System Design', discipline: 'Safety', hours: 14 },
          { name: 'Noise Analysis', discipline: 'Safety', hours: 12 }
        ]
      }
    },
    {
      id: 'centrifugal_comp',
      name: 'Centrifugal Compressor',
      category: 'compressor',
      description: 'Dynamic compression',
      recommendedScope: 'complex',
      scopeGuidance: {
        basic: 'Small centrifugal (1000-3000 HP), single stage',
        typical: 'Medium centrifugal (3000-5000 HP), multi-stage',
        complex: 'Large centrifugal (>5000 HP), API 617 or special service'
      },
      deliverables: {
        basic: [
          { name: 'Process Datasheet', discipline: 'Process', hours: 16 },
          { name: 'Performance Calculations', discipline: 'Process', hours: 20 },
          { name: 'Mechanical Datasheet', discipline: 'Mechanical', hours: 12 }
        ],
        typical: [
          { name: 'Process Datasheet', discipline: 'Process', hours: 20 },
          { name: 'Performance Calculations', discipline: 'Process', hours: 28 },
          { name: 'Mechanical Datasheet', discipline: 'Mechanical', hours: 16 },
          { name: 'Vibration Analysis', discipline: 'Mechanical', hours: 16 },
          { name: 'Foundation Design', discipline: 'Civil', hours: 32 },
          { name: 'Motor & Control System', discipline: 'Electrical/Instrumentation', hours: 14 },
          { name: 'Relief System Design', discipline: 'Safety', hours: 10 }
        ],
        complex: [
          { name: 'Process Datasheet', discipline: 'Process', hours: 28 },
          { name: 'Advanced Performance Calculations', discipline: 'Process', hours: 40 },
          { name: 'API 617 Mechanical Datasheet', discipline: 'Mechanical', hours: 24 },
          { name: 'Advanced Vibration & Rotordynamics', discipline: 'Mechanical', hours: 28 },
          { name: 'Foundation Design', discipline: 'Civil', hours: 48 },
          { name: 'Advanced Motor & Control System', discipline: 'Electrical/Instrumentation', hours: 20 },
          { name: 'Relief System Design', discipline: 'Safety', hours: 14 },
          { name: 'Noise Analysis', discipline: 'Safety', hours: 12 }
        ]
      }
    },
    {
      id: 'screw_compressor',
      name: 'Screw Compressor',
      category: 'compressor',
      description: 'Rotary screw type',
      recommendedScope: 'typical',
      scopeGuidance: {
        basic: 'Small screw (<200 HP), oil-flooded',
        typical: 'Medium screw (200-500 HP), oil-free',
        complex: 'Large screw (>500 HP), high pressure or special service'
      },
      deliverables: {
        basic: [
          { name: 'Process Datasheet', discipline: 'Process', hours: 10 },
          { name: 'Performance Calculations', discipline: 'Process', hours: 12 },
          { name: 'Mechanical Datasheet', discipline: 'Mechanical', hours: 8 }
        ],
        typical: [
          { name: 'Process Datasheet', discipline: 'Process', hours: 14 },
          { name: 'Performance Calculations', discipline: 'Process', hours: 16 },
          { name: 'Mechanical Datasheet', discipline: 'Mechanical', hours: 10 },
          { name: 'Foundation Design', discipline: 'Civil', hours: 20 },
          { name: 'Motor & Control System', discipline: 'Electrical/Instrumentation', hours: 10 },
          { name: 'Relief System Design', discipline: 'Safety', hours: 8 }
        ],
        complex: [
          { name: 'Process Datasheet', discipline: 'Process', hours: 18 },
          { name: 'Advanced Performance Calculations', discipline: 'Process', hours: 24 },
          { name: 'Mechanical Datasheet', discipline: 'Mechanical', hours: 14 },
          { name: 'Vibration Analysis', discipline: 'Mechanical', hours: 12 },
          { name: 'Foundation Design', discipline: 'Civil', hours: 28 },
          { name: 'Advanced Motor & Control System', discipline: 'Electrical/Instrumentation', hours: 14 },
          { name: 'Relief System Design', discipline: 'Safety', hours: 10 },
          { name: 'Noise Analysis', discipline: 'Safety', hours: 8 }
        ]
      }
    }
  ]
};
