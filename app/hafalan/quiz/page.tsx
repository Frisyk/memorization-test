"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import BackButton from "@/components/back-button"

export default function QuizConfigPage() {
  const router = useRouter()
  const [reciterId, setReciterId] = useState("05") // Default to Misyari Rasyid Al-Afasi
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium")
  const [isLoading, setIsLoading] = useState(false)

  const handleStartQuiz = () => {
    setIsLoading(true)
    // Simpan konfigurasi di localStorage
    localStorage.setItem("quizConfig", JSON.stringify({ reciterId, difficulty }))
    // Redirect ke halaman kuis
    router.push("/hafalan/quiz/ongoing")
  }

  return (
    <div className="mx-auto bg-white min-h-screen p-4">
      <div className="flex items-center justify-between mb-6">
        <BackButton />
        <h1 className="text-xl font-bold text-blue-800 text-center flex-1">Konfigurasi Kuis</h1>
        <div className="w-6"></div> {/* Spacer for alignment */}
      </div>

      <div className="text-center py-8">
        <h2 className="text-2xl font-bold mb-4">Selamat Datang</h2>
        <p className="text-lg mb-6">Pilih level kesulitan dan qari sebelum memulai.</p>

        <div className="mb-6">
          <p className="mb-2 font-medium">Tingkat Kesulitan:</p>
          <div className="flex justify-center gap-2 mb-4">
            <button
              onClick={() => setDifficulty("easy")}
              className={`px-3 py-1 rounded-md ${
                difficulty === "easy" ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-800"
              }`}
            >
              Mudah
            </button>
            <button
              onClick={() => setDifficulty("medium")}
              className={`px-3 py-1 rounded-md ${
                difficulty === "medium" ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-800"
              }`}
            >
              Sedang
            </button>
            <button
              onClick={() => setDifficulty("hard")}
              className={`px-3 py-1 rounded-md ${
                difficulty === "hard" ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-800"
              }`}
            >
              Sulit
            </button>
          </div>

          <p className="mb-2 font-medium">Qari:</p>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setReciterId("01")}
              className={`px-3 py-1 rounded-md ${
                reciterId === "01" ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-800"
              }`}
            >
              Abdullah Al-Juhany
            </button>
            <button
              onClick={() => setReciterId("02")}
              className={`px-3 py-1 rounded-md ${
                reciterId === "02" ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-800"
              }`}
            >
              Abdul Muhsin Al-Qasim
            </button>
            <button
              onClick={() => setReciterId("05")}
              className={`px-3 py-1 rounded-md ${
                reciterId === "05" ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-800"
              }`}
            >
              Misyari Rasyid Al-Afasi
            </button>
          </div>
        </div>

        <div className="mt-8">
          <p className="text-sm text-gray-600 mb-4">
            {difficulty === "easy"
              ? "Level Mudah: 5 pertanyaan dengan 3 pilihan jawaban."
              : difficulty === "medium"
                ? "Level Sedang: 8 pertanyaan dengan 4 pilihan jawaban."
                : "Level Sulit: 12 pertanyaan dengan 5 pilihan jawaban."}
          </p>
        </div>

        <button
          onClick={handleStartQuiz}
          disabled={isLoading}
          className="bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isLoading ? "Memuat..." : "Mulai Kuis"}
        </button>
      </div>
    </div>
  )
}

