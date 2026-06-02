import React, { useEffect, useState, useCallback } from 'react'
import { usePracticeStore } from '@/store/usePracticeStore'
import { usePracticeEngine } from '@/hooks/usePracticeEngine'
import { Measure } from '@/types'
import clsx from 'clsx'

interface PracticeModeProps {
  measures: Measure[]
  currentPage: number
  onRender?: (pageNumber: number) => void
}

export const PracticeMode: React.FC<PracticeModeProps> = ({
  measures,
  currentPage,
  onRender,
}) => {
  const {
    session,
    state,
    bpm,
    timeSignatureNumerator,
    timeSignatureDenominator,
    visiblePreviousMeasures,
    totalMeasures,
    initializeSession,
    start,
    pause,
    resume,
    stop,
    restart,
    setBpm,
    setVisiblePreviousMeasures,
  } = usePracticeStore()

  const [tempBpm, setTempBpm] = useState(bpm)
  const [tempTimeSignatureNum, setTempTimeSignatureNum] = useState(
    timeSignatureNumerator,
  )
  const [tempVisibleMeasures, setTempVisibleMeasures] = useState(
    visiblePreviousMeasures,
  )

  usePracticeEngine()

  useEffect(() => {
    if (measures.length > 0 && totalMeasures === 0) {
      initializeSession(
        measures[0].scoreId,
        tempBpm,
        tempTimeSignatureNum,
        4,
        tempVisibleMeasures,
        measures.length,
      )
    }
  }, [measures, totalMeasures, initializeSession, tempBpm, tempTimeSignatureNum, tempVisibleMeasures])

  useEffect(() => {
    if (state.isRunning && !state.isPaused) {
      const targetPage = measures[state.currentMeasureIndex]?.pageNumber
      if (targetPage && targetPage !== currentPage) {
        onRender?.(targetPage)
      }
    }
  }, [state.currentMeasureIndex, state.isRunning, state.isPaused, measures, currentPage, onRender])

  const handleStartClick = useCallback(() => {
    if (!session) return
    if (state.isRunning) {
      if (state.isPaused) {
        resume()
      } else {
        pause()
      }
    } else {
      setBpm(tempBpm)
      setVisiblePreviousMeasures(tempVisibleMeasures)
      start()
    }
  }, [session, state.isRunning, state.isPaused, tempBpm, tempVisibleMeasures, start, pause, resume, setBpm, setVisiblePreviousMeasures])

  const handleStopClick = useCallback(() => {
    stop()
  }, [stop])

  const handleRestartClick = useCallback(() => {
    restart()
  }, [restart])

  if (measures.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <p className="text-gray-600">No measures loaded. Auto-detect or add measures first.</p>
      </div>
    )
  }

  const currentMeasure = measures[state.currentMeasureIndex]
  const progress = totalMeasures > 0 ? (state.currentMeasureIndex / totalMeasures) * 100 : 0
  const hiddenIndices = new Set(
    Array.from({ length: Math.max(0, state.currentMeasureIndex - visiblePreviousMeasures) }, (_, i) => i),
  )

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200">
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-900">
              {state.isRunning ? 'In Progress' : 'Ready'}
            </span>
            <span className="text-sm text-gray-600">
              {state.currentMeasureIndex + 1} / {totalMeasures}
            </span>
          </div>
          <div className="w-full bg-gray-300 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {currentMeasure && (
          <div className="text-center">
            <p className="text-sm font-medium text-gray-900">
              {currentMeasure.label || `Measure ${state.currentMeasureIndex + 1}`}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Page {currentMeasure.pageNumber}
            </p>
          </div>
        )}
      </div>

      <div className="p-4 border-b border-gray-200 space-y-4">
        <div>
          <label className="text-sm font-semibold text-gray-900 block mb-2">
            Tempo (BPM): {tempBpm}
          </label>
          <div className="flex gap-2">
            <input
              type="range"
              min="40"
              max="200"
              value={tempBpm}
              onChange={(e) => setTempBpm(parseInt(e.target.value))}
              disabled={state.isRunning}
              className="flex-1 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
            />
          </div>
          <div className="flex gap-2 mt-2">
            <input
              type="number"
              min="40"
              max="200"
              value={tempBpm}
              onChange={(e) => setTempBpm(Math.max(40, Math.min(200, parseInt(e.target.value) || 40)))}
              disabled={state.isRunning}
              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-900 block mb-2">
            Show Previous: {tempVisibleMeasures}
          </label>
          <input
            type="range"
            min="0"
            max="5"
            value={tempVisibleMeasures}
            onChange={(e) => setTempVisibleMeasures(parseInt(e.target.value))}
            disabled={state.isRunning}
            className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleStartClick}
            disabled={!session}
            className={clsx(
              'px-4 py-2 rounded font-medium transition-colors',
              state.isRunning
                ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                : 'bg-primary hover:bg-blue-700 text-white',
            )}
          >
            {!state.isRunning
              ? 'Start'
              : state.isPaused
                ? 'Resume'
                : 'Pause'}
          </button>
          <button
            onClick={handleStopClick}
            disabled={!state.isRunning}
            className={clsx(
              'px-4 py-2 rounded font-medium transition-colors',
              state.isRunning
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed',
            )}
          >
            Stop
          </button>
          <button
            onClick={handleRestartClick}
            disabled={!state.isRunning}
            className={clsx(
              'col-span-2 px-4 py-2 rounded font-medium transition-colors',
              state.isRunning
                ? 'bg-gray-500 hover:bg-gray-600 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed',
            )}
          >
            Restart
          </button>
        </div>
      </div>

      {hiddenIndices.size > 0 && (
        <div className="p-4 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
          <p className="font-medium">
            {hiddenIndices.size} previous measure{hiddenIndices.size !== 1 ? 's' : ''} hidden
          </p>
        </div>
      )}
    </div>
  )
}
