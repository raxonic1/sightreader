import { useCallback } from 'react'
import { useScoreStore } from '@/store/useScoreStore'
import { pdfService } from '@/services/pdf'
import { Score } from '@/types'

export function useFileUpload() {
  const { addScore } = useScoreStore()

  const handleFileUpload = useCallback(
    async (file: File) => {
      if (!file.type.includes('pdf')) {
        throw new Error('Only PDF files are supported')
      }

      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await pdfService.loadPDF(arrayBuffer)
      const pageCount = await pdfService.getPageCount()
      const thumbnailUrl = await pdfService.renderPageToImage(1, 0.3)

      const score: Score = {
        id: `score-${Date.now()}`,
        title: file.name.replace('.pdf', ''),
        createdAt: new Date(),
        modifiedAt: new Date(),
        pdfData: arrayBuffer,
        thumbnailUrl,
        pageCount,
      }

      await addScore(score)
      pdfService.destroy()

      return score
    },
    [addScore],
  )

  return { handleFileUpload }
}
