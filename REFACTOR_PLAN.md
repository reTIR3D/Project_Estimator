# UI Refactor Implementation Plan

## ✅ Completed
- [x] Updated EstimationStepper: 9 steps → 5 steps
- [x] Created PlanningHub component (Resources + Team + Costs tabs)
- [x] Created WorkOrganization component (WBS + RACI tabs, collapsible)

## 🔄 In Progress: ProjectEstimation.tsx Updates

### Current Structure (9 Steps)
```
1. Setup
2. Team
3. Equipment (conditional)
4. Deliverables
5. Resources
6. WBS
7. RACI
8. Costs
9. Summary
```

### New Structure (5 Steps)
```
1. Setup (includes optional equipment)
2. Deliverables
3. Planning (tabs: Resources, Team, Costs)
4. Organization (tabs: WBS, RACI - optional/collapsible)
5. Summary
```

## 📋 Required Changes in ProjectEstimation.tsx

### Step 1: Setup
**Keep as-is**, but add equipment mode toggle/builder inline

**Navigation:**
- Back: N/A (first step)
- Next: → Deliverables

### Step 2: Deliverables
**Keep as-is** (already working well)

**Navigation:**
- Back: ← Setup
- Next: → Planning

### Step 3: Planning (NEW - Replace team/resources/costs)
**Replace these 3 separate steps with PlanningHub component:**

```tsx
{currentStep === 'planning' && (
  <>
    <PlanningHub
      deliverables={deliverables}
      totalHours={deliverablesTotal}
      durationWeeks={project?.duration_weeks || 12}
      projectTeam={projectTeam}
      onTeamChange={setProjectTeam}
      selectedCompanyId={selectedCompanyId}
      selectedRateSheetId={selectedRateSheetId}
      costData={costData}
      costLoading={costLoading}
      onCalculateCosts={handleCalculateCosts}
    />

    <div className="flex justify-between mt-6">
      <button onClick={() => setCurrentStep('deliverables')}>
        ← Back to Deliverables
      </button>
      <div className="flex gap-2">
        <button onClick={() => setCurrentStep('summary')}>
          Skip to Summary →
        </button>
        <button onClick={() => setCurrentStep('organization')}>
          Next: Work Organization →
        </button>
      </div>
    </div>
  </>
)}
```

### Step 4: Organization (NEW - Replace WBS/RACI)
**Replace 2 separate steps with WorkOrganization component:**

```tsx
{currentStep === 'organization' && (
  <>
    <WorkOrganization
      deliverables={deliverables}
      projectTeam={projectTeam}
    />

    <div className="flex justify-between mt-6">
      <button onClick={() => setCurrentStep('planning')}>
        ← Back to Planning
      </button>
      <button onClick={() => setCurrentStep('summary')}>
        Next: Summary →
      </button>
    </div>
  </>
)}
```

### Step 5: Summary
**Keep as-is**

**Navigation:**
- Back: ← Organization

## 🗑️ Steps to Remove

Delete these entire step blocks from ProjectEstimation.tsx:

1. **Line ~961**: `{currentStep === 'team' && ( ... )}`
2. **Line ~988**: `{currentStep === 'equipment' && ( ... )}`
   *(Move equipment builder into setup step inline)*
3. **Line ~1529**: `{currentStep === 'resources' && ( ... )}`
   *(Now in PlanningHub)*
4. **Line ~1558**: `{currentStep === 'wbs' && ( ... )}`
   *(Now in WorkOrganization)*
5. **Line ~1583**: `{currentStep === 'raci' && ( ... )}`
   *(Now in WorkOrganization)*
6. **Line ~1611**: `{currentStep === 'costs' && ( ... )}`
   *(Now in PlanningHub)*

## 🔧 Helper Function Updates

### Update allSteps array (Line ~616)
**Before:**
```tsx
const allSteps = ['setup', 'team', ...(useEquipmentMode ? ['equipment'] : []), 'deliverables', 'wbs', 'raci', 'costs', 'summary'];
```

**After:**
```tsx
const allSteps: EstimationStep[] = ['setup', 'deliverables', 'planning', 'organization', 'summary'];
```

### Update completedSteps logic
Remove conditional equipment step logic - it's now always in setup

## 📦 Component Props Needed

### PlanningHub needs:
- ✅ deliverables
- ✅ totalHours (deliverablesTotal)
- ✅ durationWeeks
- ✅ projectTeam
- ✅ onTeamChange
- ✅ selectedCompanyId
- ✅ selectedRateSheetId
- ✅ costData
- ✅ costLoading
- ✅ onCalculateCosts

### WorkOrganization needs:
- ✅ deliverables
- ✅ projectTeam

All props already exist in ProjectEstimation state!

## 🎯 Implementation Strategy

Given ProjectEstimation.tsx is ~1700 lines, I recommend:

**Option A: Surgical Replacement (Safest)**
1. Find each old step block
2. Comment it out (don't delete yet)
3. Add new step block below it
4. Test
5. Remove commented code once working

**Option B: New File (Cleanest)**
1. Create ProjectEstimationRefactored.tsx
2. Copy structure but use new steps
3. Test thoroughly
4. Rename old → backup
5. Rename new → ProjectEstimation.tsx

**Option C: Line-by-Line (Most Control)**
1. I provide exact line numbers and replacements
2. You review each change
3. Apply incrementally
4. Test after each major change

## 🚦 Next Steps

**Your call:** Which option do you prefer?

- **Option A**: Safest, keeps history, easy rollback
- **Option B**: Cleanest, fresh start, less baggage
- **Option C**: Most control, but time-consuming

**My recommendation:** Option A - comment out old, add new, test, clean up.

Want me to proceed with Option A?
