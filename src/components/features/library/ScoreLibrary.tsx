import { useEffect } from 'react'
import { Score } from '@/types'
import PDFImporter from './PDFImporter'
import { motion } from 'framer-motion'

interface ScoreLibraryProps {
  scores: Score[]
  onSelectScore: (score: Score) => void
  onLoadScores: () => Promise<void>
  onUpload: {
    handleDrop: (e: React.DragEvent) => void
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    isLoading: boolean
    error: string | null
  }
}

export default function ScoreLibrary({
  scores,
  onSelectScore,
  onLoadScores,
  onUpload,
}: ScoreLibraryProps) {
  useEffect(() => {
    onLoadScores()
  }, [])

  if (scores.length === 0) {
    return <PDFImporter onUpload={onUpload} />
  }

  return (
    <div className="w-full h-full flex flex-col bg-secondary">
      <div className="p-6 bg-gradient-to-r from-primary to-accent">
        <h1 className="text-4xl font-bold text-white mb-2">SightReader</h1>
        <p className="text-gray-100">Piano Sight-Reading Practice</p>
      </div>

      <div className="p-6 bg-gray-900 border-b border-gray-700">
        <h2 className="text-2xl font-bold">My Scores</h2>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {scores.map((score, index) => (
            <motion.div
              key={score.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onSelectScore(score)}
              className="bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg hover:shadow-primary/50 transition transform hover:scale-105"
            >
              <div className="h-48 bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-6xl">🎵</span>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-white truncate">{score.title}</h3>
                <p className="text-sm text-gray-400">
                  {new Date(score.createdAt).toLocaleDateString()}
                </p>
                {score.lastPracticed && (
                  <p className="text-xs text-gray-500 mt-1">
                    Last practiced: {new Date(score.lastPracticed).toLocaleDateString()}
                  </p>
                )}
              </div>
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: scores.length * 0.1 }}
            className="h-64 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition"
            onDragOver={(e) => e.preventDefault()}
            onDrop={onUpload.handleDrop}
          >
            <label className="text-center cursor-pointer">
              <div className="text-4xl mb-2">+</div>
              <p className="text-gray-300 font-semibold">Add Score</p>
              <input
                type="file"
                accept=".pdf"
                onChange={onUpload.handleInputChange}
                className="hidden"
              />
            </label>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
