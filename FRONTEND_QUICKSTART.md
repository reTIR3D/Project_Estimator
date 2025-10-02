# Frontend Quick Build Request

Create a functional React frontend for the Engineering Estimation System backend.

## Tech Stack
- React with TypeScript
- Vite for build tool (faster than Create React App)
- Tailwind CSS for styling (rapid prototyping)
- Axios for API calls
- React Query for state management
- Recharts for quick charts

## Priority Pages (Build in this order)

### 1. Project Dashboard (/)
- List all projects in cards/table
- Quick stats (total hours, cost, confidence)
- Create new project button
- Status indicators (draft/approved/complete)

### 2. Project Estimation Page (/project/:id)
- Project size selector (small/medium/large)  
- Complexity factors checkboxes with % impact shown
- Client profile dropdown
- Resource availability sliders
- Real-time calculation display
- Big numbers for: Total Hours, Duration, Cost, Confidence

### 3. Risk Analysis Page (/project/:id/risk)
- Monte Carlo simulation trigger button
- P10/P50/P90 scenarios display
- Risk tornado chart
- Early warning indicators

### 4. Resource View (/project/:id/resources)
- Team allocation table
- Resource loading chart
- Availability conflicts highlighted

### 5. Quick Export (/project/:id/export)
- Export buttons (Excel, PDF, JSON)
- Preview area

## Component Structure
frontend/
├── src/
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── ProjectEstimation.tsx
│   │   ├── RiskAnalysis.tsx
│   │   └── Resources.tsx
│   ├── components/
│   │   ├── ComplexityFactors.tsx
│   │   ├── EstimationSummary.tsx
│   │   ├── RiskChart.tsx
│   │   └── ResourceChart.tsx
│   ├── services/
│   │   └── api.ts
│   └── App.tsx

## Key UI Components Needed

### 1. Complexity Factor Selector
```jsx
<div className="grid grid-cols-2 gap-4">
  <label className="flex items-center p-4 border rounded hover:bg-gray-50">
    <input type="checkbox" name="multidiscipline" />
    <span className="ml-3">Multi-discipline</span>
    <span className="ml-auto text-red-500">+20%</span>
  </label>
  // ... more factors
</div>
2. Real-time Calculation Display
jsx<div className="grid grid-cols-4 gap-6">
  <div className="bg-white p-6 rounded-lg shadow">
    <div className="text-3xl font-bold">{totalHours}</div>
    <div className="text-gray-500">Total Hours</div>
  </div>
  // ... duration, cost, confidence
</div>
3. API Integration
typescriptconst api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
});

// Quick test of estimation endpoint
async function calculateEstimate(projectId: string, data: EstimationInput) {
  const response = await api.post(`/projects/${projectId}/estimate`, data);
  return response.data;
}
Make It Work First, Pretty Later

Use Tailwind's default styles
Don't worry about perfect responsive design yet
Focus on functionality over aesthetics
Use simple tables instead of complex grids
Add loading states but skip animations

Sample Test Flow

Create new project
Select "Medium" size
Check "Fast-track" and "Brownfield"
Select "Type A" client
See hours jump from 1,200 → 1,860 → 2,604
Run risk analysis
View P90 scenario
Export to Excel

Build this basic frontend first, we'll enhance the UI after core functionality works.

## Claude Code Commands for Full Stack
```bash
# Command 1: Setup both backend and frontend
"Read PROJECT_REQUIREMENTS.md and FRONTEND_QUICKSTART.md. Create both the backend 
FastAPI application and a React frontend that connects to it. Start with the core 
estimation features working end-to-end."

# Command 2: If backend exists, add frontend
"The backend API is running on port 8000. Create a React frontend following 
FRONTEND_QUICKSTART.md that connects to these endpoints and allows testing 
all estimation features visually."

# Command 3: Create test-first frontend
"Build a simple React frontend that can:
1. Create a project with size/complexity/client selections
2. Show real-time estimation calculations
3. Display risk analysis results
4. Focus on functionality over design"