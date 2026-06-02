import { useCallback } from 'react'
import { measureDetectionEngine } from '@/services/measureDetection'
import { DetectedMeasure } from '@/types'

export function useMeasureDetection() {
  const detectMeasures = useCallback(
    (canvas: HTMLCanvasElement, pageNumber: number): DetectedMeasure[] => {
      return measureDetectionEngine.detectMeasures(canvas, pageNumber)
    },
    [],
  )

  return { detectMeasures }
}
