"use client"

import { useState, useEffect } from "react"
import BackButton from "@/components/back-button"
import {
  fetchIslamicQuiz,
  type QuizQuestion,
  getAvailableCategories,
  getAvailableDifficulties,
} from "@/services/islam-quiz-api"
import { Check, X, ChevronRight, Award, Loader2 } from "lucide-react"

export default function KuisIslamPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [showFeedback, setShowFeedback] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [categories] = useState<string[]>(getAvailableCategories())
  const [difficulties] = useState<string[]>(getAvailableDifficulties())
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined)
  const [selectedDifficulty, setSelectedDifficulty] = useState<"easy" | "medium" | "hard" | undefined>(undefined)
  const [quizStarted, setQuizStarted] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState("Memuat kuis Islam...")
  // Tambahkan state untuk menampilkan debug info
  const [debugInfo, setDebugInfo] = useState<string[]>([])
  const [showDebug, setShowDebug] = useState(false)

  useEffect(() => {
    if (quizStarted) {
      loadQuiz()
    }
  }, [loading])

  // Ubah fungsi loadQuiz untuk menangani error dengan lebih baik dan menambahkan timeout
  async function loadQuiz() {
    try {
      setLoading(true)
      setError(null)
      setDebugInfo([])
      setLoadingMessage("Menghubungkan ke API myQuran.com...")

      // Tambahkan log untuk debugging
      const addLog = (message: string) => {
        console.log(message)
        setDebugInfo((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
      }

      addLog("Memulai proses loading kuis")

      // Set timeout untuk loading
      const loadingTimeout = setTimeout(() => {
        addLog("Loading timeout - menggunakan data fallback")
        setError("Waktu loading habis. Menggunakan data fallback.")
        // Gunakan data fallback jika timeout
        // const fallbackData = [
        //   {
        //     id: "fallback-1",
        //     question: "Siapakah nabi terakhir dalam Islam?",
        //     options: ["Nabi Isa AS", "Nabi Muhammad SAW", "Nabi Musa AS", "Nabi Ibrahim AS"],
        //     correctAnswer: "Nabi Muhammad SAW",
        //     explanation: "Nabi Muhammad SAW adalah nabi dan rasul terakhir yang diutus Allah SWT.",
        //     category: "Aqidah",
        //     difficulty: "easy",
        //   },
        //   {
        //     id: "fallback-2",
        //     question: "Berapa jumlah rakaat shalat Maghrib?",
        //     options: ["2 rakaat", "3 rakaat", "4 rakaat", "5 rakaat"],
        //     correctAnswer: "3 rakaat",
        //     explanation: "Shalat Maghrib terdiri dari 3 rakaat, dengan 2 rakaat pertama dibaca dengan suara keras.",
        //     category: "Sholat",
        //     difficulty: "easy",
        //   },
        //   {
        //     id: "fallback-3",
        //     question: "Apa nama kitab suci umat Islam?",
        //     options: ["Taurat", "Zabur", "Injil", "Al-Quran"],
        //     correctAnswer: "Al-Quran",
        //     explanation: "Al-Quran adalah kitab suci umat Islam yang diturunkan kepada Nabi Muhammad SAW.",
        //     category: "Aqidah",
        //     difficulty: "easy",
        //   },
        // ]

        // setQuestions(fallbackData)
        setCurrentQuestionIndex(0)
        setSelectedAnswer(null)
        setShowFeedback(false)
        setQuizCompleted(false)
        setScore(0)
        setLoading(false)
      }, 1000) // 15 detik timeout

      setTimeout(() => {
        if (loading) {
          setLoadingMessage("Mengambil data dari API...")
          addLog("Masih loading - mengambil data dari API")
        }
      }, 2000)

      setTimeout(() => {
        if (loading) {
          setLoadingMessage("Menyiapkan pertanyaan kuis...")
          addLog("Masih loading - menyiapkan pertanyaan")
        }
      }, 4000)

      setTimeout(() => {
        if (loading) {
          setLoadingMessage("Menunggu respons dari server...")
          addLog("Masih loading - menunggu respons server")
        }
      }, 8000)

      addLog(
        `Memanggil fetchIslamicQuiz dengan kategori: ${selectedCategory || "semua"}, kesulitan: ${selectedDifficulty || "semua"}`,
      )

      try {
        const quizData = await fetchIslamicQuiz(selectedCategory, selectedDifficulty as "easy" | "medium" | "hard", 10)

        clearTimeout(loadingTimeout)

        addLog(`Berhasil mendapatkan ${quizData.length} pertanyaan`)

        if (quizData.length === 0) {
          addLog("Tidak ada pertanyaan yang dikembalikan, menggunakan data fallback")
          throw new Error("Tidak ada pertanyaan yang tersedia untuk kriteria yang dipilih")
        }

        setQuestions(quizData)
        setCurrentQuestionIndex(0)
        setSelectedAnswer(null)
        setShowFeedback(false)
        setQuizCompleted(false)
        setScore(0)
        setLoading(false)
      } catch (fetchError) {
        clearTimeout(loadingTimeout)
        addLog(`Error saat fetch: ${fetchError}`)
        throw fetchError
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Gagal memuat data kuis"
      setError(`${errorMessage}. Silakan coba lagi nanti.`)
      setLoading(false)
      console.error("Error loading quiz:", err)
    }
  }

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer)
    setShowFeedback(true)

    const currentQuestion = questions[currentQuestionIndex]
    if (answer === currentQuestion.correctAnswer) {
      setScore((prev) => prev + 1)
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
      setSelectedAnswer(null)
      setShowFeedback(false)
    } else {
      setQuizCompleted(true)
    }
  }

  const resetQuiz = () => {
    setQuizStarted(false)
    setQuizCompleted(false)
    setSelectedCategory(undefined)
    setSelectedDifficulty(undefined)
  }

  // Tambahkan tombol untuk menggunakan data fallback di halaman loading
  if (loading) {
    return (
      <div className="mx-auto bg-white min-h-screen p-4 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-lg mb-4">{loadingMessage}</p>
          <button
            onClick={() => {
              setLoading(false)
              setQuestions([
                {
                  id: "fallback-1",
                  question: "Siapakah nabi terakhir dalam Islam?",
                  options: ["Nabi Isa AS", "Nabi Muhammad SAW", "Nabi Musa AS", "Nabi Ibrahim AS"],
                  correctAnswer: "Nabi Muhammad SAW",
                  explanation: "Nabi Muhammad SAW adalah nabi dan rasul terakhir yang diutus Allah SWT.",
                  category: "Aqidah",
                  difficulty: "easy",
                },
                {
                  id: "fallback-2",
                  question: "Berapa jumlah rakaat shalat Maghrib?",
                  options: ["2 rakaat", "3 rakaat", "4 rakaat", "5 rakaat"],
                  correctAnswer: "3 rakaat",
                  explanation:
                    "Shalat Maghrib terdiri dari 3 rakaat, dengan 2 rakaat pertama dibaca dengan suara keras.",
                  category: "Sholat",
                  difficulty: "easy",
                },
                {
                  id: "fallback-3",
                  question: "Apa nama kitab suci umat Islam?",
                  options: ["Taurat", "Zabur", "Injil", "Al-Quran"],
                  correctAnswer: "Al-Quran",
                  explanation: "Al-Quran adalah kitab suci umat Islam yang diturunkan kepada Nabi Muhammad SAW.",
                  category: "Aqidah",
                  difficulty: "easy",
                },
              ])
            }}
            className="bg-yellow-500 text-white py-1 px-3 rounded-md text-sm"
          >
            Gunakan Data Fallback
          </button>

          <button
            onClick={() => setShowDebug(!showDebug)}
            className="bg-gray-200 text-gray-800 py-1 px-2 rounded-md text-sm mt-2 ml-2"
          >
            {showDebug ? "Sembunyikan Debug Info" : "Tampilkan Debug Info"}
          </button>

          {showDebug && (
            <div className="mt-4 text-left bg-gray-100 p-3 rounded-md max-h-60 overflow-y-auto text-xs">
              <h3 className="font-bold mb-2">Debug Info:</h3>
              {debugInfo.length > 0 ? (
                <ul className="space-y-1">
                  {debugInfo.map((log, index) => (
                    <li key={index}>{log}</li>
                  ))}
                </ul>
              ) : (
                <p>Tidak ada info debug</p>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Tambahkan tombol debug di halaman error
  if (error) {
    return (
      <div className="mx-auto bg-white min-h-screen p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">⚠️</div>
          <p className="text-lg text-red-600 mb-4">{error}</p>
          <div className="flex flex-col gap-2">
            <button onClick={loadQuiz} className="bg-green-600 text-white py-2 px-4 rounded-md">
              Coba Lagi
            </button>
            <button
              onClick={() => setShowDebug(!showDebug)}
              className="bg-gray-200 text-gray-800 py-1 px-2 rounded-md text-sm mt-2"
            >
              {showDebug ? "Sembunyikan Debug Info" : "Tampilkan Debug Info"}
            </button>
          </div>

          {showDebug && (
            <div className="mt-4 text-left bg-gray-100 p-3 rounded-md max-h-60 overflow-y-auto text-xs">
              <h3 className="font-bold mb-2">Debug Info:</h3>
              {debugInfo.length > 0 ? (
                <ul className="space-y-1">
                  {debugInfo.map((log, index) => (
                    <li key={index}>{log}</li>
                  ))}
                </ul>
              ) : (
                <p>Tidak ada info debug</p>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto bg-white min-h-screen p-4">
      <div className="flex items-center justify-between mb-6">
        <BackButton />
        <h1 className="text-xl font-bold text-green-800 text-center flex-1">Kuis Islam</h1>
        <div className="w-6"></div> {/* Spacer for alignment */}
      </div>

      {!quizStarted ? (
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold mb-4">Selamat Datang di Kuis Islam</h2>
          <p className="text-lg mb-6">Pilih kategori dan tingkat kesulitan untuk memulai kuis.</p>

          <div className="mb-6">
            <p className="mb-2 font-medium">Kategori:</p>
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 rounded-md ${
                    selectedCategory === category ? "bg-green-600 text-white" : "bg-green-100 text-green-800"
                  }`}
                >
                  {category}
                </button>
              ))}
              <button
                onClick={() => setSelectedCategory(undefined)}
                className={`px-3 py-1 rounded-md ${
                  selectedCategory === undefined ? "bg-green-600 text-white" : "bg-green-100 text-green-800"
                }`}
              >
                Semua
              </button>
            </div>

            <p className="mb-2 font-medium">Tingkat Kesulitan:</p>
            <div className="flex justify-center gap-2">
              {difficulties.map((difficulty) => (
                <button
                  key={difficulty}
                  onClick={() => setSelectedDifficulty(difficulty as "easy" | "medium" | "hard")}
                  className={`px-3 py-1 rounded-md ${
                    selectedDifficulty === difficulty ? "bg-green-600 text-white" : "bg-green-100 text-green-800"
                  }`}
                >
                  {difficulty === "easy" ? "Mudah" : difficulty === "medium" ? "Sedang" : "Sulit"}
                </button>
              ))}
              <button
                onClick={() => setSelectedDifficulty(undefined)}
                className={`px-3 py-1 rounded-md ${
                  selectedDifficulty === undefined ? "bg-green-600 text-white" : "bg-green-100 text-green-800"
                }`}
              >
                Semua
              </button>
            </div>
          </div>

          <button
            onClick={() => setQuizStarted(true)}
            className="bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 transition-colors"
          >
            Mulai Kuis
          </button>
        </div>
      ) : quizCompleted ? (
        <div className="text-center py-8">
          <div className="mb-6">
            <Award className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Kuis Selesai!</h2>
            <p className="text-lg mb-2">
              Skor Anda: {score} / {questions.length}
            </p>
            <p className="text-md mb-6">
              {score === questions.length
                ? "Sempurna! Anda menguasai materi dengan baik."
                : score >= questions.length * 0.7
                  ? "Bagus! Anda memiliki pemahaman yang baik."
                  : "Teruslah belajar untuk meningkatkan pemahaman Anda."}
            </p>
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={loadQuiz}
              className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
            >
              Coba Lagi
            </button>
            <button
              onClick={resetQuiz}
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Kuis Baru
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">
                Pertanyaan {currentQuestionIndex + 1} dari {questions.length}
              </span>
              <span className="text-sm font-medium text-green-800">Skor: {score}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-green-600 h-2.5 rounded-full"
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4 mb-6">
            <p className="text-lg font-medium mb-1">{questions[currentQuestionIndex]?.category}</p>
            <h2 className="text-xl font-bold">{questions[currentQuestionIndex]?.question}</h2>
          </div>

          <div className="space-y-3 mb-6">
            {questions[currentQuestionIndex]?.options.map((option, index) => (
              <button
                key={index}
                onClick={() => !showFeedback && handleAnswerSelect(option)}
                disabled={showFeedback}
                className={`w-full text-left py-3 px-4 rounded-md border transition-colors ${
                  selectedAnswer === option
                    ? option === questions[currentQuestionIndex].correctAnswer
                      ? "bg-green-100 border-green-600 text-green-800"
                      : "bg-red-100 border-red-600 text-red-800"
                    : showFeedback && option === questions[currentQuestionIndex].correctAnswer
                      ? "bg-green-100 border-green-600 text-green-800"
                      : "border-gray-300 hover:bg-green-50"
                }`}
              >
                <div className="flex items-center">
                  <span className="mr-2">{String.fromCharCode(65 + index)}.</span>
                  <span className="flex-1">{option}</span>
                  {showFeedback && option === questions[currentQuestionIndex].correctAnswer ? (
                    <Check className="w-5 h-5 text-green-600 ml-2" />
                  ) : showFeedback && option === selectedAnswer ? (
                    <X className="w-5 h-5 text-red-600 ml-2" />
                  ) : null}
                </div>
              </button>
            ))}
          </div>

          {showFeedback && (
            <div
              className={`p-4 mb-6 rounded-md ${
                selectedAnswer === questions[currentQuestionIndex].correctAnswer
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              <p className="font-medium mb-2">
                {selectedAnswer === questions[currentQuestionIndex].correctAnswer ? "Benar!" : "Salah!"}
              </p>
              <p>
                {questions[currentQuestionIndex].explanation ||
                  `Jawaban yang benar adalah: ${questions[currentQuestionIndex].correctAnswer}`}
              </p>
            </div>
          )}

          {showFeedback && (
            <div className="flex justify-end">
              <button
                onClick={handleNextQuestion}
                className="bg-green-600 text-white py-2 px-4 rounded-md flex items-center"
              >
                {currentQuestionIndex < questions.length - 1 ? "Selanjutnya" : "Lihat Hasil"}
                <ChevronRight className="w-5 h-5 ml-1" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

