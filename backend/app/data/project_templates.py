"""Project templates and recommended architectures based on size and complexity."""

from typing import Dict, List, Any

# Project phases/milestones
PROJECT_PHASES = {
    "ifd": {
        "name": "IFD - Issued for Design",
        "description": "Initial design phase with conceptual layouts and preliminary calculations",
        "sequence": 1,
        "color": "blue"
    },
    "ifr": {
        "name": "IFR - Issued for Review",
        "description": "Design review phase with detailed calculations and vendor input",
        "sequence": 2,
        "color": "yellow"
    },
    "ifh": {
        "name": "IFH - Issued for HAZOP",
        "description": "Safety review and hazard analysis phase",
        "sequence": 3,
        "color": "purple"
    },
    "ifa": {
        "name": "IFA - Issued for Approval",
        "description": "Final design approval before construction documentation",
        "sequence": 4,
        "color": "orange"
    },
    "ifc": {
        "name": "IFC - Issued for Construction",
        "description": "Construction-ready documents and final deliverables",
        "sequence": 5,
        "color": "green"
    }
}

# Recommended project templates based on size
PROJECT_TEMPLATES: Dict[str, Dict[str, Any]] = {
    "small": {
        "name": "Small Project Template",
        "description": "Streamlined approach for projects under 500 hours",
        "phases": ["ifd", "ifa", "ifc"],  # Simplified phases
        "recommended_deliverables": {
            "multidiscipline": [
                {"name": "Design Basis Memorandum", "phase": "ifd", "hours": 40, "discipline": "Multidiscipline"},
                {"name": "Plot Plan / Site Layout", "phase": "ifd", "hours": 60, "discipline": "Multidiscipline"},
                {"name": "Specifications", "phase": "ifa", "hours": 80, "discipline": "Multidiscipline"},
                {"name": "Construction Support Documents", "phase": "ifc", "hours": 40, "discipline": "Multidiscipline"},
            ],
            "civil": [
                {"name": "Site Survey Report", "phase": "ifd", "hours": 40, "discipline": "Civil"},
                {"name": "Civil Site Layout", "phase": "ifa", "hours": 80, "discipline": "Civil"},
                {"name": "Civil Construction Drawings", "phase": "ifc", "hours": 100, "discipline": "Civil"},
            ],
            "mechanical": [
                {"name": "Equipment List", "phase": "ifd", "hours": 30, "discipline": "Mechanical"},
                {"name": "Equipment Datasheets", "phase": "ifd", "hours": 60, "discipline": "Mechanical"},
                {"name": "P&IDs", "phase": "ifa", "hours": 100, "discipline": "Mechanical"},
                {"name": "Material Requisitions", "phase": "ifc", "hours": 40, "discipline": "Mechanical"},
            ],
            "electrical": [
                {"name": "Electrical Load List", "phase": "ifd", "hours": 40, "discipline": "Electrical"},
                {"name": "Single Line Diagram", "phase": "ifa", "hours": 60, "discipline": "Electrical"},
                {"name": "Cable Schedules", "phase": "ifc", "hours": 70, "discipline": "Electrical"},
            ],
            "structural": [
                {"name": "Structural Basis of Design", "phase": "ifd", "hours": 30, "discipline": "Structural"},
                {"name": "Structural Load Calculations", "phase": "ifa", "hours": 70, "discipline": "Structural"},
                {"name": "Foundation Design", "phase": "ifc", "hours": 90, "discipline": "Structural"},
            ]
        }
    },

    "medium": {
        "name": "Medium Project Template",
        "description": "Standard approach for projects 500-2000 hours",
        "phases": ["ifd", "ifr", "ifa", "ifc"],  # Standard phases
        "recommended_deliverables": {
            "multidiscipline": [
                {"name": "Project Execution Plan", "phase": "ifd", "hours": 80, "discipline": "Multidiscipline"},
                {"name": "Design Basis Memorandum", "phase": "ifd", "hours": 100, "discipline": "Multidiscipline"},
                {"name": "Plot Plan / Site Layout", "phase": "ifr", "hours": 120, "discipline": "Multidiscipline"},
                {"name": "3D Model", "phase": "ifa", "hours": 300, "discipline": "Multidiscipline"},
                {"name": "Specifications", "phase": "ifc", "hours": 200, "discipline": "Multidiscipline"},
                {"name": "Material Take-Offs", "phase": "ifc", "hours": 160, "discipline": "Multidiscipline"},
                {"name": "Construction Support Documents", "phase": "ifc", "hours": 120, "discipline": "Multidiscipline"},
            ],
            "civil": [
                {"name": "Site Survey Report", "phase": "ifd", "hours": 80, "discipline": "Civil"},
                {"name": "Civil Site Layout", "phase": "ifr", "hours": 120, "discipline": "Civil"},
                {"name": "Foundation Design Calculations", "phase": "ifa", "hours": 160, "discipline": "Civil"},
                {"name": "Civil Construction Drawings", "phase": "ifc", "hours": 200, "discipline": "Civil"},
                {"name": "Drainage and Stormwater Design", "phase": "ifc", "hours": 100, "discipline": "Civil"},
            ],
            "mechanical": [
                {"name": "Equipment List", "phase": "ifd", "hours": 60, "discipline": "Mechanical"},
                {"name": "Equipment Datasheets", "phase": "ifr", "hours": 120, "discipline": "Mechanical"},
                {"name": "P&IDs", "phase": "ifr", "hours": 200, "discipline": "Mechanical"},
                {"name": "Equipment Layout Drawings", "phase": "ifa", "hours": 160, "discipline": "Mechanical"},
                {"name": "Piping Isometric Drawings", "phase": "ifc", "hours": 240, "discipline": "Mechanical"},
                {"name": "Material Requisitions", "phase": "ifc", "hours": 80, "discipline": "Mechanical"},
                {"name": "HVAC Design Calculations", "phase": "ifa", "hours": 140, "discipline": "Mechanical"},
            ],
            "electrical": [
                {"name": "Electrical Load List", "phase": "ifd", "hours": 80, "discipline": "Electrical"},
                {"name": "Single Line Diagram", "phase": "ifr", "hours": 120, "discipline": "Electrical"},
                {"name": "Power Distribution Design", "phase": "ifa", "hours": 160, "discipline": "Electrical"},
                {"name": "Cable Schedules", "phase": "ifc", "hours": 140, "discipline": "Electrical"},
                {"name": "Lighting Design", "phase": "ifc", "hours": 100, "discipline": "Electrical"},
                {"name": "Grounding and Lightning Protection", "phase": "ifc", "hours": 120, "discipline": "Electrical"},
            ],
            "structural": [
                {"name": "Structural Basis of Design", "phase": "ifd", "hours": 60, "discipline": "Structural"},
                {"name": "Structural Load Calculations", "phase": "ifr", "hours": 140, "discipline": "Structural"},
                {"name": "Foundation Design", "phase": "ifa", "hours": 180, "discipline": "Structural"},
                {"name": "Structural Steel Design", "phase": "ifa", "hours": 200, "discipline": "Structural"},
                {"name": "Concrete Design Drawings", "phase": "ifc", "hours": 160, "discipline": "Structural"},
            ]
        }
    },

    "large": {
        "name": "Large Project Template",
        "description": "Comprehensive approach for projects over 2000 hours",
        "phases": ["ifd", "ifr", "ifh", "ifa", "ifc"],  # All phases including HAZOP
        "recommended_deliverables": {
            "multidiscipline": [
                {"name": "Project Execution Plan", "phase": "ifd", "hours": 120, "discipline": "Multidiscipline"},
                {"name": "Design Basis Memorandum", "phase": "ifd", "hours": 150, "discipline": "Multidiscipline"},
                {"name": "Plot Plan / Site Layout", "phase": "ifr", "hours": 180, "discipline": "Multidiscipline"},
                {"name": "3D Model", "phase": "ifa", "hours": 500, "discipline": "Multidiscipline"},
                {"name": "Specifications", "phase": "ifc", "hours": 300, "discipline": "Multidiscipline"},
                {"name": "Material Take-Offs", "phase": "ifc", "hours": 240, "discipline": "Multidiscipline"},
                {"name": "Construction Support Documents", "phase": "ifc", "hours": 200, "discipline": "Multidiscipline"},
            ],
            "civil": [
                {"name": "Site Survey Report", "phase": "ifd", "hours": 120, "discipline": "Civil"},
                {"name": "Civil Site Layout", "phase": "ifr", "hours": 180, "discipline": "Civil"},
                {"name": "Foundation Design Calculations", "phase": "ifa", "hours": 240, "discipline": "Civil"},
                {"name": "Civil Construction Drawings", "phase": "ifc", "hours": 300, "discipline": "Civil"},
                {"name": "Drainage and Stormwater Design", "phase": "ifc", "hours": 150, "discipline": "Civil"},
                {"name": "Road and Pavement Design", "phase": "ifc", "hours": 180, "discipline": "Civil"},
            ],
            "mechanical": [
                {"name": "Equipment List", "phase": "ifd", "hours": 100, "discipline": "Mechanical"},
                {"name": "Equipment Datasheets", "phase": "ifr", "hours": 180, "discipline": "Mechanical"},
                {"name": "P&IDs", "phase": "ifr", "hours": 300, "discipline": "Mechanical"},
                {"name": "Equipment Layout Drawings", "phase": "ifa", "hours": 240, "discipline": "Mechanical"},
                {"name": "Piping Isometric Drawings", "phase": "ifc", "hours": 360, "discipline": "Mechanical"},
                {"name": "Material Requisitions", "phase": "ifc", "hours": 120, "discipline": "Mechanical"},
                {"name": "HVAC Design Calculations", "phase": "ifa", "hours": 200, "discipline": "Mechanical"},
            ],
            "electrical": [
                {"name": "Electrical Load List", "phase": "ifd", "hours": 120, "discipline": "Electrical"},
                {"name": "Single Line Diagram", "phase": "ifr", "hours": 180, "discipline": "Electrical"},
                {"name": "Power Distribution Design", "phase": "ifa", "hours": 240, "discipline": "Electrical"},
                {"name": "Cable Schedules", "phase": "ifc", "hours": 200, "discipline": "Electrical"},
                {"name": "Lighting Design", "phase": "ifc", "hours": 150, "discipline": "Electrical"},
                {"name": "Grounding and Lightning Protection", "phase": "ifc", "hours": 180, "discipline": "Electrical"},
                {"name": "Motor Control Center (MCC) Drawings", "phase": "ifc", "hours": 150, "discipline": "Electrical"},
            ],
            "structural": [
                {"name": "Structural Basis of Design", "phase": "ifd", "hours": 90, "discipline": "Structural"},
                {"name": "Structural Load Calculations", "phase": "ifr", "hours": 210, "discipline": "Structural"},
                {"name": "Foundation Design", "phase": "ifa", "hours": 270, "discipline": "Structural"},
                {"name": "Structural Steel Design", "phase": "ifa", "hours": 300, "discipline": "Structural"},
                {"name": "Concrete Design Drawings", "phase": "ifc", "hours": 240, "discipline": "Structural"},
                {"name": "Steel Fabrication Drawings", "phase": "ifc", "hours": 270, "discipline": "Structural"},
            ],
            "chemical": [
                {"name": "Process Flow Diagrams (PFDs)", "phase": "ifd", "hours": 150, "discipline": "Chemical"},
                {"name": "Mass and Energy Balance", "phase": "ifr", "hours": 240, "discipline": "Chemical"},
                {"name": "Equipment Sizing Calculations", "phase": "ifr", "hours": 270, "discipline": "Chemical"},
                {"name": "P&IDs (Chemical Process)", "phase": "ifa", "hours": 330, "discipline": "Chemical"},
                {"name": "Process Safety Analysis", "phase": "ifh", "hours": 300, "discipline": "Chemical"},
                {"name": "Equipment Specifications", "phase": "ifc", "hours": 210, "discipline": "Chemical"},
            ]
        }
    }
}


def get_project_template(project_size: str) -> Dict[str, Any]:
    """
    Get recommended project template based on size.

    Args:
        project_size: Project size (small, medium, large)

    Returns:
        Project template with phases and recommended deliverables
    """
    return PROJECT_TEMPLATES.get(project_size.lower(), PROJECT_TEMPLATES["medium"])


def get_recommended_deliverables(project_size: str, discipline: str) -> List[Dict]:
    """
    Get recommended deliverables for a specific project size and discipline.

    Args:
        project_size: Project size (small, medium, large)
        discipline: Engineering discipline

    Returns:
        List of recommended deliverables with phases and hours
    """
    template = get_project_template(project_size)
    discipline_key = discipline.lower().replace('_', '')

    # Get deliverables for the discipline, or multidiscipline as fallback
    deliverables = template["recommended_deliverables"].get(
        discipline_key,
        template["recommended_deliverables"].get("multidiscipline", [])
    )

    return deliverables