"""Phase-gate deliverables configuration for large, complex projects.

This module contains deliverables organized by project phase (Frame, Screen, Refine, Implement)
as per the Engineering Master Deliverables List.
"""

from typing import Dict, List

# Phase-gate deliverables organized by phase and discipline
PHASE_GATE_DELIVERABLES: Dict[str, List[Dict]] = {
    "frame": [
        {
            "name": "Process Description / PFD",
            "description": "Process flow diagram and description",
            "milestone": "ifr",
            "phase": "frame",
            "discipline": "process",
            "base_hours": 40,
            "sequence": 1,
            "sheets": {"small": 2, "medium": 4, "large": 8, "skid": 1}
        },
        {
            "name": "Process Design Basis",
            "description": "Pressures/temps/fluids/utilities",
            "milestone": "ifr",
            "phase": "frame",
            "discipline": "process",
            "base_hours": 30,
            "sequence": 2,
            "sheets": {"small": 5, "medium": 10, "large": 15, "skid": 3}
        },
        {
            "name": "General Arrangement",
            "description": "Used for TIC basis",
            "milestone": "ifr",
            "phase": "frame",
            "discipline": "civil",
            "base_hours": 50,
            "sequence": 3,
            "sheets": {"small": 3, "medium": 5, "large": 10, "skid": 2}
        },
        {
            "name": "Equipment List",
            "description": "Rough sizes/quantities to aid in TIC",
            "milestone": "ifr",
            "phase": "frame",
            "discipline": "mechanical",
            "base_hours": 30,
            "sequence": 4,
            "sheets": {"small": 2, "medium": 4, "large": 8, "skid": 1}
        },
        {
            "name": "TIC Estimate",
            "description": "+/- 50% Estimate",
            "milestone": "ifa",
            "phase": "frame",
            "discipline": "project",
            "base_hours": 80,
            "sequence": 5,
            "sheets": {"small": 10, "medium": 15, "large": 25, "skid": 5}
        },
        {
            "name": "Milestone Identification",
            "description": "Commissioning dates; perceived long lead equipment",
            "milestone": "ifr",
            "phase": "frame",
            "discipline": "project",
            "base_hours": 20,
            "sequence": 6,
            "sheets": {"small": 3, "medium": 5, "large": 8, "skid": 2}
        }
    ],

    "screen": [
        # Process deliverables
        {
            "name": "Process Design Basis",
            "description": "Including utility and chemical requirements",
            "milestone": "ifr",
            "phase": "screen",
            "discipline": "process",
            "base_hours": 60,
            "sequence": 1,
            "sheets": {"small": 8, "medium": 15, "large": 25, "skid": 5}
        },
        {
            "name": "Process Flow Diagram",
            "description": "Complete PFD",
            "milestone": "ifd",
            "phase": "screen",
            "discipline": "process",
            "base_hours": 80,
            "sequence": 2,
            "sheets": {"small": 4, "medium": 10, "large": 20, "skid": 2}
        },
        {
            "name": "Heat and Material Balance",
            "description": "Process mass and energy balance",
            "milestone": "ifd",
            "phase": "screen",
            "discipline": "process",
            "base_hours": 100,
            "sequence": 3,
            "sheets": {"small": 8, "medium": 15, "large": 30, "skid": 5}
        },
        {
            "name": "Preliminary or Red-line existing P&ID's",
            "description": "Initial P&ID development",
            "milestone": "ifr",
            "phase": "screen",
            "discipline": "process",
            "base_hours": 120,
            "sequence": 4,
            "sheets": {"small": 5, "medium": 12, "large": 25, "skid": 3}
        },
        {
            "name": "Line Sizing/Hydraulics",
            "description": "To extent required to support P&ID development/revisions",
            "milestone": "ifr",
            "phase": "screen",
            "discipline": "process",
            "base_hours": 60,
            "sequence": 5,
            "sheets": {"small": 5, "medium": 10, "large": 20, "skid": 3}
        },
        # Civil/Structural deliverables
        {
            "name": "Site Topographical Survey Scope of Work",
            "description": "Survey requirements definition",
            "milestone": "ifr",
            "phase": "screen",
            "discipline": "civil",
            "base_hours": 20,
            "sequence": 6,
            "sheets": {"small": 3, "medium": 5, "large": 8, "skid": 2}
        },
        {
            "name": "Soils Report and/or Soils Boring Location Plan Scope of Work",
            "description": "Geotechnical investigation scope",
            "milestone": "ifr",
            "phase": "screen",
            "discipline": "civil",
            "base_hours": 25,
            "sequence": 7,
            "sheets": {"small": 4, "medium": 6, "large": 10, "skid": 2}
        },
        {
            "name": "Civil/Structural Conceptual Design",
            "description": "Including building requirements; approx sizes, etc",
            "milestone": "ifr",
            "phase": "screen",
            "discipline": "civil",
            "base_hours": 80,
            "sequence": 8,
            "sheets": {"small": 5, "medium": 10, "large": 20, "skid": 3}
        },
        {
            "name": "Long Lead Civil/Structural Specifications",
            "description": "Buildings, etc. as appropriate to support execution plan and/or estimate",
            "milestone": "ifr",
            "phase": "screen",
            "discipline": "civil",
            "base_hours": 60,
            "sequence": 9,
            "sheets": {"small": 8, "medium": 12, "large": 20, "skid": 4}
        },
        # Mechanical deliverables
        {
            "name": "Materials of Construction Diagram",
            "description": "MOC diagram as needed",
            "milestone": "ifr",
            "phase": "screen",
            "discipline": "mechanical",
            "base_hours": 30,
            "sequence": 10,
            "sheets": {"small": 2, "medium": 4, "large": 8, "skid": 1}
        },
        {
            "name": "Equipment List",
            "description": "Process data sheet not necessary, but preliminary sizing basis needed",
            "milestone": "ifr",
            "phase": "screen",
            "discipline": "mechanical",
            "base_hours": 60,
            "sequence": 11,
            "sheets": {"small": 4, "medium": 8, "large": 15, "skid": 2}
        },
        {
            "name": "Piping Line List",
            "description": "As required to support TIC; depends on P&ID development level",
            "milestone": "ifr",
            "phase": "screen",
            "discipline": "mechanical",
            "base_hours": 50,
            "sequence": 12,
            "sheets": {"small": 5, "medium": 10, "large": 20, "skid": 3}
        },
        {
            "name": "Piping Tie-in List",
            "description": "Tie-in requirements",
            "milestone": "ifr",
            "phase": "screen",
            "discipline": "mechanical",
            "base_hours": 30,
            "sequence": 13,
            "sheets": {"small": 3, "medium": 6, "large": 12, "skid": 2}
        },
        {
            "name": "Long Lead Equipment Specifications",
            "description": "As appropriate to support execution plan and/or estimate",
            "milestone": "ifr",
            "phase": "screen",
            "discipline": "mechanical",
            "base_hours": 100,
            "sequence": 14,
            "sheets": {"small": 10, "medium": 20, "large": 35, "skid": 5}
        },
        # Electrical deliverables
        {
            "name": "Area Classification",
            "description": "As appropriate to support execution plan and/or estimate",
            "milestone": "ifr",
            "phase": "screen",
            "discipline": "electrical",
            "base_hours": 40,
            "sequence": 15,
            "sheets": {"small": 3, "medium": 6, "large": 12, "skid": 2}
        },
        {
            "name": "Electrical One-Line Diagrams",
            "description": "Power distribution one-line",
            "milestone": "ifr",
            "phase": "screen",
            "discipline": "electrical",
            "base_hours": 60,
            "sequence": 16,
            "sheets": {"small": 3, "medium": 8, "large": 15, "skid": 2}
        },
        {
            "name": "Long Lead Electrical Specifications",
            "description": "As appropriate to support execution plan and/or estimate",
            "milestone": "ifr",
            "phase": "screen",
            "discipline": "electrical",
            "base_hours": 80,
            "sequence": 17,
            "sheets": {"small": 8, "medium": 15, "large": 25, "skid": 4}
        },
        # I&C deliverables
        {
            "name": "System Block Diagram",
            "description": "As appropriate to support execution plan and/or estimate",
            "milestone": "ifr",
            "phase": "screen",
            "discipline": "i&c",
            "base_hours": 40,
            "sequence": 18,
            "sheets": {"small": 2, "medium": 5, "large": 10, "skid": 1}
        },
        {
            "name": "Long Lead I&C Specifications",
            "description": "As appropriate to support execution plan and/or estimate",
            "milestone": "ifr",
            "phase": "screen",
            "discipline": "i&c",
            "base_hours": 80,
            "sequence": 19,
            "sheets": {"small": 8, "medium": 15, "large": 25, "skid": 4}
        },
        # Piping deliverables
        {
            "name": "Conceptual Plot Plan",
            "description": "Can be collaborative effort between structural and piping",
            "milestone": "ifr",
            "phase": "screen",
            "discipline": "piping",
            "base_hours": 80,
            "sequence": 20,
            "sheets": {"small": 3, "medium": 6, "large": 12, "skid": 2}
        },
        {
            "name": "Piping Plan/One-Line and/or Preliminary Model w/BOM",
            "description": "As appropriate to support execution plan and/or TIC estimate",
            "milestone": "ifr",
            "phase": "screen",
            "discipline": "piping",
            "base_hours": 100,
            "sequence": 21,
            "sheets": {"small": 5, "medium": 10, "large": 20, "skid": 3}
        },
        # Project Management deliverables
        {
            "name": "Options Analysis and Selection",
            "description": "Evaluate project options",
            "milestone": "ifa",
            "phase": "screen",
            "discipline": "project",
            "base_hours": 60,
            "sequence": 22,
            "sheets": {"small": 10, "medium": 15, "large": 25, "skid": 5}
        },
        {
            "name": "Project Basis of Design - All Disciplines",
            "description": "Includes ISBL/OSBL definition; spec list; major crane requirements; constructability; engineering, procurement, construction plan",
            "milestone": "ifa",
            "phase": "screen",
            "discipline": "project",
            "base_hours": 120,
            "sequence": 23,
            "sheets": {"small": 15, "medium": 25, "large": 40, "skid": 8}
        },
        {
            "name": "Cost Estimate for Define Engineering",
            "description": "Estimate for next phase",
            "milestone": "ifa",
            "phase": "screen",
            "discipline": "project",
            "base_hours": 80,
            "sequence": 24,
            "sheets": {"small": 10, "medium": 15, "large": 25, "skid": 5}
        },
        {
            "name": "Total Installed Cost Estimate",
            "description": "Accuracy -30/+30%; includes basis of estimate document",
            "milestone": "ifa",
            "phase": "screen",
            "discipline": "project",
            "base_hours": 120,
            "sequence": 25,
            "sheets": {"small": 15, "medium": 25, "large": 40, "skid": 8}
        },
        {
            "name": "Project Milestone Schedule",
            "description": "Details for Screen Engineering included",
            "milestone": "ifa",
            "phase": "screen",
            "discipline": "project",
            "base_hours": 40,
            "sequence": 26,
            "sheets": {"small": 5, "medium": 8, "large": 12, "skid": 3}
        }
    ]
}


def get_deliverables_for_phase(phase: str) -> List[Dict]:
    """
    Get standard deliverables for a given phase-gate phase.

    Args:
        phase: Project phase (frame, screen, refine, implement)

    Returns:
        List of deliverable dictionaries
    """
    normalized = phase.lower().strip()
    return PHASE_GATE_DELIVERABLES.get(normalized, [])


def get_all_phases() -> List[str]:
    """Get list of all available phases."""
    return list(PHASE_GATE_DELIVERABLES.keys())
