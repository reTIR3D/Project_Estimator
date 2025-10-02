"""Standard engineering deliverables configuration."""

from typing import Dict, List

# Standard deliverables by engineering discipline
STANDARD_DELIVERABLES: Dict[str, List[Dict]] = {
    "civil": [
        {
            "name": "Site Survey Report",
            "description": "Topographic and geotechnical site survey",
            "milestone": "ifd",
            "base_hours": 80,
            "sequence": 1,
            "sheets": {"small": 5, "medium": 10, "large": 20, "skid": 3}
        },
        {
            "name": "Civil Site Layout",
            "description": "Overall site layout and grading plan",
            "milestone": "ifr",
            "base_hours": 120,
            "sequence": 2,
            "sheets": {"small": 3, "medium": 6, "large": 12, "skid": 2}
        },
        {
            "name": "Foundation Design Calculations",
            "description": "Structural foundation design and calculations",
            "milestone": "ifa",
            "base_hours": 160,
            "sequence": 3,
            "sheets": {"small": 8, "medium": 15, "large": 30, "skid": 5}
        },
        {
            "name": "Civil Construction Drawings",
            "description": "Detailed construction drawings for civil works",
            "milestone": "ifc",
            "base_hours": 200,
            "sequence": 4,
            "sheets": {"small": 10, "medium": 20, "large": 40, "skid": 5}
        },
        {
            "name": "Drainage and Stormwater Design",
            "description": "Drainage system design and calculations",
            "milestone": "ifc",
            "base_hours": 100,
            "sequence": 5,
            "sheets": {"small": 5, "medium": 10, "large": 15, "skid": 3}
        },
        {
            "name": "Road and Pavement Design",
            "description": "Access roads and pavement design",
            "milestone": "ifc",
            "base_hours": 120,
            "sequence": 6,
            "sheets": {"small": 6, "medium": 12, "large": 20, "skid": 2}
        }
    ],

    "mechanical": [
        {
            "name": "Equipment List",
            "description": "Complete list of mechanical equipment",
            "milestone": "ifd",
            "base_hours": 60,
            "sequence": 1,
            "sheets": {"small": 2, "medium": 5, "large": 12, "skid": 1}
        },
        {
            "name": "Equipment Datasheets",
            "description": "Technical datasheets for all equipment",
            "milestone": "ifr",
            "base_hours": 120,
            "sequence": 2,
            "sheets": {"small": 5, "medium": 12, "large": 25, "skid": 3}
        },
        {
            "name": "Piping & Instrumentation Diagrams (P&IDs)",
            "description": "Process flow and instrumentation diagrams",
            "milestone": "ifr",
            "base_hours": 200,
            "sequence": 3,
            "sheets": {"small": 5, "medium": 15, "large": 35, "skid": 2}
        },
        {
            "name": "Equipment Layout Drawings",
            "description": "3D equipment arrangement and layout",
            "milestone": "ifa",
            "base_hours": 160,
            "sequence": 4,
            "sheets": {"small": 4, "medium": 10, "large": 20, "skid": 2}
        },
        {
            "name": "Piping Isometric Drawings",
            "description": "Detailed piping isometrics",
            "milestone": "ifc",
            "base_hours": 240,
            "sequence": 5,
            "sheets": {"small": 15, "medium": 40, "large": 100, "skid": 5}
        },
        {
            "name": "Material Requisitions",
            "description": "Equipment and material purchase requisitions",
            "milestone": "ifc",
            "base_hours": 80,
            "sequence": 6,
            "sheets": {"small": 3, "medium": 8, "large": 15, "skid": 2}
        },
        {
            "name": "HVAC Design Calculations",
            "description": "Heating, ventilation, and air conditioning design",
            "milestone": "ifa",
            "base_hours": 140,
            "sequence": 7,
            "sheets": {"small": 6, "medium": 12, "large": 25, "skid": 0}
        }
    ],

    "electrical": [
        {
            "name": "Electrical Load List",
            "description": "Complete electrical load schedule",
            "milestone": "ifd",
            "base_hours": 80,
            "sequence": 1,
            "sheets": {"small": 2, "medium": 5, "large": 10, "skid": 1}
        },
        {
            "name": "Single Line Diagram",
            "description": "Electrical power distribution single line",
            "milestone": "ifr",
            "base_hours": 120,
            "sequence": 2,
            "sheets": {"small": 3, "medium": 10, "large": 25, "skid": 1}
        },
        {
            "name": "Power Distribution Design",
            "description": "Detailed power distribution system design",
            "milestone": "ifa",
            "base_hours": 160,
            "sequence": 3,
            "sheets": {"small": 5, "medium": 12, "large": 25, "skid": 2}
        },
        {
            "name": "Cable Schedules",
            "description": "Complete cable sizing and schedules",
            "milestone": "ifc",
            "base_hours": 140,
            "sequence": 4,
            "sheets": {"small": 3, "medium": 8, "large": 15, "skid": 2}
        },
        {
            "name": "Lighting Design",
            "description": "Interior and exterior lighting design",
            "milestone": "ifc",
            "base_hours": 100,
            "sequence": 5,
            "sheets": {"small": 4, "medium": 8, "large": 15, "skid": 2}
        },
        {
            "name": "Grounding and Lightning Protection",
            "description": "Grounding grid and lightning protection design",
            "milestone": "ifc",
            "base_hours": 120,
            "sequence": 6,
            "sheets": {"small": 3, "medium": 6, "large": 12, "skid": 1}
        },
        {
            "name": "Motor Control Center (MCC) Drawings",
            "description": "MCC layout and wiring diagrams",
            "milestone": "ifc",
            "base_hours": 100,
            "sequence": 7,
            "sheets": {"small": 4, "medium": 10, "large": 20, "skid": 2}
        }
    ],

    "structural": [
        {
            "name": "Structural Basis of Design",
            "description": "Design criteria and code requirements",
            "milestone": "ifd",
            "base_hours": 60,
            "sequence": 1,
            "sheets": {"small": 5, "medium": 10, "large": 20, "skid": 3}
        },
        {
            "name": "Structural Load Calculations",
            "description": "Load analysis and calculations",
            "milestone": "ifr",
            "base_hours": 140,
            "sequence": 2,
            "sheets": {"small": 8, "medium": 15, "large": 30, "skid": 5}
        },
        {
            "name": "Foundation Design",
            "description": "Foundation design drawings and details",
            "milestone": "ifa",
            "base_hours": 180,
            "sequence": 3,
            "sheets": {"small": 5, "medium": 10, "large": 25, "skid": 2}
        },
        {
            "name": "Structural Steel Design",
            "description": "Steel frame design and connections",
            "milestone": "ifa",
            "base_hours": 200,
            "sequence": 4,
            "sheets": {"small": 6, "medium": 12, "large": 28, "skid": 2}
        },
        {
            "name": "Concrete Design Drawings",
            "description": "Reinforced concrete design and details",
            "milestone": "ifc",
            "base_hours": 160,
            "sequence": 5,
            "sheets": {"small": 5, "medium": 10, "large": 22, "skid": 2}
        },
        {
            "name": "Steel Fabrication Drawings",
            "description": "Detailed fabrication and erection drawings",
            "milestone": "ifc",
            "base_hours": 180,
            "sequence": 6,
            "sheets": {"small": 8, "medium": 15, "large": 30, "skid": 3}
        }
    ],

    "chemical": [
        {
            "name": "Process Flow Diagrams (PFDs)",
            "description": "Overall process flow diagrams",
            "milestone": "ifd",
            "base_hours": 100,
            "sequence": 1,
            "sheets": {"small": 3, "medium": 10, "large": 25, "skid": 1}
        },
        {
            "name": "Mass and Energy Balance",
            "description": "Process mass and energy balance calculations",
            "milestone": "ifr",
            "base_hours": 160,
            "sequence": 2,
            "sheets": {"small": 8, "medium": 15, "large": 35, "skid": 5}
        },
        {
            "name": "Equipment Sizing Calculations",
            "description": "Process equipment sizing and design",
            "milestone": "ifr",
            "base_hours": 180,
            "sequence": 3,
            "sheets": {"small": 10, "medium": 18, "large": 40, "skid": 6}
        },
        {
            "name": "P&IDs (Chemical Process)",
            "description": "Detailed P&IDs with all instrumentation",
            "milestone": "ifa",
            "base_hours": 220,
            "sequence": 4,
            "sheets": {"small": 5, "medium": 20, "large": 50, "skid": 2}
        },
        {
            "name": "Process Safety Analysis",
            "description": "HAZOP and process safety studies",
            "milestone": "ifh",
            "base_hours": 200,
            "sequence": 5,
            "sheets": {"small": 10, "medium": 20, "large": 40, "skid": 5}
        },
        {
            "name": "Equipment Specifications",
            "description": "Detailed equipment technical specifications",
            "milestone": "ifc",
            "base_hours": 140,
            "sequence": 6,
            "sheets": {"small": 8, "medium": 15, "large": 30, "skid": 4}
        }
    ],

    "environmental": [
        {
            "name": "Environmental Impact Assessment",
            "description": "Environmental impact study and report",
            "milestone": "ifd",
            "base_hours": 120,
            "sequence": 1,
            "sheets": {"small": 10, "medium": 20, "large": 40, "skid": 5}
        },
        {
            "name": "Air Quality Analysis",
            "description": "Air emissions analysis and dispersion modeling",
            "milestone": "ifr",
            "base_hours": 100,
            "sequence": 2,
            "sheets": {"small": 8, "medium": 15, "large": 30, "skid": 4}
        },
        {
            "name": "Wastewater Treatment Design",
            "description": "Wastewater treatment system design",
            "milestone": "ifa",
            "base_hours": 160,
            "sequence": 3,
            "sheets": {"small": 6, "medium": 12, "large": 25, "skid": 3}
        },
        {
            "name": "Stormwater Management Plan",
            "description": "Stormwater pollution prevention plan",
            "milestone": "ifc",
            "base_hours": 80,
            "sequence": 4,
            "sheets": {"small": 5, "medium": 10, "large": 20, "skid": 3}
        },
        {
            "name": "Environmental Monitoring Plan",
            "description": "Environmental compliance monitoring procedures",
            "milestone": "ifc",
            "base_hours": 60,
            "sequence": 5,
            "sheets": {"small": 5, "medium": 10, "large": 15, "skid": 3}
        }
    ],

    "multidiscipline": [
        {
            "name": "Project Execution Plan",
            "description": "Overall project execution and quality plan",
            "milestone": "ifd",
            "base_hours": 80,
            "sequence": 1,
            "sheets": {"small": 8, "medium": 15, "large": 30, "skid": 4}
        },
        {
            "name": "Design Basis Memorandum",
            "description": "Design basis and criteria document",
            "milestone": "ifd",
            "base_hours": 100,
            "sequence": 2,
            "sheets": {"small": 10, "medium": 18, "large": 35, "skid": 5}
        },
        {
            "name": "Plot Plan / Site Layout",
            "description": "Overall facility plot plan",
            "milestone": "ifr",
            "base_hours": 120,
            "sequence": 3,
            "sheets": {"small": 3, "medium": 8, "large": 15, "skid": 1}
        },
        {
            "name": "3D Model",
            "description": "3D CAD model of facility",
            "milestone": "ifa",
            "base_hours": 300,
            "sequence": 4,
            "sheets": {"small": 1, "medium": 1, "large": 1, "skid": 1}
        },
        {
            "name": "Specifications",
            "description": "Technical specifications for all disciplines",
            "milestone": "ifc",
            "base_hours": 200,
            "sequence": 5,
            "sheets": {"small": 10, "medium": 20, "large": 40, "skid": 5}
        },
        {
            "name": "Material Take-Offs",
            "description": "Quantity take-offs and bill of materials",
            "milestone": "ifc",
            "base_hours": 160,
            "sequence": 6,
            "sheets": {"small": 4, "medium": 8, "large": 18, "skid": 2}
        },
        {
            "name": "Construction Support Documents",
            "description": "RFI responses and construction phase support",
            "milestone": "ifc",
            "base_hours": 120,
            "sequence": 7,
            "sheets": {"small": 5, "medium": 12, "large": 25, "skid": 3}
        }
    ]
}


def get_deliverables_for_discipline(discipline: str) -> List[Dict]:
    """
    Get standard deliverables for a given discipline.

    Args:
        discipline: Engineering discipline (civil, mechanical, electrical, etc.)

    Returns:
        List of deliverable dictionaries
    """
    # Normalize the discipline name (remove underscores, convert to lowercase)
    normalized = discipline.lower().replace('_', '').replace('-', '')

    # Try to find matching discipline
    for key in STANDARD_DELIVERABLES.keys():
        if key.replace('_', '').replace('-', '') == normalized:
            return STANDARD_DELIVERABLES[key]

    # Default to multidiscipline
    return STANDARD_DELIVERABLES["multidiscipline"]


def get_all_disciplines() -> List[str]:
    """Get list of all available disciplines."""
    return list(STANDARD_DELIVERABLES.keys())