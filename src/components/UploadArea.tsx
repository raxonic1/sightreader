import React, { useCallback } from 'react'
import { useFileUpload } from '@/hooks/useFileUpload'
import clsx from 'clsx'

interface UploadAreaProps {
  onUploadSuccess?: () => void
}

export const UploadArea: React.FC<UploadAreaProps> = ({ onUploadSuccess }) => {
  const { handleFileUpload } = useFileUpload()
  const [isDragActive, setIsDragActive] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleDrag = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragActive(e.type === 'dragenter' || e.type === 'dragover')
    },
    [],
  )

  const processFile = useCallback(
    async (file: File) => {
      setIsLoading(true)
      setError(null)
      try {
        await handleFileUpload(file)
        onUploadSuccess?.()
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setIsLoading(false)
      }
    },
    [handleFileUpload, onUploadSuccess],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragActive(false)

      const files = e.dataTransfer.files
      if (files && files.length > 0) {
        processFile(files[0])
      }
    },
    [processFile],
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.currentTarget.files
      if (files && files.length > 0) {
        processFile(files[0])
      }
    },
    [processFile],
  )

  return (
    <div
      className={clsx(
        'w-full max-w-2xl mx-auto p-8 rounded-lg border-2 border-dashed transition-colors',
        isDragActive
          ? 'border-primary bg-blue-50'
          : 'border-gray-300 bg-gray-50 hover:border-primary hover:bg-blue-50',
      )}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <div className="text-center">
        <svg
          className="w-16 h-16 mx-auto mb-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
          />
        </svg>

        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Upload Piano Sheet Music
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Drag and drop your PDF file here, or click to browse
        </p>

        <label className="inline-block">
          <input
            type="file"
            accept=".pdf"
            onChange={handleChange}
            disabled={isLoading}
            className="hidden"
          />
          <span
            className={clsx(
              'inline-block px-6 py-2 rounded-lg font-medium transition-colors',
              isLoading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-primary text-white hover:bg-blue-700 cursor-pointer',
            )}
          >
            {isLoading ? 'Uploading...' : 'Select PDF'}
          </span>
        </label>

        {error && (
          <p className="mt-4 text-sm text-red-600 font-medium">{error}</p>
        )}
      </div>
    </div>
  )
}
