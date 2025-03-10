/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import BackButton from "@/components/back-button"
import { Trash2 } from "lucide-react"

interface QuizResult {
  score: number
  totalQuestions: number
  difficulty: string
  date: string
}

export default function QuizHistoryPage() {
  const router = useRouter()
  const [results, setResults] = useState<QuizResult[]>([])
  const [isEmpty, setIsEmpty] = useState(false)

  useEffect(() => {
    try {
      const savedResults = localStorage.getItem("quizResults")
      if (savedResults) {
        const parsedResults = JSON.parse(savedResults) as QuizResult[]
        // Sort by date, newest first
        parsedResults.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        setResults(parsedResults)
        setIsEmpty(parsedResults.length === 0)
      } else {
        setIsEmpty(true)
      }
    } catch (e) {
      console.error("Failed to load quiz results:", e)
      setIsEmpty(true)
    }
  }, [])

  const handleClearHistory = () => {
    if (confirm("Apakah Anda yakin ingin menghapus semua riwayat kuis?")) {
      localStorage.removeItem("quizResults")
      setResults([])
      setIsEmpty(true)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return format(date, "d MMMM yyyy, HH:mm", { locale: id })
    } catch (e) {
      return "Tanggal tidak valid"
    }
  }

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "Mudah"
      case "medium":
        return "Sedang"
      case "hard":
        return "Sulit"
      default:
        return difficulty
    }
  }

  return (
    <div className="mx-auto bg-white min-h-screen p-4">
      <div className="flex items-center justify-between mb-6">
        <BackButton />
        <h1 className="text-xl font-bold text-blue-800 text-center flex-1">Riwayat Kuis</h1>
      </div>

      {isEmpty ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">Belum ada riwayat kuis.</p>
          <button
            onClick={() => router.push("/hafalan/quiz")}
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Mulai Kuis Baru
          </button>
        </div>
      ) : (
        <main className="md:w-4/5 mx-auto">
          <div className="flex justify-end mb-4">
            <button onClick={handleClearHistory} className="flex items-center text-sm text-red-600 hover:text-red-800">
              <Trash2 className="w-4 h-4 mr-1" />
              Hapus Riwayat
            </button>
          </div>

          <div className="space-y-4">
            {results.map((result, index) => (
              <div key={index} className="bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium">
                      Skor: {result.score}/{result.totalQuestions} (
                      {Math.round((result.score / result.totalQuestions) * 100)}%)
                    </p>
                    <p className="text-sm text-gray-600">Level: {getDifficultyLabel(result.difficulty)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">{formatDate(result.date)}</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${Math.round((result.score / result.totalQuestions) * 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push("/hafalan/quiz")}
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Mulai Kuis Baru
            </button>
          </div>
        </main>
      )}
    </div>
  )
}

