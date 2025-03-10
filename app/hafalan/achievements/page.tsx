/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import BackButton from "@/components/back-button"
import { Award, Star, TrendingUp, Clock } from "lucide-react"

interface QuizResult {
  score: number
  totalQuestions: number
  difficulty: string
  date: string
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  unlocked: boolean
  progress?: number
  maxProgress?: number
}

export default function AchievementsPage() {
  const router = useRouter()
  const [results, setResults] = useState<QuizResult[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    totalCorrect: 0,
    totalQuestions: 0,
    averageScore: 0,
    bestScore: 0,
    quizzesByDifficulty: {
      easy: 0,
      medium: 0,
      hard: 0,
    },
  })

  useEffect(() => {
    try {
      const savedResults = localStorage.getItem("quizResults")
      if (savedResults) {
        const parsedResults = JSON.parse(savedResults) as QuizResult[]
        setResults(parsedResults)

        // Calculate stats
        const totalQuizzes = parsedResults.length
        let totalCorrect = 0
        let totalQuestions = 0
        let bestScore = 0
        const quizzesByDifficulty = {
          easy: 0,
          medium: 0,
          hard: 0,
        }

        parsedResults.forEach((result) => {
          totalCorrect += result.score
          totalQuestions += result.totalQuestions
          const scorePercentage = (result.score / result.totalQuestions) * 100
          if (scorePercentage > bestScore) {
            bestScore = scorePercentage
          }
          quizzesByDifficulty[result.difficulty as keyof typeof quizzesByDifficulty]++
        })

        const averageScore = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0

        setStats({
          totalQuizzes,
          totalCorrect,
          totalQuestions,
          averageScore,
          bestScore,
          quizzesByDifficulty,
        })

        // Define achievements
        const achievementsList: Achievement[] = [
          {
            id: "first_quiz",
            title: "Pemula",
            description: "Selesaikan kuis pertama Anda",
            icon: <Award className="w-6 h-6 text-blue-600" />,
            unlocked: totalQuizzes >= 1,
          },
          {
            id: "five_quizzes",
            title: "Rajin",
            description: "Selesaikan 5 kuis",
            icon: <Clock className="w-6 h-6 text-blue-600" />,
            unlocked: totalQuizzes >= 5,
            progress: Math.min(totalQuizzes, 5),
            maxProgress: 5,
          },
          {
            id: "perfect_score",
            title: "Sempurna",
            description: "Dapatkan skor 100% dalam satu kuis",
            icon: <Star className="w-6 h-6 text-yellow-500" />,
            unlocked: bestScore >= 100,
          },
          {
            id: "hard_quiz",
            title: "Pemberani",
            description: "Selesaikan kuis dengan tingkat kesulitan Sulit",
            icon: <TrendingUp className="w-6 h-6 text-red-600" />,
            unlocked: quizzesByDifficulty.hard >= 1,
          },
          {
            id: "master",
            title: "Hafiz",
            description: "Dapatkan rata-rata skor minimal 80%",
            icon: <Award className="w-6 h-6 text-green-600" />,
            unlocked: averageScore >= 80 && totalQuizzes >= 3,
            progress: Math.min(Math.round(averageScore), 80),
            maxProgress: 80,
          },
        ]

        setAchievements(achievementsList)
      }
    } catch (e) {
      console.error("Failed to load quiz results:", e)
    }
  }, [])

  return (
    <div className="mx-auto bg-white min-h-screen p-4">
      <div className="flex items-center justify-between mb-6">
        <BackButton />
        <h1 className="text-xl font-bold text-blue-800 text-center flex-1">Pencapaian</h1>
        <div className="w-6"></div> {/* Spacer for alignment */}
      </div>

      <main className="md:w-4/5 mx-auto">

      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h2 className="font-semibold mb-3">Statistik</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Total Kuis</p>
            <p className="font-medium">{stats.totalQuizzes}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Rata-rata Skor</p>
            <p className="font-medium">{Math.round(stats.averageScore)}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Skor Terbaik</p>
            <p className="font-medium">{Math.round(stats.bestScore)}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Jawaban Benar</p>
            <p className="font-medium">
              {stats.totalCorrect}/{stats.totalQuestions}
            </p>
          </div>
        </div>
      </div>

      <h2 className="font-semibold mb-3">Pencapaian</h2>
      {achievements.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-gray-600 mb-4">Selesaikan kuis untuk membuka pencapaian.</p>
          <button
            onClick={() => router.push("/hafalan/quiz")}
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Mulai Kuis
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {achievements.map((achievement) => (
            <div
            key={achievement.id}
            className={`p-4 rounded-lg border ${
                achievement.unlocked ? "bg-white border-blue-200" : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="flex items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
                    achievement.unlocked ? "bg-blue-100" : "bg-gray-200"
                  }`}
                >
                  {achievement.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{achievement.title}</h3>
                  <p className="text-sm text-gray-600">{achievement.description}</p>
                  {achievement.progress !== undefined && achievement.maxProgress !== undefined && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {achievement.progress}/{achievement.maxProgress}
                      </p>
                    </div>
                  )}
                </div>
                {achievement.unlocked && <Star className="w-5 h-5 text-yellow-500 ml-2" />}
              </div>
            </div>
          ))}
        </div>
      )}
      </main>
    </div>
  )
}

