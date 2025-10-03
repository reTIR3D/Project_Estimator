import { EquipmentTemplate, EquipmentTemplateKey } from '../types';

export const EQUIPMENT_TEMPLATES: Record<EquipmentTemplateKey, EquipmentTemplate> = {
  vessel: {
    type: 'Pressure Vessel',
    icon: '⚗️',
    deliverables: [
      { name: 'Process Datasheet', discipline: 'Process', baseHours: 16 },
      { name: 'Mechanical Datasheet', discipline: 'Mechanical', baseHours: 12 },
      { name: 'Pressure Calculations', discipline: 'Mechanical', baseHours: 20 },
      { name: 'Nozzle Orientation Drawing', discipline: 'Mechanical', baseHours: 16 },
      { name: 'Foundation Design', discipline: 'Civil', baseHours: 24 },
      { name: 'Instrumentation Hookup', discipline: 'Electrical/Instrumentation', baseHours: 8 },
      { name: 'Relief Valve Sizing', discipline: 'Safety', baseHours: 8 },
    ],
    complexityFactors: {
      simple: 0.8,
      standard: 1.0,
      complex: 1.4,
    },
    sizeFactors: {
      small: 0.8,
      medium: 1.0,
      large: 1.3,
    },
  },

  pump: {
    type: 'Centrifugal Pump',
    icon: '🔄',
    deliverables: [
      { name: 'Process Datasheet', discipline: 'Process', baseHours: 12 },
      { name: 'Mechanical Datasheet', discipline: 'Mechanical', baseHours: 10 },
      { name: 'Pump Curve Analysis', discipline: 'Mechanical', baseHours: 8 },
      { name: 'Foundation Design', discipline: 'Civil', baseHours: 16 },
      { name: 'Motor Specification', discipline: 'Electrical/Instrumentation', baseHours: 6 },
      { name: 'Control System Integration', discipline: 'Electrical/Instrumentation', baseHours: 8 },
    ],
    complexityFactors: {
      simple: 0.8,
      standard: 1.0,
      complex: 1.3,
    },
    sizeFactors: {
      small: 0.7,
      medium: 1.0,
      large: 1.2,
    },
  },

  heat_exchanger: {
    type: 'Heat Exchanger',
    icon: '🌡️',
    deliverables: [
      { name: 'Process Datasheet', discipline: 'Process', baseHours: 14 },
      { name: 'Thermal Design Calculation', discipline: 'Process', baseHours: 20 },
      { name: 'Mechanical Datasheet', discipline: 'Mechanical', baseHours: 10 },
      { name: 'Tube Layout Drawing', discipline: 'Mechanical', baseHours: 12 },
      { name: 'Foundation Design', discipline: 'Civil', baseHours: 18 },
      { name: 'Instrumentation Hookup', discipline: 'Electrical/Instrumentation', baseHours: 6 },
    ],
    complexityFactors: {
      simple: 0.8,
      standard: 1.0,
      complex: 1.3,
    },
    sizeFactors: {
      small: 0.8,
      medium: 1.0,
      large: 1.2,
    },
  },

  tank: {
    type: 'Storage Tank',
    icon: '🛢️',
    deliverables: [
      { name: 'Process Datasheet', discipline: 'Process', baseHours: 10 },
      { name: 'Mechanical Datasheet', discipline: 'Mechanical', baseHours: 8 },
      { name: 'Tank Sizing Calculation', discipline: 'Mechanical', baseHours: 12 },
      { name: 'Foundation Design', discipline: 'Civil', baseHours: 20 },
      { name: 'Level Instrumentation', discipline: 'Electrical/Instrumentation', baseHours: 6 },
    ],
    complexityFactors: {
      simple: 0.7,
      standard: 1.0,
      complex: 1.2,
    },
    sizeFactors: {
      small: 0.7,
      medium: 1.0,
      large: 1.4,
    },
  },

  compressor: {
    type: 'Compressor',
    icon: '💨',
    deliverables: [
      { name: 'Process Datasheet', discipline: 'Process', baseHours: 18 },
      { name: 'Performance Calculations', discipline: 'Process', baseHours: 24 },
      { name: 'Mechanical Datasheet', discipline: 'Mechanical', baseHours: 14 },
      { name: 'Vibration Analysis', discipline: 'Mechanical', baseHours: 16 },
      { name: 'Foundation Design', discipline: 'Civil', baseHours: 28 },
      { name: 'Motor & Control System', discipline: 'Electrical/Instrumentation', baseHours: 12 },
      { name: 'Relief System Design', discipline: 'Safety', baseHours: 10 },
      { name: 'Noise Analysis', discipline: 'Safety', baseHours: 8 },
    ],
    complexityFactors: {
      simple: 0.9,
      standard: 1.0,
      complex: 1.5,
    },
    sizeFactors: {
      small: 0.8,
      medium: 1.0,
      large: 1.4,
    },
  },
};
