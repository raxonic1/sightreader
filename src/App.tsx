import React, { useState, useCallback } from 'react'
import { useScoreStore } from '@/store/useScoreStore'
import { UploadArea } from '@/components/UploadArea'
import { PDFViewer } from '@/components/PDFViewer'
import { MeasureOrderPanel } from '@/components/MeasureOrderPanel'
import { PracticeMode } from '@/components/PracticeMode'
import { MeasureOverlay } from '@/components/MeasureOverlay'
import { Measure } from '@/types'

type ViewMode = 'library' | 'editor' | 'practice'

export default function App() {
  const { scores, currentScore, measures, loadScores, loadScore, updateMeasure, setCurrentScore } =
    useScoreStore()
  const [viewMode, setViewMode] = useState<ViewMode>('library')
  const [zoom, setZoom] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)

  React.useEffect(() => {
    loadScores()
  }, [])

  const handleScoreSelect = useCallback(
    async (scoreId: string) => {
      await loadScore(scoreId)
      setViewMode('editor')
      setCurrentPage(1)
      setZoom(1)
    },
    [loadScore],
  )

  const handleDetectMeasures = useCallback(
    async (detectedMeasures: Measure[]) => {
      if (!currentScore) return
      for (const measure of detectedMeasures) {
        await updateMeasure(measure)
      }
    },
    [currentScore, updateMeasure],
  )

  const handleMeasureMove = useCallback(
    async (measureId: string, x: number, y: number) => {
      const measure = measures.find((m) => m.id === measureId)
      if (measure) {
        await updateMeasure({ ...measure, x, y })
      }
    },
    [measures, updateMeasure],
  )

  const handleMeasureResize = useCallback(
    async (measureId: string, x: number, y: number, width: number, height: number) => {
      const measure = measures.find((m) => m.id === measureId)
      if (measure) {
        await updateMeasure({ ...measure, x, y, width, height })
      }
    },
    [measures, updateMeasure],
  )

  // Library View
  if (viewMode === 'library' && !currentScore) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 p-6">
          <h1 className="text-3xl font-bold text-gray-900">SightReader</h1>
          <p className="text-gray-600 mt-2">Piano Sight-Reading Practice</p>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="p-8">
            {scores.length === 0 ? (
              <UploadArea onUploadSuccess={() => loadScores()} />
            ) : (
              <div>
                <div className="mb-8">
                  <UploadArea onUploadSuccess={() => loadScores()} />
                </div>

                <div className="mt-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Your Scores
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {scores.map((score) => (
                      <div
                        key={score.id}
                        onClick={() => handleScoreSelect(score.id)}
                        className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
                      >
                        {score.thumbnailUrl && (
                          <img
                            src={score.thumbnailUrl}
                            alt={score.title}
                            className="w-full h-48 object-cover bg-gray-200"
                          />
                        )}
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {score.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {score.pageCount} page{score.pageCount !== 1 ? 's' : ''}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(score.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Editor View
  if (viewMode === 'editor' && currentScore) {
    return (
      <div className="flex h-screen bg-gray-100">
        <div className="flex-1 flex flex-col">
          <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {currentScore.title}
              </h2>
              <p className="text-sm text-gray-600 mt-1">Edit Measures</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('practice')}
                className="px-4 py-2 bg-secondary text-white rounded font-medium hover:bg-green-600 transition-colors"
              >
                Start Practice
              </button>
              <button
                onClick={() => {
                  setViewMode('library')
                  setCurrentScore(null)
                }}
                className="px-4 py-2 bg-gray-300 text-gray-900 rounded font-medium hover:bg-gray-400 transition-colors"
              >
                Back
              </button>
            </div>
          </div>

          <div className="flex-1 flex">
            <div className="flex-1 relative">
              <PDFViewer
                score={currentScore}
                measures={measures}
                onDetectMeasures={handleDetectMeasures}
                zoom={zoom}
                onZoomChange={setZoom}
              />
              <MeasureOverlay
                measures={measures}
                currentPage={currentPage}
                onMeasureMove={handleMeasureMove}
                onMeasureResize={handleMeasureResize}
                editable
              />
            </div>

            <MeasureOrderPanel measures={measures} />
          </div>
        </div>
      </div>
    )
  }

  // Practice View
  if (viewMode === 'practice' && currentScore) {
    return (
      <div className="flex h-screen bg-gray-100">
        <div className="flex-1 flex flex-col">
          <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {currentScore.title}
              </h2>
              <p className="text-sm text-gray-600 mt-1">Sight-Reading Practice</p>
            </div>
            <button
              onClick={() => setViewMode('editor')}
              className="px-4 py-2 bg-gray-300 text-gray-900 rounded font-medium hover:bg-gray-400 transition-colors"
            >
              Back to Editor
            </button>
          </div>

          <div className="flex-1 flex">
            <div className="flex-1 relative">
              <PDFViewer
                score={currentScore}
                measures={measures}
                zoom={zoom}
                onZoomChange={setZoom}
              />
              <MeasureOverlay
                measures={measures}
                currentPage={currentPage}
              />
            </div>

            <PracticeMode
              measures={measures}
              currentPage={currentPage}
              onRender={setCurrentPage}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <p className="text-gray-600">Loading...</p>
    </div>
  )
}
