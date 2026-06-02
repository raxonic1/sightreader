declare module 'pdfjs-dist' {
  export interface PDFDocument {
    numPages: number
    getPage(pageNumber: number): Promise<PDFPage>
    destroy(): void
  }

  export interface PDFPage {
    getViewport(options: { scale: number }): PDFViewport
    render(options: PDFRenderParams): PDFRenderTask
    getTextContent(): Promise<PDFTextContent>
  }

  export interface PDFViewport {
    width: number
    height: number
    scale: number
  }

  export interface PDFRenderParams {
    canvasContext: CanvasRenderingContext2D
    viewport: PDFViewport
  }

  export interface PDFRenderTask {
    promise: Promise<void>
  }

  export interface PDFTextContent {
    items: PDFTextItem[]
  }

  export interface PDFTextItem {
    str: string
    dir: string
    width: number
    height: number
    transform: number[]
    fontName: string
    hasEOL: boolean
  }

  export const GlobalWorkerOptions: {
    workerSrc: string
  }

  export function getDocument(src: ArrayBuffer | string): PDFDocumentLoadingTask

  export interface PDFDocumentLoadingTask {
    promise: Promise<PDFDocument>
  }
}
