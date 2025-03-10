"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Award, Home, RotateCcw } from "lucide-react"
import BackButton from "@/components/back-button"

export default function QuizResultsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [score, setScore] = useState(0)
  const [total, setTotal] = useState(0)
  const [percentage, setPercentage] = useState(0)

  useEffect(() => {
    const scoreParam = searchParams.get("score")
    const totalParam = searchParams.get("total")

    if (scoreParam && totalParam) {
      const scoreValue = Number.parseInt(scoreParam)
      const totalValue = Number.parseInt(totalParam)
      setScore(scoreValue)
      setTotal(totalValue)
      setPercentage(Math.round((scoreValue / totalValue) * 100))
    }
  }, [searchParams])

  const handleRetry = () => {
    router.push("/hafalan/quiz")
  }

  const handleHome = () => {
    router.push("/")
  }

  const getFeedbackMessage = () => {
    if (percentage >= 90) return "Luar biasa! Anda memiliki hafalan yang sangat baik."
    if (percentage >= 70) return "Bagus! Anda memiliki pemahaman yang baik."
    if (percentage >= 50) return "Cukup baik. Teruslah berlatih untuk meningkatkan hafalan Anda."
    return "Teruslah belajar dan berlatih untuk meningkatkan hafalan Anda."
  }

  return (
    <div className="mx-auto bg-white min-h-screen p-4">
      <div className="flex items-center justify-between mb-6">
        <BackButton />
        <h1 className="text-xl font-bold text-blue-800 text-center flex-1">Hasil Kuis</h1>
        <div className="w-6"></div> {/* Spacer for alignment */}
      </div>

      <div className="text-center py-8 md:w-4/5 mx-auto">
        <Award className="w-20 h-20 text-blue-600 mx-auto mb-6" />
        <h2 className="text-3xl font-bold mb-2">
          {score} / {total}
        </h2>
        <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
          <div className="bg-blue-600 h-4 rounded-full" style={{ width: `${percentage}%` }}></div>
        </div>
        <p className="text-lg font-medium mb-6">{percentage}%</p>
        <p className="text-gray-600 mb-8">{getFeedbackMessage()}</p>

        <div className="flex justify-center space-x-4">
          <button
            onClick={handleRetry}
            className="flex items-center bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Coba Lagi
          </button>
          <button
            onClick={handleHome}
            className="flex items-center bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
          >
            <Home className="w-4 h-4 mr-2" />
            Kembali ke Beranda
          </button>
        </div>
      </div>
    </div>
  )
}

