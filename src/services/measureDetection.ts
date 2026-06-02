import { DetectedMeasure } from '@/types'

interface CanvasImageData {
  data: Uint8ClampedArray
  width: number
  height: number
}

class MeasureDetectionEngine {
  detectMeasures(
    canvas: HTMLCanvasElement,
    pageNumber: number,
  ): DetectedMeasure[] {
    const context = canvas.getContext('2d')
    if (!context) return []

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    const measures: DetectedMeasure[] = []

    const gray = this.grayscale(imageData)
    const edges = this.sobelEdgeDetection(gray, canvas.width, canvas.height)
    const verticalLines = this.detectVerticalLines(edges, canvas.width, canvas.height)
    const barlinePairs = this.groupBarlines(verticalLines, canvas.width)
    const staffSystems = this.detectStaffSystems(edges, canvas.width, canvas.height)

    for (let i = 0; i < barlinePairs.length - 1; i++) {
      const leftBarline = barlinePairs[i]
      const rightBarline = barlinePairs[i + 1]

      for (const staff of staffSystems) {
        measures.push({
          pageNumber,
          x: leftBarline,
          y: staff.top,
          width: rightBarline - leftBarline,
          height: staff.height,
          confidence: 0.7,
        })
      }
    }

    return measures
  }

  private grayscale(imageData: CanvasImageData): number[][] {
    const { data, width, height } = imageData
    const gray: number[][] = []

    for (let i = 0; i < height; i++) {
      gray[i] = []
      for (let j = 0; j < width; j++) {
        const index = (i * width + j) * 4
        const r = data[index]
        const g = data[index + 1]
        const b = data[index + 2]
        gray[i][j] = 0.299 * r + 0.587 * g + 0.114 * b
      }
    }

    return gray
  }

  private sobelEdgeDetection(
    gray: number[][],
    width: number,
    height: number,
  ): number[][] {
    const edges: number[][] = Array(height)
      .fill(null)
      .map(() => Array(width).fill(0))

    const sobelX = [
      [-1, 0, 1],
      [-2, 0, 2],
      [-1, 0, 1],
    ]

    const sobelY = [
      [-1, -2, -1],
      [0, 0, 0],
      [1, 2, 1],
    ]

    for (let i = 1; i < height - 1; i++) {
      for (let j = 1; j < width - 1; j++) {
        let gx = 0
        let gy = 0

        for (let ki = 0; ki < 3; ki++) {
          for (let kj = 0; kj < 3; kj++) {
            const val = gray[i - 1 + ki][j - 1 + kj]
            gx += val * sobelX[ki][kj]
            gy += val * sobelY[ki][kj]
          }
        }

        edges[i][j] = Math.sqrt(gx * gx + gy * gy)
      }
    }

    return edges
  }

  private detectVerticalLines(
    edges: number[][],
    width: number,
    height: number,
  ): number[] {
    const threshold = 100
    const verticalLines: number[] = []

    for (let x = 0; x < width; x++) {
      let edgeCount = 0
      for (let y = 0; y < height; y++) {
        if (edges[y] && edges[y][x] > threshold) {
          edgeCount++
        }
      }

      if (edgeCount > height * 0.3) {
        verticalLines.push(x)
      }
    }

    return verticalLines
  }

  private groupBarlines(lines: number[], width: number): number[] {
    if (lines.length === 0) return [0, width]

    const grouped: number[] = []
    let currentGroup: number[] = [lines[0]]

    for (let i = 1; i < lines.length; i++) {
      if (lines[i] - lines[i - 1] < 5) {
        currentGroup.push(lines[i])
      } else {
        const avg = Math.round(
          currentGroup.reduce((a, b) => a + b) / currentGroup.length,
        )
        grouped.push(avg)
        currentGroup = [lines[i]]
      }
    }

    if (currentGroup.length > 0) {
      const avg = Math.round(
        currentGroup.reduce((a, b) => a + b) / currentGroup.length,
      )
      grouped.push(avg)
    }

    if (grouped[0] !== 0) grouped.unshift(0)
    if (grouped[grouped.length - 1] !== width) grouped.push(width)

    return grouped
  }

  private detectStaffSystems(
    edges: number[][],
    width: number,
    height: number,
  ): Array<{ top: number; bottom: number; height: number }> {
    const threshold = 50
    const staffSystems: Array<{ top: number; bottom: number; height: number }> = []
    const lineHeights: number[] = []

    for (let y = 0; y < height; y++) {
      let edgeCount = 0
      for (let x = 0; x < width; x++) {
        if (edges[y] && edges[y][x] > threshold) {
          edgeCount++
        }
      }
      if (edgeCount > width * 0.3) {
        lineHeights.push(y)
      }
    }

    if (lineHeights.length > 0) {
      let staffTop = lineHeights[0]
      let lastLineY = lineHeights[0]

      for (let i = 1; i < lineHeights.length; i++) {
        if (lineHeights[i] - lastLineY > 30) {
          staffSystems.push({
            top: staffTop,
            bottom: lastLineY,
            height: lastLineY - staffTop + 20,
          })
          staffTop = lineHeights[i]
        }
        lastLineY = lineHeights[i]
      }

      if (lastLineY !== staffTop) {
        staffSystems.push({
          top: staffTop,
          bottom: lastLineY,
          height: lastLineY - staffTop + 20,
        })
      }
    }

    if (staffSystems.length === 0) {
      const systemHeight = height / 4
      for (let i = 0; i < 4; i++) {
        staffSystems.push({
          top: i * systemHeight,
          bottom: (i + 1) * systemHeight,
          height: systemHeight,
        })
      }
    }

    return staffSystems
  }
}

export const measureDetectionEngine = new MeasureDetectionEngine()
