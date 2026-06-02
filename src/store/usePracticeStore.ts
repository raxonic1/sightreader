import { create } from 'zustand'
import { PracticeSession, PracticeState } from '@/types'

interface PracticeStoreState {
  session: PracticeSession | null
  state: PracticeState
  bpm: number
  timeSignatureNumerator: number
  timeSignatureDenominator: number
  visiblePreviousMeasures: number
  totalMeasures: number

  initializeSession: (
    scoreId: string,
    bpm: number,
    timeSignatureNumerator: number,
    timeSignatureDenominator: number,
    visiblePreviousMeasures: number,
    totalMeasures: number,
  ) => void
  start: () => void
  pause: () => void
  resume: () => void
  stop: () => void
  restart: () => void
  setCurrentMeasureIndex: (index: number) => void
  setBpm: (bpm: number) => void
  setVisiblePreviousMeasures: (count: number) => void
  calculateMeasureTime: () => number
}

export const usePracticeStore = create<PracticeStoreState>((set, get) => ({
  session: null,
  state: {
    isRunning: false,
    isPaused: false,
    currentMeasureIndex: 0,
    startTime: 0,
    totalMeasureTime: 0,
  },
  bpm: 60,
  timeSignatureNumerator: 4,
  timeSignatureDenominator: 4,
  visiblePreviousMeasures: 1,
  totalMeasures: 0,

  initializeSession: (
    scoreId,
    bpm,
    timeSignatureNumerator,
    timeSignatureDenominator,
    visiblePreviousMeasures,
    totalMeasures,
  ) => {
    const session: PracticeSession = {
      id: `session-${Date.now()}`,
      scoreId,
      bpm,
      timeSignatureNumerator,
      timeSignatureDenominator,
      startedAt: new Date(),
      duration: 0,
      visiblePreviousMeasures,
    }

    const measureTime = get().calculateMeasureTime()

    set({
      session,
      bpm,
      timeSignatureNumerator,
      timeSignatureDenominator,
      visiblePreviousMeasures,
      totalMeasures,
      state: {
        isRunning: false,
        isPaused: false,
        currentMeasureIndex: 0,
        startTime: 0,
        totalMeasureTime: measureTime,
      },
    })
  },

  start: () => {
    set((state) => ({
      state: {
        ...state.state,
        isRunning: true,
        isPaused: false,
        startTime: Date.now(),
      },
    }))
  },

  pause: () => {
    set((state) => ({
      state: {
        ...state.state,
        isPaused: true,
      },
    }))
  },

  resume: () => {
    set((state) => ({
      state: {
        ...state.state,
        isPaused: false,
        startTime: Date.now() - state.state.totalMeasureTime * state.state.currentMeasureIndex,
      },
    }))
  },

  stop: () => {
    set((state) => {
      if (state.session) {
        const duration = Date.now() - state.session.startedAt.getTime()
        return {
          session: {
            ...state.session,
            duration,
          },
          state: {
            isRunning: false,
            isPaused: false,
            currentMeasureIndex: 0,
            startTime: 0,
            totalMeasureTime: state.state.totalMeasureTime,
          },
        }
      }
      return state
    })
  },

  restart: () => {
    set((state) => ({
      state: {
        ...state.state,
        currentMeasureIndex: 0,
        startTime: Date.now(),
      },
    }))
  },

  setCurrentMeasureIndex: (index: number) => {
    set((state) => ({
      state: {
        ...state.state,
        currentMeasureIndex: Math.max(0, Math.min(index, state.totalMeasures - 1)),
      },
    }))
  },

  setBpm: (bpm: number) => {
    set({ bpm })
  },

  setVisiblePreviousMeasures: (count: number) => {
    set({ visiblePreviousMeasures: count })
  },

  calculateMeasureTime: () => {
    const { bpm, timeSignatureNumerator, timeSignatureDenominator } = get()
    const beatDuration = (60 * 1000) / bpm
    const measuresBeats = (timeSignatureNumerator * 4) / timeSignatureDenominator
    return beatDuration * measuresBeats
  },
}))
