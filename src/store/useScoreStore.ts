import { create } from 'zustand'
import { Score, Measure } from '@/types'
import { db } from '@/services/database'

interface ScoreStoreState {
  scores: Score[]
  currentScore: Score | null
  measures: Measure[]
  isLoading: boolean
  error: string | null

  loadScores: () => Promise<void>
  loadScore: (id: string) => Promise<void>
  addScore: (score: Score) => Promise<void>
  deleteScore: (id: string) => Promise<void>
  updateScore: (score: Score) => Promise<void>
  loadMeasures: (scoreId: string) => Promise<void>
  addMeasure: (measure: Measure) => Promise<void>
  updateMeasure: (measure: Measure) => Promise<void>
  deleteMeasure: (id: string) => Promise<void>
  reorderMeasures: (measures: Measure[]) => Promise<void>
  clearError: () => void
  setCurrentScore: (score: Score | null) => void
}

export const useScoreStore = create<ScoreStoreState>((set, get) => ({
  scores: [],
  currentScore: null,
  measures: [],
  isLoading: false,
  error: null,

  loadScores: async () => {
    set({ isLoading: true, error: null })
    try {
      const scores = await db.getAllScores()
      set({ scores, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  loadScore: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const score = await db.getScore(id)
      if (score) {
        set({ currentScore: score, isLoading: false })
        await get().loadMeasures(id)
      }
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  addScore: async (score: Score) => {
    try {
      await db.addScore(score)
      await get().loadScores()
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  deleteScore: async (id: string) => {
    try {
      await db.deleteScore(id)
      await db.deleteMeasuresByScoreId(id)
      await get().loadScores()
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  updateScore: async (score: Score) => {
    try {
      await db.updateScore(score)
      set({ currentScore: score })
      await get().loadScores()
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  loadMeasures: async (scoreId: string) => {
    try {
      const measures = await db.getMeasuresByScoreId(scoreId)
      set({ measures })
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  addMeasure: async (measure: Measure) => {
    try {
      await db.addMeasure(measure)
      await get().loadMeasures(measure.scoreId)
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  updateMeasure: async (measure: Measure) => {
    try {
      await db.updateMeasure(measure)
      const { currentScore } = get()
      if (currentScore) {
        await get().loadMeasures(currentScore.id)
      }
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  deleteMeasure: async (id: string) => {
    try {
      await db.deleteMeasure(id)
      const { currentScore } = get()
      if (currentScore) {
        await get().loadMeasures(currentScore.id)
      }
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  reorderMeasures: async (measures: Measure[]) => {
    try {
      const updatedMeasures = measures.map((m, index) => ({
        ...m,
        order: index,
      }))
      for (const measure of updatedMeasures) {
        await db.updateMeasure(measure)
      }
      set({ measures: updatedMeasures })
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  clearError: () => set({ error: null }),
  setCurrentScore: (score) => set({ currentScore: score }),
}))
