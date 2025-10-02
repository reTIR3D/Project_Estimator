# Tasks for Tomorrow

## 0. Cleanup Task - Remove Legacy Clients ✅

~~**Delete the "Clients (Legacy)" button and functionality** from the navigation/page - the new Client Management system has replaced it completely.~~

**COMPLETED** - Removed legacy clients button from Dashboard and route from App.tsx

---

## 1. Deliverable Matrix Management System

### Overview
Build a deliverable matrix management page similar to the client management system, with saved project structure templates.

### Key Features

#### Template Creation Methods
- **Save from existing projects** - Convert a project's deliverable structure into a reusable template
- **Deliverable Matrix Builder** - Build templates from scratch using a visual builder

#### Project Phase Support
The builder should support the following project phases:
- IFB (Issued for Bid)
- IFI (Issued for Information)
- FYU (For Your Use)
- IFD (Issued for Design)
- IFH (Issued for Fabrication/Hardware)
- IFR (Issued for Review)
- IFA (Issued for Approval)
- IFC (Issued for Construction)

#### Deliverable Matrix Builder Workflow
1. Select project phases (multi-select from the list above)
2. For each selected phase, add deliverables from a predefined list
3. Organize deliverables in the natural order they would occur in the project
4. Save as a named template for reuse

#### UI Design Approach
- Similar structure to Client Management page
- List of saved templates with search/filter
- Template detail view showing phases and deliverables
- Template builder modal/page with phase selection and deliverable assignment
- Ability to clone/edit/delete templates

---

## 2. Phase-Gate Project UI & Backend

### Tasks
- Complete the phase-gate project type implementation
- Build out the UI for managing phase-gate projects
- Implement backend logic for phase gates
- Connect estimation and approval workflows for each gate

---

## 3. New Project Types

### A. Campaign-Type Projects
**Purpose**: Handle projects that are campaign-based (marketing/promotional campaigns, multi-phase rollouts, etc.)

**Considerations**:
- What makes a campaign project different from standard projects?
- Special fields or workflows needed?
- Timeline/scheduling differences?

### B. Process Modules (Equipment-Based Deliverables)

**Concept**: Assign deliverables to specific pieces of equipment. When equipment is added to a project, its deliverables are automatically included in the deliverable matrix.

**Example - Vessel Equipment**:
- Datasheet
- Nozzle schedule drawing
- Code calculations
- BOM (Bill of Materials)
- Fabrication drawings
- Installation drawings
- P&ID tie-in points

**Implementation Options to Consider**:

#### Option 1: Process Module as Project Type
- Create "Process Module" as a distinct project type
- Each module represents a piece of equipment
- Can be added/linked to parent projects
- Deliverables automatically populate when module is added

#### Option 2: Configurable Equipment Library
- Build an equipment library/catalog
- Each equipment type has a predefined deliverable template
- During project creation/editing, add equipment from library
- System auto-generates deliverables for selected equipment
- More flexible - can add multiple equipment types to any project

#### Option 3: Hybrid Approach
- Equipment library with deliverable templates
- Can be used standalone (as a mini project) or as add-ons to larger projects
- Supports both equipment-focused projects and projects with embedded equipment

**Questions to Explore**:
1. Should equipment modules be separate projects or components of projects?
2. How do equipment deliverables interact with phase-based deliverables?
3. Do different equipment types share common deliverables or are they unique?
4. Should equipment modules have their own estimation logic?
5. How do we handle equipment variations (e.g., vessel size affects drawing count)?

**Suggested Equipment Categories** (to start):
- Vessels/Tanks
- Heat Exchangers
- Pumps/Compressors
- Piping Systems
- Instrumentation
- Electrical Equipment
- Structural Steel

**Database Schema Considerations**:
- `equipment_types` table - catalog of equipment
- `equipment_deliverable_templates` table - deliverables per equipment type
- `project_equipment` table - junction table linking projects to equipment
- Consider if equipment has parameters (size, type, etc.) that affect deliverables

---

## Implementation Priority

**Suggested Order**:
1. **Deliverable Matrix Management** - Foundation for templates
2. **Process Modules/Equipment System** - Integrates with deliverable templates
3. **Phase-Gate Project Completion** - Uses deliverable matrix
4. **Campaign Projects** - Additional project type variant

---

## Notes from Today's Session

### Completed Work
- ✅ Added client complexity slider (1-10 scale) to replace client profile types (TYPE_A/B/C)
- ✅ Client complexity now drives estimation multiplier (0.80× to 1.25×)
- ✅ Added contact fields (name, email, phone) to client management
- ✅ Changed "Companies" to "Clients" throughout UI
- ✅ Added unit field to rate entries (hourly, daily, weekly, monthly, per seat, per project)
- ✅ Populated Equipment and Software disciplines with rates

### Current System State
- Client complexity multiplier formula: `1.0 + (complexity - 5) * 0.05`
- Estimation formula: `Total Hours = Base Hours × Complexity Multiplier × Client Complexity Factor + Contingency + Overhead`
- Rate sheets support multiple disciplines with different rate units
- Backend and frontend synchronized for client complexity in estimations

---

## Architecture Decisions Needed

For Process Modules, decide on:
1. **Data Model**: Standalone vs. embedded in projects
2. **UI Flow**: How users add equipment to projects
3. **Estimation Impact**: Do equipment modules add hours automatically?
4. **Deliverable Integration**: How equipment deliverables merge with project deliverables
5. **Reusability**: Can equipment configurations be saved as templates?

**Recommendation**: Start with Equipment Library approach (Option 2) because:
- More flexible for different project types
- Easier to extend with new equipment types
- Better reusability across projects
- Cleaner separation of concerns

---

## 4. Project Dashboard Enhancements

### A. Sorting & Filtering by Company/Client Name
- Add company/client name column to projects table
- Enable sorting by company name
- Add filter dropdown to show projects for specific clients
- Search functionality to filter by client name

### B. Analytics & Insights
- **High-Value Projects Display** - Show top dollar estimates prominently at top of dashboard
- **Summary Cards** with key metrics:
  - Total estimated value across all projects
  - Average project value
  - Number of active vs. completed projects
  - High-risk projects (low confidence scores)
- **Visual Analytics**:
  - Chart showing project value distribution
  - Timeline view of projects by start/end date
  - Client spending breakdown
  - Project status overview (draft, active, completed, etc.)
- **Sorting Options**:
  - By total cost (highest to lowest)
  - By confidence level
  - By project size
  - By status

---

## 5. Reporting & Export Features

### A. Rate Sheet Reports
- **Printable Rate Sheets** - Generate formatted PDF rate sheets for clients
- Customizable format options:
  - Include/exclude specific disciplines
  - Show/hide unit types
  - Add company branding/header
  - Date range for rate validity
- Export options: PDF, Excel, CSV

### B. Automated Proposal Generation
- **Proposal Builder** - Create professional proposals from project data
- Include sections:
  - Project overview and scope
  - Deliverable matrix/breakdown
  - Cost summary and breakdown by phase/discipline
  - Timeline and milestones
  - Terms and conditions
  - Client-specific rate sheet
- Template system for different proposal types
- Export as PDF with company branding
- Email integration to send directly to clients

### C. Additional Reports
- Project summary reports
- Cost comparison reports (multiple projects)
- Resource utilization reports
- Historical data analysis

---

## 6. AI Integration (Long-term Vision)

### Potential AI Helper Features

#### A. Project Estimation Assistant
- **Smart Suggestions** - Analyze project parameters and suggest:
  - Missing deliverables based on project type
  - Realistic hours based on historical data
  - Appropriate complexity factors
  - Optimal resource allocation

#### B. Cost & Schedule Optimization
- **Cost Reduction Recommendations**:
  - Identify overestimated areas
  - Suggest alternative resource allocation
  - Recommend value engineering opportunities
  - Flag duplicate or redundant deliverables
- **Schedule Optimization**:
  - Identify critical path items
  - Suggest parallel work opportunities
  - Recommend schedule compression techniques
  - Flag potential scheduling conflicts

#### C. Risk Analysis
- Identify high-risk areas in estimates
- Suggest contingency adjustments based on risk profile
- Compare against similar historical projects
- Flag unusual patterns or outliers

#### D. Natural Language Interface
- Chat-based project creation
- Ask questions about estimates: "What's driving the high cost in Phase 2?"
- Generate project summaries in plain language
- Voice commands for data entry

### Implementation Approach
1. **Phase 1**: Data collection and standardization
2. **Phase 2**: Historical analysis engine
3. **Phase 3**: Pattern recognition and suggestions
4. **Phase 4**: Full AI assistant with NLP

### Technology Options
- OpenAI GPT-4 API for natural language
- Local ML models for pattern recognition
- Historical data training for project-specific insights
- Integration with existing estimation engine

### Data Requirements
- Clean historical project data
- Standardized deliverable taxonomy
- Cost and schedule actual vs. estimates
- Success metrics for completed projects
