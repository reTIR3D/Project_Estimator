# Next Session: Feature Development Plan

## Session Summary (Completed Today)
- ✅ Fixed discipline integration between Setup and Team Builder
- ✅ Redesigned Team Builder with visual button-based interface
  - Green buttons = assigned roles
  - Orange buttons = unassigned roles
  - Click role button to assign from company employee list
  - Added designers, drafters, and specialists to all disciplines
- ✅ Added "+" button for adding roles inline
- ✅ Removed pulsing animation on unassigned roles

## Priority Features for Next Session

### 1. SAVE/LOAD PROJECTS (FOUNDATION)
**Priority: HIGHEST - Everything else builds on this**

#### Backend Tasks:
- [ ] Create database models for saved projects/estimates
  - Project metadata (name, client, date created, last modified, status)
  - All estimation parameters (disciplines, size, complexity, deliverables, team, WBS, RACI, etc.)
- [ ] Create API endpoints:
  - `POST /api/projects/save` - Save current project
  - `GET /api/projects/{id}` - Load specific project
  - `GET /api/projects` - List all user's projects
  - `PUT /api/projects/{id}` - Update existing project
  - `DELETE /api/projects/{id}` - Delete project
  - `POST /api/projects/{id}/duplicate` - Duplicate as template

#### Frontend Tasks:
- [ ] Add "Save Project" button in header/navigation
  - Modal to name project and add notes
- [ ] Add "Load Project" button
  - Show list of saved projects with preview cards
  - Display: name, client, date, total hours, status
- [ ] Add "Save As Template" feature
- [ ] Add auto-save functionality (every 2 minutes)
- [ ] Show "unsaved changes" indicator

---

### 2. EXCEL WBS EXPORT
**Priority: HIGH - Immediate practical value**

#### Backend Tasks:
- [ ] Install openpyxl or xlsxwriter library
- [ ] Create export endpoint: `GET /api/projects/{id}/export/wbs`
- [ ] Generate Excel with columns:
  - Task ID
  - Task Name
  - Phase/Milestone
  - Discipline
  - Assigned To
  - Estimated Hours
  - Start Date (calculated)
  - End Date (calculated)
  - Dependencies
  - Status (default: Not Started)
  - Notes

#### Frontend Tasks:
- [ ] Add "Export WBS to Excel" button in WBS/Summary steps
- [ ] Download generated Excel file
- [ ] Show export progress indicator
- [ ] Option to include/exclude certain columns

---

### 3. CAMPAIGN/REPEAT PROJECTS
**Priority: MEDIUM-HIGH - Unique competitive feature**

#### Backend Tasks:
- [ ] Add "Campaign" project type to database
- [ ] Create learning curve calculation:
  - Formula: Cost(n) = FirstProjectCost × n^(-learning_rate)
  - Typical learning rates: 10-30% improvement
- [ ] API for campaign calculations:
  - `POST /api/campaigns/calculate` - Calculate campaign pricing
  - Input: base project, quantity, learning curve %
  - Output: per-project costs, total campaign cost

#### Frontend Tasks:
- [ ] Add "Campaign Project" option in Setup step
- [ ] When selected, show:
  - Number of projects field
  - Learning curve slider (0-30%)
  - Visual chart showing cost reduction over projects
- [ ] Campaign summary table:
  - Project #1: X hours, $Y
  - Project #2: X hours, $Y (% reduction)
  - ...
  - Total campaign: X hours, $Y (avg per project)
- [ ] Option to customize individual projects in campaign

---

### 4. RESOURCE MANAGEMENT DASHBOARD
**Priority: MEDIUM - High value for preventing overallocation**

#### Backend Tasks:
- [ ] Create "People" database table:
  - Employee ID, Name, Role/Title, Disciplines, Hourly Rate
  - Max hours/week (default 40)
- [ ] Create "Project Assignments" tracking:
  - Person, Project, Role, Allocated Hours/Week, Start Date, End Date
- [ ] API endpoints:
  - `GET /api/resources/dashboard` - Overview of all people + allocations
  - `GET /api/resources/{person_id}/projects` - Person's project assignments
  - `GET /api/resources/conflicts` - List overallocated people
  - `POST /api/resources/assign` - Assign person to project

#### Frontend Tasks:
- [ ] New page: "Resource Dashboard"
- [ ] **People View**:
  - List all employees
  - Show capacity bars (green/yellow/red)
  - Current hours committed this week/month
  - Filter by discipline, availability
- [ ] **Project View**:
  - Show all projects + who's assigned
  - Highlight conflicts in red
- [ ] **Timeline View** (Gantt-style):
  - X-axis: weeks/months
  - Y-axis: people
  - Color-coded blocks for each project assignment
- [ ] Warnings:
  - "⚠️ Sarah Johnson: 60 hrs/week in March"
  - "⚠️ 3 people overallocated this month"

---

### 5. PROPOSAL GENERATION
**Priority: MEDIUM - Client-facing polish**

#### Backend Tasks:
- [ ] Install PDF generation library (ReportLab or WeasyPrint)
- [ ] Create proposal templates:
  - Cover page
  - Project scope & objectives
  - Team & qualifications
  - Deliverables table
  - Timeline/schedule
  - Cost breakdown
  - Assumptions & exclusions
  - Terms & conditions
- [ ] API endpoint: `POST /api/projects/{id}/generate-proposal`

#### Frontend Tasks:
- [ ] "Generate Proposal" button in Summary step
- [ ] Proposal customization modal:
  - Select template style
  - Add cover letter
  - Edit scope description
  - Add/edit assumptions & exclusions
  - Include/exclude certain sections
- [ ] Preview proposal before generating
- [ ] Download as PDF
- [ ] Track proposal versions (v1, v2, etc.)
- [ ] Proposal status tracking: Draft → Sent → Under Review → Approved/Rejected

---

## Additional Enhancements (Lower Priority)

### Visual Summary Dashboard
- [ ] Add charts to Summary page:
  - Pie chart: hours by discipline
  - Bar chart: hours by phase
  - Timeline: project duration
  - Budget breakdown visualization
- [ ] Export summary as PDF

### Smart Defaults & Learning
- [ ] Remember user preferences:
  - Favorite team members
  - Typical contingency %
  - Common complexity factors
- [ ] Suggest similar past projects
- [ ] Track estimate vs. actual (future integration)

### Validation & Warnings
- [ ] Warn if no QA hours in design phase
- [ ] Flag estimates that seem unusually high/low
- [ ] Required fields validation before proceeding

### Mobile/Tablet Optimization
- [ ] Responsive design improvements
- [ ] Touch-friendly buttons
- [ ] Simplified mobile views

---

## Database Schema Updates Needed

### Projects Table
```sql
CREATE TABLE projects (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    name VARCHAR(255),
    client_name VARCHAR(255),
    project_type VARCHAR(50), -- 'standard', 'campaign'
    status VARCHAR(50), -- 'draft', 'in_progress', 'completed'
    created_at TIMESTAMP,
    updated_at TIMESTAMP,

    -- Estimation data (JSON)
    disciplines JSON,
    project_size VARCHAR(20),
    complexity_factors JSON,
    deliverables JSON,
    team JSON,
    wbs JSON,
    raci JSON,
    estimation_results JSON
);
```

### Campaign Projects Table
```sql
CREATE TABLE campaign_projects (
    id UUID PRIMARY KEY,
    project_id UUID REFERENCES projects(id),
    quantity INT,
    learning_curve_rate FLOAT,
    base_project_hours INT,
    total_campaign_hours INT,
    created_at TIMESTAMP
);
```

### People/Resources Table
```sql
CREATE TABLE people (
    id UUID PRIMARY KEY,
    company_id UUID,
    name VARCHAR(255),
    email VARCHAR(255),
    role VARCHAR(100),
    disciplines JSON,
    hourly_rate DECIMAL(10,2),
    max_hours_per_week INT DEFAULT 40,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP
);
```

### Project Assignments Table
```sql
CREATE TABLE project_assignments (
    id UUID PRIMARY KEY,
    project_id UUID REFERENCES projects(id),
    person_id UUID REFERENCES people(id),
    role VARCHAR(100),
    allocated_hours_per_week DECIMAL(5,2),
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP
);
```

---

## Quick Start Commands (Next Session)

```bash
# Start backend
cd backend
uvicorn app.main:app --reload --port 8000

# Start frontend (new terminal)
cd frontend
npm run dev
```

Then say: **"Read the next session instructions file and let's start with Save/Load Projects"**

---

## Notes
- All employee names in TeamBuilder are currently hardcoded - will need to pull from People table once Resource Management is implemented
- Current state saves to browser localStorage but not persistent database
- Consider adding user authentication if multiple people will use the tool

---

Good luck! 🚀
