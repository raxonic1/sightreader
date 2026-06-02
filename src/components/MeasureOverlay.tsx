import React, { useState, useCallback } from 'react'
import { Measure } from '@/types'
import clsx from 'clsx'

interface MeasureOverlayProps {
  measures: Measure[]
  currentPage: number
  activeMeasureIndex?: number
  hiddenMeasureIndices?: Set<number>
  onMeasureMove?: (measureId: string, x: number, y: number) => void
  onMeasureResize?: (
    measureId: string,
    x: number,
    y: number,
    width: number,
    height: number,
  ) => void
  editable?: boolean
}

interface DragState {
  measureId: string
  startX: number
  startY: number
  offsetX: number
  offsetY: number
}

interface ResizeState {
  measureId: string
  startX: number
  startY: number
  startWidth: number
  startHeight: number
  handle: 'se' | 'sw' | 'ne' | 'nw'
}

export const MeasureOverlay: React.FC<MeasureOverlayProps> = ({
  measures,
  currentPage,
  activeMeasureIndex,
  hiddenMeasureIndices = new Set(),
  onMeasureMove,
  onMeasureResize,
  editable = false,
}) => {
  const [dragState, setDragState] = useState<DragState | null>(null)
  const [resizeState, setResizeState] = useState<ResizeState | null>(null)

  const pageMeasures = measures.filter((m) => m.pageNumber === currentPage)

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, measureId: string) => {
      if (!editable) return
      e.stopPropagation()

      const measure = measures.find((m) => m.id === measureId)
      if (!measure) return

      setDragState({
        measureId,
        startX: e.clientX,
        startY: e.clientY,
        offsetX: measure.x,
        offsetY: measure.y,
      })
    },
    [measures, editable],
  )

  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent, measureId: string, handle: ResizeState['handle']) => {
      if (!editable) return
      e.stopPropagation()

      const measure = measures.find((m) => m.id === measureId)
      if (!measure) return

      setResizeState({
        measureId,
        startX: e.clientX,
        startY: e.clientY,
        startWidth: measure.width,
        startHeight: measure.height,
        handle,
      })
    },
    [measures, editable],
  )

  React.useEffect(() => {
    if (!dragState) return

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragState.startX
      const deltaY = e.clientY - dragState.startY

      onMeasureMove?.(
        dragState.measureId,
        dragState.offsetX + deltaX,
        dragState.offsetY + deltaY,
      )
    }

    const handleMouseUp = () => {
      setDragState(null)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [dragState, onMeasureMove])

  React.useEffect(() => {
    if (!resizeState) return

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - resizeState.startX
      const deltaY = e.clientY - resizeState.startY

      const measure = measures.find((m) => m.id === resizeState.measureId)
      if (!measure) return

      let newX = measure.x
      let newY = measure.y
      let newWidth = resizeState.startWidth
      let newHeight = resizeState.startHeight

      if (resizeState.handle.includes('e')) {
        newWidth += deltaX
      } else if (resizeState.handle.includes('w')) {
        newX += deltaX
        newWidth -= deltaX
      }

      if (resizeState.handle.includes('s')) {
        newHeight += deltaY
      } else if (resizeState.handle.includes('n')) {
        newY += deltaY
        newHeight -= deltaY
      }

      onMeasureResize?.(
        resizeState.measureId,
        newX,
        newY,
        Math.max(20, newWidth),
        Math.max(20, newHeight),
      )
    }

    const handleMouseUp = () => {
      setResizeState(null)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [resizeState, measures, onMeasureResize])

  return (
    <div className="absolute inset-0 pointer-events-none">
      {pageMeasures.map((measure, index) => {
        const isHidden = hiddenMeasureIndices.has(index)
        const isActive = activeMeasureIndex === index

        return (
          <div
            key={measure.id}
            className={clsx(
              'absolute pointer-events-auto transition-all',
              editable && 'cursor-move',
              isHidden && 'measure-overlay hidden',
              isActive && 'measure-overlay active',
              !isHidden && !isActive && 'measure-overlay',
            )}
            style={{
              left: `${measure.x}px`,
              top: `${measure.y}px`,
              width: `${measure.width}px`,
              height: `${measure.height}px`,
            }}
            onMouseDown={(e) => handleMouseDown(e, measure.id)}
          >
            {editable && (
              <>
                <div
                  className="resize-handle absolute top-0 right-0 -translate-y-1/2 translate-x-1/2"
                  onMouseDown={(e) => handleResizeMouseDown(e, measure.id, 'ne')}
                />
                <div
                  className="resize-handle absolute bottom-0 right-0 translate-y-1/2 translate-x-1/2"
                  onMouseDown={(e) => handleResizeMouseDown(e, measure.id, 'se')}
                />
                <div
                  className="resize-handle absolute top-0 left-0 -translate-y-1/2 -translate-x-1/2"
                  onMouseDown={(e) => handleResizeMouseDown(e, measure.id, 'nw')}
                />
                <div
                  className="resize-handle absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2"
                  onMouseDown={(e) => handleResizeMouseDown(e, measure.id, 'sw')}
                />
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}
