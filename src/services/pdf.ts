import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

export class PDFService {
  private pdfDoc: pdfjsLib.PDFDocument | null = null
  private scale = 1.5

  async loadPDF(arrayBuffer: ArrayBuffer): Promise<pdfjsLib.PDFDocument> {
    const loadingTask = pdfjsLib.getDocument(arrayBuffer)
    this.pdfDoc = await loadingTask.promise
    return this.pdfDoc
  }

  async getPageCount(): Promise<number> {
    if (!this.pdfDoc) throw new Error('PDF not loaded')
    return this.pdfDoc.numPages
  }

  async renderPage(
    pageNum: number,
    canvas: HTMLCanvasElement,
    scale: number = this.scale,
  ): Promise<void> {
    if (!this.pdfDoc) throw new Error('PDF not loaded')

    const page = await this.pdfDoc.getPage(pageNum)
    const viewport = page.getViewport({ scale })

    canvas.width = viewport.width
    canvas.height = viewport.height

    const context = canvas.getContext('2d')
    if (!context) throw new Error('Failed to get canvas context')

    const renderTask = page.render({
      canvasContext: context,
      viewport: viewport,
    })

    await renderTask.promise
  }

  async renderPageToImage(
    pageNum: number,
    scale: number = 0.5,
  ): Promise<string> {
    if (!this.pdfDoc) throw new Error('PDF not loaded')

    const canvas = document.createElement('canvas')
    await this.renderPage(pageNum, canvas, scale)
    return canvas.toDataURL('image/png')
  }

  async getPageDimensions(
    pageNum: number,
    scale: number = this.scale,
  ): Promise<{ width: number; height: number }> {
    if (!this.pdfDoc) throw new Error('PDF not loaded')

    const page = await this.pdfDoc.getPage(pageNum)
    const viewport = page.getViewport({ scale })

    return {
      width: viewport.width,
      height: viewport.height,
    }
  }

  setScale(scale: number): void {
    this.scale = Math.max(0.5, Math.min(scale, 3))
  }

  getScale(): number {
    return this.scale
  }

  destroy(): void {
    if (this.pdfDoc) {
      this.pdfDoc.destroy()
      this.pdfDoc = null
    }
  }
}

export const pdfService = new PDFService()
