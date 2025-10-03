import { useNavigate } from 'react-router-dom';
import EquipmentListBuilder from '../components/EquipmentListBuilder';

/**
 * EQUIPMENT LIST BUILDER - STANDALONE TEST PAGE
 *
 * This page demonstrates the equipment-driven deliverable generation concept:
 * - Equipment templates that auto-generate deliverables
 * - Cross-discipline deliverable creation
 * - Size and complexity multipliers
 * - The foundation of the two-axis estimation model
 */

export default function EquipmentPrototype() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-800 mb-2 inline-block text-sm"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Equipment List Builder Prototype</h1>
          <p className="text-gray-600 text-sm mt-1">
            Equipment-driven deliverable generation - The foundation of accurate estimating
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">The Equipment-Driven Approach</h3>
              <div className="mt-2 text-sm text-green-700">
                <p className="mb-2">
                  This prototype demonstrates why equipment lists are the <strong>foundation of accurate estimation</strong>:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Equipment = Source of Truth:</strong> A vessel doesn't just need Process work - it needs Civil, Mechanical, Electrical, Safety</li>
                  <li><strong>Templates Enforce Completeness:</strong> Can't forget foundation design or relief valve sizing</li>
                  <li><strong>Automatic Discipline Coordination:</strong> One equipment tag generates work across all disciplines</li>
                  <li><strong>Size & Complexity Multipliers:</strong> Large/complex equipment = proportionally more work</li>
                  <li><strong>Change Management Built-In:</strong> Add/delete equipment = instant impact analysis</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Two-Axis Model Explanation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">📋</span>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Axis 1: Equipment (WHAT)</h3>
                <p className="text-sm text-gray-600">Drives deliverable generation</p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="bg-blue-50 p-3 rounded">
                <div className="font-semibold text-blue-900 mb-1">Equipment Templates Define Work</div>
                <div className="text-xs">
                  • Vessel → 7 deliverables (Process, Mechanical, Civil, E/I, Safety)<br/>
                  • Pump → 6 deliverables (Process, Mechanical, E/I, Civil)<br/>
                  • Heat Exchanger → 6 deliverables (Process, Mechanical, Civil, E/I)
                </div>
              </div>
              <div className="bg-blue-50 p-3 rounded">
                <div className="font-semibold text-blue-900 mb-1">Size & Complexity Multiply Effort</div>
                <div className="text-xs">
                  • Large vessel = 1.3× base hours<br/>
                  • Complex pump = 1.3× base hours<br/>
                  • Simple tank = 0.8× base hours
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">🎯</span>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Axis 2: Project Type (HOW)</h3>
                <p className="text-sm text-gray-600">Determines execution strategy</p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="bg-purple-50 p-3 rounded">
                <div className="font-semibold text-purple-900 mb-1">Phase-Gate Projects</div>
                <div className="text-xs">
                  • Full state progression: IFD → IFR → IFA → IFB → IFC<br/>
                  • 2-3 review cycles per deliverable<br/>
                  • Highest accuracy, longest duration
                </div>
              </div>
              <div className="bg-purple-50 p-3 rounded">
                <div className="font-semibold text-purple-900 mb-1">Fast-Track Projects</div>
                <div className="text-xs">
                  • Compressed states: IFR → IFC<br/>
                  • 1-2 review cycles, parallel execution<br/>
                  • 35% faster, higher risk
                </div>
              </div>
              <div className="bg-purple-50 p-3 rounded">
                <div className="font-semibold text-purple-900 mb-1">Campaign Projects</div>
                <div className="text-xs">
                  • Direct to IFC (pre-approved designs)<br/>
                  • Minimal reviews, focus on interfaces<br/>
                  • 80% reduction from baseline
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How to Use */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-bold text-blue-900 mb-3">How to Use This Prototype</h3>
          <div className="grid grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <div className="font-semibold mb-1">Adding Equipment:</div>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Click "Quick Add" buttons for common equipment types</li>
                <li>Or click "+ Add Equipment" for full form</li>
                <li>Enter equipment tag (V-101, P-205A, etc.)</li>
                <li>Select size (small/medium/large)</li>
                <li>Select complexity (simple/standard/complex)</li>
              </ul>
            </div>
            <div>
              <div className="font-semibold mb-1">Viewing Results:</div>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Watch deliverable count and hours update in real-time</li>
                <li>Click "Show Deliverables" to see what each equipment generates</li>
                <li>Notice how deliverables span multiple disciplines</li>
                <li>See size/complexity multipliers in action</li>
                <li>Delete equipment to see cascading impact</li>
              </ul>
            </div>
          </div>
        </div>

        {/* The Component */}
        <EquipmentListBuilder />

        {/* Integration Concept */}
        <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">The Complete Two-Axis Model</h3>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
            <div className="text-center mb-4">
              <div className="text-2xl font-bold text-gray-900 mb-2">Formula for Accurate Estimation</div>
              <div className="text-lg text-blue-700 font-mono">
                Equipment List × Project Type × Complexity Factors = Project Estimate
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="font-bold text-blue-900 mb-1">Equipment List</div>
                <div className="text-xs text-gray-700">
                  Generates deliverables<br/>
                  across disciplines
                </div>
              </div>
              <div className="text-center">
                <div className="font-bold text-purple-900 mb-1">Project Type</div>
                <div className="text-xs text-gray-700">
                  Sets issue state path<br/>
                  & review cycles
                </div>
              </div>
              <div className="text-center">
                <div className="font-bold text-green-900 mb-1">Complexity</div>
                <div className="text-xs text-gray-700">
                  Client type, regulatory,<br/>
                  site conditions
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-gray-900 mb-2">Example Workflow:</h4>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="font-bold text-blue-600">1.</span>
                  <div>
                    <span className="font-semibold">Equipment Entry:</span> Add V-101 (vessel), P-101A/B (pumps), E-101 (heat exchanger)
                    <div className="text-xs text-gray-600 mt-1">→ System generates 24 deliverables across 6 disciplines</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-purple-600">2.</span>
                  <div>
                    <span className="font-semibold">Project Type:</span> Select "Phase-Gate" execution
                    <div className="text-xs text-gray-600 mt-1">→ Each deliverable goes through IFD → IFR → IFA → IFB → IFC (5 states)</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-green-600">3.</span>
                  <div>
                    <span className="font-semibold">Complexity:</span> Client is TYPE_A (heavy oversight)
                    <div className="text-xs text-gray-600 mt-1">→ Review cycles multiply by 1.5× (3 cycles becomes 4.5)</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-orange-600">4.</span>
                  <div>
                    <span className="font-semibold">Result:</span> 420 base hours × 3.6 (states) × 1.7 (reviews) = 2,570 hours
                    <div className="text-xs text-gray-600 mt-1">→ With FDA overlay adding validation docs: +45 deliverables = 3,200 hours</div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-2">Why This Approach Works:</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-green-50 border border-green-200 rounded p-3">
                  <div className="font-semibold text-green-900 mb-1">✅ Completeness</div>
                  <div className="text-xs text-gray-700">
                    Equipment templates ensure you don't forget Civil foundation for that new pump
                  </div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded p-3">
                  <div className="font-semibold text-green-900 mb-1">✅ Accuracy</div>
                  <div className="text-xs text-gray-700">
                    Based on actual work (equipment) not abstract "project size"
                  </div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded p-3">
                  <div className="font-semibold text-green-900 mb-1">✅ Transparency</div>
                  <div className="text-xs text-gray-700">
                    Engineers see exactly what drives hours - no black box
                  </div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded p-3">
                  <div className="font-semibold text-green-900 mb-1">✅ Change Management</div>
                  <div className="text-xs text-gray-700">
                    Add P-109 → instantly see 6 new deliverables, 42 hours added
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mt-6 bg-gradient-to-r from-orange-50 to-pink-50 border border-orange-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-2">🚀 Integration with Existing System</h3>
          <p className="text-sm text-gray-700 mb-4">
            This Equipment Builder would integrate with the Deliverables Prototype you tested earlier:
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-semibold text-orange-900 mb-2">Equipment Builder (This Page):</div>
              <ul className="list-disc list-inside space-y-1 text-xs text-gray-700">
                <li>Add V-101, P-101A, E-101</li>
                <li>Auto-generates 24 deliverables</li>
                <li>Base hours calculated (420h)</li>
              </ul>
            </div>
            <div>
              <div className="font-semibold text-pink-900 mb-2">Deliverables Configurator:</div>
              <ul className="list-disc list-inside space-y-1 text-xs text-gray-700">
                <li>Select project type (Phase-Gate)</li>
                <li>Configure issue states (IFD → IFC)</li>
                <li>Set review cycles (3 cycles)</li>
                <li>Final hours: 2,570h</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 text-center">
            <button
              onClick={() => navigate('/deliverables-prototype')}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:from-orange-600 hover:to-pink-600 font-bold shadow-lg"
            >
              → Try the Deliverables Configurator
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
