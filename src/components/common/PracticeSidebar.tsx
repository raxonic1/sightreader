interface PracticeSidebarProps {
  bpm: number
  timeSignature: number
  visiblePreviousMeasures: number
  hideDelay: number
  onBPMChange: (bpm: number) => void
  onTimeSignatureChange: (numerator: number) => void
  onVisiblePreviousChange: (count: number) => void
  onHideDelayChange: (delay: number) => void
}

export default function PracticeSidebar({
  bpm,
  timeSignature,
  visiblePreviousMeasures,
  hideDelay,
  onBPMChange,
  onTimeSignatureChange,
  onVisiblePreviousChange,
  onHideDelayChange,
}: PracticeSidebarProps) {
  return (
    <div className="w-64 bg-gray-900 border-l border-gray-700 overflow-y-auto p-4">
      <h3 className="text-lg font-bold text-white mb-6">Settings</h3>

      <div className="space-y-6">
        <div>
          <label className="text-sm text-gray-300 block mb-2">Tempo (BPM)</label>
          <input
            type="range"
            min="40"
            max="200"
            step="5"
            value={bpm}
            onChange={(e) => onBPMChange(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="text-center text-white font-mono font-bold mt-2">
            {bpm} BPM
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-300 block mb-2">Time Signature</label>
          <select
            value={timeSignature}
            onChange={(e) => onTimeSignatureChange(parseInt(e.target.value))}
            className="w-full bg-gray-800 text-white border border-gray-700 rounded px-3 py-2"
          >
            <option value={2}>2/4</option>
            <option value={3}>3/4</option>
            <option value={4}>4/4</option>
            <option value={6}>6/8</option>
          </select>
        </div>

        <div>
          <label className="text-sm text-gray-300 block mb-2">
            Visible Previous Measures: {visiblePreviousMeasures}
          </label>
          <input
            type="range"
            min="0"
            max="5"
            step="1"
            value={visiblePreviousMeasures}
            onChange={(e) => onVisiblePreviousChange(parseInt(e.target.value))}
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-2">
            Keep last {visiblePreviousMeasures} measure(s) visible while practicing
          </p>
        </div>

        <div>
          <label className="text-sm text-gray-300 block mb-2">Hide Delay (ms)</label>
          <input
            type="range"
            min="0"
            max="2000"
            step="100"
            value={hideDelay}
            onChange={(e) => onHideDelayChange(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="text-center text-white font-mono font-bold mt-2">
            {hideDelay}ms
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Delay before hiding passed measures
          </p>
        </div>

        <div className="pt-4 border-t border-gray-700">
          <p className="text-xs text-gray-400">
            💡 Tip: Use "Visible Previous Measures" to practice sight-reading with context from previous measures.
          </p>
        </div>
      </div>
    </div>
  )
}
