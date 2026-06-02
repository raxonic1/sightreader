import { useEffect, useRef, useCallback } from 'react'
import { usePracticeStore } from '@/store/usePracticeStore'

export function usePracticeEngine() {
  const state = usePracticeStore((s) => s.state)
  const totalMeasures = usePracticeStore((s) => s.totalMeasures)
  const setCurrentMeasureIndex = usePracticeStore((s) => s.setCurrentMeasureIndex)
  const calculateMeasureTime = usePracticeStore((s) => s.calculateMeasureTime)
  const animationRef = useRef<number | null>(null)

  const advance = useCallback(() => {
    if (state.currentMeasureIndex < totalMeasures - 1) {
      setCurrentMeasureIndex(state.currentMeasureIndex + 1)
    }
  }, [state.currentMeasureIndex, totalMeasures, setCurrentMeasureIndex])

  useEffect(() => {
    if (!state.isRunning || state.isPaused) {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
      return
    }

    const measureTime = calculateMeasureTime()

    const tick = () => {
      const elapsed = Date.now() - state.startTime
      const nextMeasureIndex = Math.floor(elapsed / measureTime)

      if (nextMeasureIndex !== state.currentMeasureIndex) {
        advance()
      }

      if (state.currentMeasureIndex < totalMeasures - 1) {
        animationRef.current = requestAnimationFrame(tick)
      }
    }

    animationRef.current = requestAnimationFrame(tick)

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [state.isRunning, state.isPaused, state.startTime, state.currentMeasureIndex, totalMeasures, advance, calculateMeasureTime])
}
