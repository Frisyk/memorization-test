"use client"

interface QuizFeedbackProps {
  isCorrect: boolean
  correctAnswer: {
    surahName: string
    verseNumber: number
    arabic: string
    translation: string
  }
}

export default function QuizFeedback({ isCorrect, correctAnswer }: QuizFeedbackProps) {
  return (
    <div
      className={`p-4 mb-6 rounded-md text-center ${isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
    >
      <p className="font-medium mb-2">{isCorrect ? "Benar!" : "Salah!"}</p>
      <p>
        Ayat ini adalah {correctAnswer.surahName} ayat {correctAnswer.verseNumber}
      </p>
      <p className="text-right mt-2 text-3xl" dir="rtl">
        {correctAnswer.arabic}
      </p>
      <p className="text-left mt-1 text-sm">{correctAnswer.translation}</p>
    </div>
  )
}

