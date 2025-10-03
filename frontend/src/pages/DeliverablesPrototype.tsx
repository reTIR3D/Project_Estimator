import { useNavigate } from 'react-router-dom';
import DeliverablesMatrixEnhanced from '../components/DeliverablesMatrixEnhanced';

/**
 * STANDALONE TEST PAGE
 *
 * This page lets you test the enhanced deliverables concept with:
 * - Issue state progression (IFD → IFR → IFA → IFB → IFC)
 * - Review cycle multipliers
 * - Client complexity impact
 * - Dependency tracking
 */

export default function DeliverablesPrototype() {
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
          <h1 className="text-2xl font-bold text-gray-900">Deliverables Prototype</h1>
          <p className="text-gray-600 text-sm mt-1">
            Testing enhanced deliverables with issue state progression & review cycles
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Cross-link to Equipment Builder */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg p-4 mb-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg mb-1">💡 Want to see where deliverables come from?</h3>
              <p className="text-sm opacity-90">
                Check out the Equipment Builder prototype to see how equipment automatically generates these deliverables
              </p>
            </div>
            <button
              onClick={() => navigate('/equipment-prototype')}
              className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 font-bold shadow-md whitespace-nowrap"
            >
              ⚙️ Try Equipment Builder →
            </button>
          </div>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">How to use this prototype</h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Select/deselect deliverables to see total hours update</li>
                  <li>Change <strong>Client Complexity Profile</strong> to see how TYPE_A/B/C affects review cycles</li>
                  <li>Click <strong>"Configure Issue States"</strong> on selected deliverables to customize their progression</li>
                  <li>Adjust review cycles with the slider to see rework impact</li>
                  <li>Notice how prerequisites trigger warnings when dependencies aren't met</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Key Concepts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">📋</span>
              <h3 className="font-bold text-gray-900">Issue States</h3>
            </div>
            <p className="text-sm text-gray-600">
              Engineering documents progress through multiple states (IFD → IFR → IFA → IFB → IFC).
              Each state adds effort. A P&ID going through 4 states is ~3x more work than IFC-only.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🔄</span>
              <h3 className="font-bold text-gray-900">Review Cycles</h3>
            </div>
            <p className="text-sm text-gray-600">
              Each review cycle adds rework (15-30%). Type A clients require more reviews.
              3 cycles at 25% rework adds 75% more hours to the base effort.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🔗</span>
              <h3 className="font-bold text-gray-900">Dependencies</h3>
            </div>
            <p className="text-sm text-gray-600">
              Some deliverables require others to reach certain states first.
              Equipment specs need P&IDs at IFA. System prevents estimation errors.
            </p>
          </div>
        </div>

        {/* The Prototype Component */}
        <DeliverablesMatrixEnhanced />

        {/* Technical Details */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Technical Implementation Notes</h3>

          <div className="space-y-4 text-sm text-gray-700">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Calculation Formula:</h4>
              <div className="bg-gray-50 p-3 rounded font-mono text-xs">
                Total Hours = (Base Hours × Σ Issue State Multipliers) + (Review Cycles × Rework Factor × Client Multiplier) + Regulatory Overlay
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Example:</h4>
              <div className="bg-gray-50 p-3 rounded text-xs space-y-1">
                <div><strong>P&IDs - Type B Client:</strong></div>
                <div>• Base Hours: 120h</div>
                <div>• Issue States: IFD (0.4×) + IFR (0.6×) + IFA (0.7×) + IFB (0.9×) + IFC (1.0×) = 120h × 3.6 = 432h</div>
                <div>• Review Cycles: 3 cycles × 0.30 rework = 432h × 0.90 = +389h</div>
                <div>• HAZOP Overlay: 120h × 0.25 = +30h</div>
                <div><strong>Total: 851h</strong> (vs 120h base)</div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Integration with Current System:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Client Profile (TYPE_A/B/C) already exists in your system</li>
                <li>Can add issue_states and review_cycles to deliverable templates</li>
                <li>Complexity factors already track regulatory requirements</li>
                <li>Work types (DISCRETE/CAMPAIGN/PHASE_GATE) map to different state progressions</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Benefits Over Current Approach:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Accuracy:</strong> Captures why pharma/FDA projects cost 2-3× more (more states & reviews)</li>
                <li><strong>Transparency:</strong> Users see exactly where hours come from, not just a multiplier</li>
                <li><strong>Flexibility:</strong> Fast-track projects can skip states, rigorous clients add more</li>
                <li><strong>Learning:</strong> Track actual vs estimated to improve future estimates</li>
                <li><strong>Scheduling:</strong> Dependencies enable critical path analysis</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Feedback Section */}
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-green-900 mb-2">Provide Feedback</h3>
          <p className="text-sm text-green-800 mb-4">
            This is a prototype to test the concept. Try different scenarios and see if this approach
            would improve your estimation accuracy. Consider:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-green-800">
            <li>Does the issue state progression match how you actually work?</li>
            <li>Are the review cycle multipliers realistic for your client types?</li>
            <li>Would the dependency tracking prevent estimation errors?</li>
            <li>Is the UI intuitive enough for your team to use?</li>
            <li>What's missing or could be improved?</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
