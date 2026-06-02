import React, { useEffect, useState, useCallback, useRef } from 'react'
import { usePDFRendering } from '@/hooks/usePDFRendering'
import { useMeasureDetection } from '@/hooks/useMeasureDetection'
import { Score, Measure } from '@/types'
import { pdfService } from '@/services/pdf'
import clsx from 'clsx'

interface PDFViewerProps {
  score: Score | null
  measures: Measure[]
  onDetectMeasures?: (measures: Measure[]) => void
  zoom: number
  onZoomChange?: (zoom: number) => void
}

export const PDFViewer: React.FC<PDFViewerProps> = ({
  score,
  measures,
  onDetectMeasures,
  zoom,
  onZoomChange,
}) => {
  const { canvasRef, renderPage, pdfLoadedRef } = usePDFRendering(score)
  const { detectMeasures } = useMeasureDetection()
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [isAutoDetecting, setIsAutoDetecting] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!score || !pdfLoadedRef.current) return

    const init = async () => {
      const pageCount = await pdfService.getPageCount()
      setTotalPages(pageCount)
      await renderPage(1, zoom)
    }

    init()
  }, [score, renderPage, zoom])

  useEffect(() => {
    if (pdfLoadedRef.current) {
      renderPage(currentPage, zoom)
    }
  }, [currentPage, renderPage, zoom])

  const handleAutoDetect = useCallback(async () => {
    if (!canvasRef.current || !score) return

    setIsAutoDetecting(true)
    try {
      const detectedMeasures: Measure[] = []
      const pageCount = await pdfService.getPageCount()

      for (let page = 1; page <= pageCount; page++) {
        await renderPage(page, 1.5)
        const detected = detectMeasures(canvasRef.current, page)

        detected.forEach((m, index) => {
          detectedMeasures.push({
            id: `measure-${score.id}-${page}-${index}`,
            scoreId: score.id,
            pageNumber: page,
            x: m.x,
            y: m.y,
            width: m.width,
            height: m.height,
            order: detectedMeasures.length,
            label: `Measure ${detectedMeasures.length + 1}`,
          })
        })
      }

      onDetectMeasures?.(detectedMeasures)
      await renderPage(currentPage, zoom)
    } finally {
      setIsAutoDetecting(false)
    }
  }, [score, renderPage, detectMeasures, onDetectMeasures, currentPage, zoom])

  const handleZoom = (delta: number) => {
    const newZoom = Math.max(0.5, Math.min(zoom + delta, 3))
    onZoomChange?.(newZoom)
  }

  if (!score) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100">
        <p className="text-gray-600">No score loaded</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-gray-100">
      <div className="bg-white border-b border-gray-200 p-4 flex items-center gap-4">
        <button
          onClick={() => handleZoom(-0.2)}
          className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300 text-sm font-medium"
        >
          −
        </button>
        <span className="text-sm font-medium text-gray-700 min-w-[4rem]">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => handleZoom(0.2)}
          className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300 text-sm font-medium"
        >
          +
        </button>

        <div className="flex-1" />

        <button
          onClick={handleAutoDetect}
          disabled={isAutoDetecting}
          className={clsx(
            'px-4 py-2 rounded font-medium text-sm transition-colors',
            isAutoDetecting
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-secondary text-white hover:bg-green-600',
          )}
        >
          {isAutoDetecting ? 'Detecting...' : 'Auto-Detect Measures'}
        </button>
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-auto flex items-start justify-center p-4"
      >
        <canvas
          ref={canvasRef}
          className="pdf-page rounded shadow-lg"
        />
      </div>

      <div className="bg-white border-t border-gray-200 p-4 flex items-center justify-center gap-4">
        <button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 text-sm font-medium"
        >
          Previous
        </button>
        <span className="text-sm font-medium text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 text-sm font-medium"
        >
          Next
        </button>
      </div>
    </div>
  )
}
