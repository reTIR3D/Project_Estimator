"""
Quick test script to demonstrate cost calculation with sample deliverables.
"""

import sys
sys.path.insert(0, 'backend')

from app.services.cost.cost_calculator import CostCalculator

# Initialize the calculator (uses default rates)
calculator = CostCalculator()

# Sample deliverables - mixing different types
sample_deliverables = [
    {"name": "P&IDs", "hours": 200},  # Drawing type
    {"name": "Equipment Datasheets", "hours": 120},  # Document type
    {"name": "Foundation Design Calculations", "hours": 80},  # Calculation type
]

print("=" * 80)
print("COST CALCULATION DEMO - Sample Deliverables")
print("=" * 80)
print()

# Calculate individual deliverables to show role breakdown
print("INDIVIDUAL DELIVERABLE BREAKDOWNS:")
print("-" * 80)

for deliverable in sample_deliverables:
    breakdown = calculator.calculate_deliverable_cost(
        deliverable["name"],
        deliverable["hours"]
    )

    print(f"\n{breakdown.deliverable_name}")
    print(f"  Total Hours: {breakdown.total_hours}")
    print(f"  Total Cost:  ${breakdown.total_cost:,.2f}")
    print(f"  Role Breakdown:")

    for role, hours in breakdown.role_hours.items():
        cost = breakdown.role_costs[role]
        print(f"    - {role:25s}: {hours:3d} hrs × rate = ${cost:8,.2f}")

print()
print("=" * 80)
print("PROJECT TOTALS:")
print("-" * 80)

# Calculate project-level aggregation
result = calculator.calculate_project_cost(sample_deliverables)

summary = result['summary']
print(f"\nTotal Hours:       {summary['total_hours']:,}")
print(f"Total Cost:        ${summary['total_cost']:,.2f}")
print(f"Deliverable Count: {summary['deliverable_count']}")
print(f"Avg $/hr:          ${summary['average_cost_per_hour']:.2f}")

print("\n\nAGGREGATED BY ROLE:")
print("-" * 80)

for role_summary in result['by_role']:
    print(f"{role_summary['role']:25s}: {role_summary['hours']:4d} hrs "
          f"({role_summary['percentage']:5.1f}%) = ${role_summary['cost']:10,.2f}")

print()
print("=" * 80)
print("HOURLY RATES USED:")
print("-" * 80)

rates = calculator.get_rates()
for role, rate in sorted(rates.items()):
    print(f"  {role:25s}: ${rate:6.2f}/hr")

print()
print("=" * 80)