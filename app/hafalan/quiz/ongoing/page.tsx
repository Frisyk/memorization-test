/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import BackButton from "@/components/back-button"
import AudioPlayer from "@/components/audio-player"
import QuizOption from "@/components/quiz-option"
import QuizFeedback from "@/components/quiz-feedback"
import { fetchRandomSurahs, generateQuizData } from "@/services/quran-api"
import { ChevronRight } from "lucide-react"

interface Option {
  id: string
  surahNumber: number
  surahName: string
  verseNumber: number
}

interface QuizQuestion {
  question: {
    id: string
    surahNumber: number
    surahName: string
    verseNumber: number
    arabic: string
    translation: string
    audioUrl: string
  }
  options: Option[]
}

export default function OngoingQuizPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quiz, setQuiz] = useState<QuizQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [score, setScore] = useState(0)
  const [audioError, setAudioError] = useState<string | null>(null)
  const [config, setConfig] = useState<{ reciterId: string; difficulty: "easy" | "medium" | "hard" }>({
    reciterId: "05",
    difficulty: "medium",
  })

  // Load quiz configuration from localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem("quizConfig")
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig)
        setConfig(parsedConfig)
      } catch (e) {
        console.error("Failed to parse quiz config:", e)
      }
    }
  }, [])

  // Load quiz data
  useEffect(() => {
    loadQuiz()
  }, [config])

  async function loadQuiz() {
    try {
      setLoading(true)
      setError(null)
      setAudioError(null)

      // Determine number of surahs based on difficulty
      const surahCount = config.difficulty === "easy" ? 3 : config.difficulty === "medium" ? 5 : 8

      // Fetch random surahs from the API
      const surahs = await fetchRandomSurahs(surahCount)

      // Generate quiz questions with options
      const questionCount = config.difficulty === "easy" ? 5 : config.difficulty === "medium" ? 8 : 12
      const optionsCount = config.difficulty === "easy" ? 3 : config.difficulty === "medium" ? 4 : 5

      // Use the non-async version of generateQuizData
      const quizData = generateQuizData(surahs, questionCount, optionsCount, config.reciterId)
      setQuiz(quizData)

      setCurrentQuestionIndex(0)
      setSelectedAnswer(null)
      setShowFeedback(false)
      setScore(0)
      setLoading(false)
    } catch (err) {
      setError("Failed to load quiz data. Please try again later.")
      setLoading(false)
      console.error("Error loading quiz:", err)
    }
  }

  const handleAnswerSelect = (optionId: string) => {
    setSelectedAnswer(optionId)
    const correctId = quiz[currentQuestionIndex].question.id
    const isAnswerCorrect = optionId === correctId
    setIsCorrect(isAnswerCorrect)
    setShowFeedback(true)

    if (isAnswerCorrect) {
      setScore((prev) => prev + 1)
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
      setSelectedAnswer(null)
      setShowFeedback(false)
    } else {
      // Save results to localStorage
      const results = {
        score,
        totalQuestions: quiz.length,
        difficulty: config.difficulty,
        date: new Date().toISOString(),
      }

      try {
        const savedResults = localStorage.getItem("quizResults")
        const resultsArray = savedResults ? JSON.parse(savedResults) : []
        resultsArray.push(results)
        localStorage.setItem("quizResults", JSON.stringify(resultsArray))
      } catch (e) {
        console.error("Failed to save quiz results:", e)
      }

      // Navigate to results page
      router.push(`/hafalan/results?score=${score}&total=${quiz.length}`)
    }
  }

  const handleAudioError = (errorMessage: string) => {
    setAudioError(errorMessage)
  }

  if (loading) {
    return (
      <div className="mx-auto bg-white min-h-screen p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Memuat kuis...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto bg-white min-h-screen p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">⚠️</div>
          <p className="text-lg text-red-600 mb-4">{error}</p>
          <button onClick={() => loadQuiz()} className="bg-blue-600 text-white py-2 px-4 rounded-md">
            Coba Lagi
          </button>
        </div>
      </div>
    )
  }

  const currentQuestion = quiz[currentQuestionIndex]

  return (
    <div className=" mx-auto bg-white min-h-screen p-4">
      <div className="flex items-center justify-between mb-6">
        <BackButton />
        <h1 className="text-xl font-bold text-blue-800 text-center flex-1">Tebak Surat dan Ayat</h1>
        <div className="w-6"></div> {/* Spacer for alignment */}
      </div>

      <div className="mb-4 text-center">
        <p className="text-sm text-gray-600">
          Soal {currentQuestionIndex + 1} dari {quiz.length}
        </p>
        <p className="text-lg font-medium">Dengarkan audio dan pilih surah dan ayat yang benar</p>
      </div>

      <main className="md:w-4/5 mx-auto">
      
      <AudioPlayer audioUrl={currentQuestion.question.audioUrl} onError={handleAudioError} />

      {showFeedback && (
        <QuizFeedback
          isCorrect={isCorrect}
          correctAnswer={{
            surahName: currentQuestion.question.surahName,
            verseNumber: currentQuestion.question.verseNumber,
            arabic: currentQuestion.question.arabic,
            translation: currentQuestion.question.translation,
        }}
        />
    )}

      <div className="space-y-3 mt-4">
        {currentQuestion.options.map((option) => (
            <QuizOption
            key={option.id}
            id={option.id}
            label={`${option.surahName} ayat ${option.verseNumber}`}
            isSelected={selectedAnswer === option.id}
            isCorrect={option.id === currentQuestion.question.id}
            showFeedback={showFeedback}
            correctId={currentQuestion.question.id}
            onClick={handleAnswerSelect}
            disabled={showFeedback}
          />
        ))}
      </div>

      {/* Tambahkan tombol Next di sini */}
      {showFeedback && (
          <div className="mt-6 flex justify-end">
          <button
            onClick={handleNextQuestion}
            className="bg-blue-600 text-white py-2 px-4 rounded-md flex items-center"
            >
            {currentQuestionIndex < quiz.length - 1 ? "Selanjutnya" : "Lihat Hasil"}
            <ChevronRight className="w-5 h-5 ml-1" />
          </button>
        </div>
      )}

      <div className="mt-6 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Skor: {score}/{currentQuestionIndex + (showFeedback ? 1 : 0)}
        </div>
        <div className="text-sm text-gray-600">
          Level: {config.difficulty === "easy" ? "Mudah" : config.difficulty === "medium" ? "Sedang" : "Sulit"}
        </div>
      </div>
      </main>
    </div>
  )
}

