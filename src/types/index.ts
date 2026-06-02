export interface Score {
  id: string
  title: string
  createdAt: Date
  modifiedAt: Date
  pdfData: ArrayBuffer
  thumbnailUrl?: string
  pageCount: number
}

export interface Measure {
  id: string
  scoreId: string
  pageNumber: number
  x: number
  y: number
  width: number
  height: number
  order: number
  label?: string
}

export interface PracticeSession {
  id: string
  scoreId: string
  bpm: number
  timeSignatureNumerator: number
  timeSignatureDenominator: number
  startedAt: Date
  duration: number
  visiblePreviousMeasures: number
}

export interface PracticeState {
  isRunning: boolean
  isPaused: boolean
  currentMeasureIndex: number
  startTime: number
  totalMeasureTime: number
}

export interface PDFPageRenderOptions {
  scale: number
  page: number
}

export interface DetectedMeasure {
  pageNumber: number
  x: number
  y: number
  width: number
  height: number
  confidence: number
}

export interface MeasureDetectionResult {
  measures: DetectedMeasure[]
  pageCount: number
}

export interface LibraryItem {
  scoreId: string
  title: string
  createdAt: Date
  lastPracticed?: Date
  thumbnailUrl?: string
  measureCount: number
}
