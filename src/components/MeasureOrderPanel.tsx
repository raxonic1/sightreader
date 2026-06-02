import React, { useCallback } from 'react'
import { useScoreStore } from '@/store/useScoreStore'
import { Measure } from '@/types'
import clsx from 'clsx'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface MeasureOrderPanelProps {
  measures: Measure[]
  onReorder?: (measures: Measure[]) => void
}

interface SortableMeasureItemProps {
  measure: Measure
  index: number
  onDelete: (id: string) => void
}

const SortableMeasureItem: React.FC<SortableMeasureItemProps> = ({
  measure,
  index,
  onDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: measure.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        'p-3 bg-white border border-gray-200 rounded cursor-move hover:bg-gray-50 transition-colors',
        isDragging && 'shadow-lg',
      )}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="text-sm font-semibold text-gray-900">
            {measure.label || `Measure ${index + 1}`}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Page {measure.pageNumber}
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(measure.id)
          }}
          className="px-2 py-1 text-red-600 hover:bg-red-50 rounded text-xs font-medium transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  )
}

export const MeasureOrderPanel: React.FC<MeasureOrderPanelProps> = ({
  measures,
  onReorder,
}) => {
  const { deleteMeasure, reorderMeasures } = useScoreStore()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      distance: 8,
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragEnd = useCallback(
    async (event: any) => {
      const { active, over } = event

      if (over && active.id !== over.id) {
        const oldIndex = measures.findIndex((m) => m.id === active.id)
        const newIndex = measures.findIndex((m) => m.id === over.id)

        const newMeasures = arrayMove(measures, oldIndex, newIndex)
        await reorderMeasures(newMeasures)
        onReorder?.(newMeasures)
      }
    },
    [measures, reorderMeasures, onReorder],
  )

  const handleDelete = useCallback(
    async (id: string) => {
      if (confirm('Delete this measure?')) {
        await deleteMeasure(id)
      }
    },
    [deleteMeasure],
  )

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Measure Order
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Drag to reorder ({measures.length} total)
        </p>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="flex-1 overflow-y-auto p-4">
          {measures.length === 0 ? (
            <div className="text-center text-gray-500 text-sm py-8">
              No measures detected. Use auto-detect or add manually.
            </div>
          ) : (
            <SortableContext
              items={measures.map((m) => m.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {measures.map((measure, index) => (
                  <SortableMeasureItem
                    key={measure.id}
                    measure={measure}
                    index={index}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </SortableContext>
          )}
        </div>
      </DndContext>
    </div>
  )
}
