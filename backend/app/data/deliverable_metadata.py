"""Deliverable metadata including role breakdowns and types.

This augments the project templates with additional metadata for cost calculation.
"""

from typing import Dict, Any

# Map deliverable names to their types and role distribution patterns
DELIVERABLE_METADATA: Dict[str, Dict[str, Any]] = {
    # === Multidiscipline Deliverables ===
    "Project Execution Plan": {
        "type": "planning",
        "description": "Comprehensive project plan covering scope, schedule, resources, and risk management"
    },

    "Design Basis Memorandum": {
        "type": "document",
        "description": "Technical foundation document establishing design criteria and assumptions"
    },

    "Plot Plan / Site Layout": {
        "type": "drawing",
        "description": "Site arrangement showing equipment, buildings, and infrastructure layout"
    },

    "3D Model": {
        "type": "model",
        "description": "3D CAD model for visualization, clash detection, and coordination"
    },

    "Specifications": {
        "type": "document",
        "description": "Technical specifications for materials, equipment, and construction methods"
    },

    "Material Take-Offs": {
        "type": "list",
        "description": "Quantified bill of materials from drawings and specifications"
    },

    "Construction Support Documents": {
        "type": "document",
        "description": "As-built documentation, operation manuals, and closeout documents"
    },

    # === Civil Deliverables ===
    "Site Survey Report": {
        "type": "document",
        "description": "Topographical survey and site conditions report"
    },

    "Civil Site Layout": {
        "type": "drawing",
        "description": "Civil infrastructure layout including roads, drainage, and utilities"
    },

    "Foundation Design Calculations": {
        "type": "calculation",
        "description": "Structural calculations for foundation sizing and design"
    },

    "Civil Construction Drawings": {
        "type": "drawing",
        "description": "Detailed construction drawings for civil works"
    },

    # === Mechanical Deliverables ===
    "Equipment List": {
        "type": "list",
        "description": "Master list of all mechanical equipment with key parameters"
    },

    "Equipment Datasheets": {
        "type": "document",
        "description": "Detailed technical specifications for each major equipment item"
    },

    "P&IDs": {
        "type": "drawing",
        "description": "Piping and Instrumentation Diagrams showing process flow and control"
    },

    "Equipment Layout Drawings": {
        "type": "drawing",
        "description": "Detailed equipment arrangement and spacing drawings"
    },

    "Piping Isometric Drawings": {
        "type": "drawing",
        "description": "3D piping spool drawings for fabrication and installation"
    },

    "Material Requisitions": {
        "type": "document",
        "description": "Purchase requisitions for equipment and bulk materials"
    },

    # === Electrical Deliverables ===
    "Electrical Load List": {
        "type": "list",
        "description": "Complete electrical load schedule with power requirements"
    },

    "Single Line Diagram": {
        "type": "drawing",
        "description": "Power distribution one-line diagram showing electrical architecture"
    },

    "Cable Schedules": {
        "type": "list",
        "description": "Detailed cable routing and specification schedules"
    },

    # === Structural Deliverables ===
    "Structural Basis of Design": {
        "type": "document",
        "description": "Design criteria, codes, and loading assumptions for structures"
    },

    "Structural Load Calculations": {
        "type": "calculation",
        "description": "Engineering calculations for structural member sizing"
    },

    "Foundation Design": {
        "type": "calculation",
        "description": "Foundation design calculations and drawings"
    },
}


def get_deliverable_metadata(deliverable_name: str) -> Dict[str, Any]:
    """
    Get metadata for a deliverable.

    Args:
        deliverable_name: Name of the deliverable

    Returns:
        Metadata dictionary with type and description
    """
    return DELIVERABLE_METADATA.get(deliverable_name, {
        "type": "document",  # Default to document type
        "description": deliverable_name
    })