import { useCallback, useRef, useEffect } from 'react'
import { pdfService } from '@/services/pdf'
import { Score } from '@/types'

export function usePDFRendering(score: Score | null) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pdfLoadedRef = useRef(false)

  useEffect(() => {
    if (!score) return

    const loadPDF = async () => {
      try {
        await pdfService.loadPDF(score.pdfData)
        pdfLoadedRef.current = true
      } catch (error) {
        console.error('Failed to load PDF:', error)
      }
    }

    loadPDF()

    return () => {
      if (pdfLoadedRef.current) {
        pdfService.destroy()
        pdfLoadedRef.current = false
      }
    }
  }, [score])

  const renderPage = useCallback(
    async (pageNum: number, scale: number = 1.5) => {
      if (!canvasRef.current || !pdfLoadedRef.current) return

      try {
        await pdfService.renderPage(pageNum, canvasRef.current, scale)
      } catch (error) {
        console.error('Failed to render page:', error)
      }
    },
    [],
  )

  return { canvasRef, renderPage, pdfLoadedRef }
}
