/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState, useEffect, useRef } from "react"
import BackButton from "@/components/back-button"
import { Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react"
import AudioVisualizer from "@/components/audio-visualizer"
import { fetchRandomSurahs, generateQuizData } from "@/services/quran-api"

interface QuizOption {
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
  options: QuizOption[]
}

export default function HafalanPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quiz, setQuiz] = useState<QuizQuestion[]>([])
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [score, setScore] = useState(0)
  const [reciterId, setReciterId] = useState("05") // Default to Misyari Rasyid Al-Afasi
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium")
  const [audioError, setAudioError] = useState<string | null>(null)

  // Fetch quiz data on component mount
  useEffect(() => {
    loadQuiz()
  }, [reciterId, difficulty])

  async function loadQuiz() {
    try {
      setLoading(true)
      setError(null)
      setAudioError(null)

      // Determine number of surahs based on difficulty
      const surahCount = difficulty === "easy" ? 3 : difficulty === "medium" ? 5 : 8

      // Fetch random surahs from the API
      const surahs = await fetchRandomSurahs(surahCount)

      // Generate quiz questions with options
      const questionCount = difficulty === "easy" ? 5 : difficulty === "medium" ? 8 : 12
      const optionsCount = difficulty === "easy" ? 3 : difficulty === "medium" ? 4 : 5

      // Use the non-async version of generateQuizData
      const quizData = generateQuizData(surahs, questionCount, optionsCount, reciterId)
      setQuiz(quizData)

      setCurrentQuestionIndex(0)
      setSelectedAnswer(null)
      setShowFeedback(false)
      setQuizCompleted(false)
      setScore(0)
      setLoading(false)
    } catch (err) {
      setError("Failed to load quiz data. Please try again later.")
      setLoading(false)
      console.error("Error loading quiz:", err)
    }
  }

  // Set up audio when quiz items or current index changes
// Updated audio loading logic
useEffect(() => {
  // Clean up previous audio
  if (audioRef.current) {
    audioRef.current.pause();
    audioRef.current.removeEventListener("ended", handleAudioEnd);
    audioRef.current.removeEventListener("error", handleAudioError);
  }

  if (quiz.length > 0 && currentQuestionIndex < quiz.length) {
    setAudioError(null);

    // Get original audio URL
    const originalAudioUrl = quiz[currentQuestionIndex]?.question.audioUrl;
    if (!originalAudioUrl) return;

    // Create proxied URL
    const audioUrl = `/api/audio?url=${encodeURIComponent(originalAudioUrl)}`;
    console.log("Loading audio from proxy:", audioUrl);

    const newAudio = new Audio(audioUrl);
    // No need for crossOrigin since we're using our own domain now
    newAudio.addEventListener("ended", handleAudioEnd);
    newAudio.addEventListener("error", handleAudioError);

    // Preload the audio
    newAudio.preload = "auto";

    // Set volume
    newAudio.volume = isMuted ? 0 : 1;

    setAudio(newAudio);
    audioRef.current = newAudio;

    // Try to load the audio
    newAudio.load();
  }

  // Cleanup function
  return () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeEventListener("ended", handleAudioEnd);
      audioRef.current.removeEventListener("error", handleAudioError);
    }
  };
}, [quiz, currentQuestionIndex, isMuted]);


  const handleAudioEnd = () => {
    console.log("Audio playback ended")
    setIsPlaying(false)
    if (audioRef.current) {
      audioRef.current.currentTime = 0
    }
  }

  const handleAudioError = (e: Event) => {
    console.error("Audio error:", e)
    setAudioError("Failed to load audio. Please try another question or reciter.")
    setIsPlaying(false)
  }

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
        console.log("Audio paused")
      } else {
        // Create a user interaction context for autoplay
        const playPromise = audioRef.current.play()

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true)
              console.log("Audio playing")
            })
            .catch((err) => {
              console.error("Play failed:", err)
              setAudioError("Couldn't play audio. Try clicking the play button again.")
            })
        }
      }
    }
  }

  const toggleMute = () => {
    if (audioRef.current) {
      const newMuteState = !isMuted
      audioRef.current.muted = newMuteState
      setIsMuted(newMuteState)
    }
  }

  const restartAudio = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      if (!isPlaying) {
        const playPromise = audioRef.current.play()

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true)
              console.log("Audio restarted and playing")
            })
            .catch((err) => {
              console.error("Restart failed:", err)
              setAudioError("Couldn't restart audio. Try clicking the play button.")
            })
        }
      }
    }
  }

  const checkAnswer = (optionId: string) => {
    setSelectedAnswer(optionId)
    const correctId = quiz[currentQuestionIndex].question.id
    const isAnswerCorrect = optionId === correctId
    setIsCorrect(isAnswerCorrect)
    setShowFeedback(true)

    if (isAnswerCorrect) {
      setScore((prev) => prev + 1)
    }

    // Move to next question after a delay
    setTimeout(() => {
      if (currentQuestionIndex < quiz.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1)
        setSelectedAnswer(null)
        setShowFeedback(false)
      } else {
        setQuizCompleted(true)
      }
    }, 2000)
  }

  const resetQuiz = () => {
    loadQuiz()
  }

  const changeReciter = (newReciterId: string) => {
    setReciterId(newReciterId)
    // The useEffect will reload the quiz with the new reciter
  }

  const changeDifficulty = (newDifficulty: "easy" | "medium" | "hard") => {
    setDifficulty(newDifficulty)
    // The useEffect will reload the quiz with the new difficulty
  }

  if (loading) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Loading quiz data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">⚠️</div>
          <p className="text-lg text-red-600 mb-4">{error}</p>
          <button onClick={() => loadQuiz()} className="bg-blue-600 text-white py-2 px-4 rounded-md">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen p-4">
      <div className="flex items-center justify-between mb-6">
        <BackButton />
        <h1 className="text-xl font-bold text-blue-800 text-center flex-1">Tes Hafalan</h1>
        <div className="w-6"></div> {/* Spacer for alignment */}
      </div>

      {!quizStarted ? (
  // Tampilan awal sebelum quiz dimulai
  <div className="text-center py-8">
    <h2 className="text-2xl font-bold mb-4">Welcome to the Quiz!</h2>
    <p className="text-lg mb-6">Choose difficulty and reciter before starting.</p>

    <div className="mb-6">
      <p className="mb-2 font-medium">Difficulty:</p>
      <div className="flex justify-center gap-2 mb-4">
        <button
          onClick={() => changeDifficulty("easy")}
          className={`px-3 py-1 rounded-md ${difficulty === "easy" ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-800"}`}
        >
          Easy
        </button>
        <button
          onClick={() => changeDifficulty("medium")}
          className={`px-3 py-1 rounded-md ${difficulty === "medium" ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-800"}`}
        >
          Medium
        </button>
        <button
          onClick={() => changeDifficulty("hard")}
          className={`px-3 py-1 rounded-md ${difficulty === "hard" ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-800"}`}
        >
          Hard
        </button>
      </div>

      <p className="mb-2 font-medium">Reciter:</p>
      <div className="flex flex-wrap justify-center gap-2">
        <button
          onClick={() => changeReciter("01")}
          className={`px-3 py-1 rounded-md ${reciterId === "01" ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-800"}`}
        >
          Abdullah Al-Juhany
        </button>
        <button
          onClick={() => changeReciter("02")}
          className={`px-3 py-1 rounded-md ${reciterId === "02" ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-800"}`}
        >
          Abdul Muhsin Al-Qasim
        </button>
        <button
          onClick={() => changeReciter("05")}
          className={`px-3 py-1 rounded-md ${reciterId === "05" ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-800"}`}
        >
          Misyari Rasyid Al-Afasi
        </button>
      </div>
    </div>

    <button
      onClick={() => setQuizStarted(true)}
      className="bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors"
    >
      Start Quiz
    </button>
  </div>
) : quizCompleted ? (
  // Tampilan setelah quiz selesai
  <div className="text-center py-8">
    <h2 className="text-2xl font-bold mb-4">Quiz Completed!</h2>
    <p className="text-lg mb-6">Your score: {score} / {quiz.length}</p>

    <button
      onClick={() => {
        resetQuiz();
        setQuizStarted(false);
      }}
      className="bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors"
    >
      New Quiz
    </button>
  </div>
) : (
  // Tampilan saat quiz berlangsung
  <>
    <div className="mb-4 text-center">
      <p className="text-sm text-gray-600">
        Question {currentQuestionIndex + 1} of {quiz.length}
      </p>
      <p className="text-lg font-medium">Listen to the audio and select the correct surah and verse</p>
    </div>

    <div className="bg-blue-600 rounded-lg p-4 mb-2">
      <div className="h-24 w-full">
        <AudioVisualizer audio={audioRef.current} isPlaying={isPlaying} />
      </div>
    </div>

    {audioError && <div className="bg-yellow-100 text-yellow-800 p-3 rounded-md mb-4 text-sm">{audioError}</div>}

    <div className="flex justify-center space-x-4 mb-8">
      <button
        onClick={restartAudio}
        className="bg-blue-100 rounded-full p-4 hover:bg-blue-200 transition-colors"
        aria-label="Restart"
      >
        <RotateCcw className="w-5 h-5 text-blue-800" />
      </button>

      <button
        onClick={togglePlayPause}
        className="bg-blue-100 rounded-full p-4 hover:bg-blue-200 transition-colors"
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? <Pause className="w-5 h-5 text-blue-800" /> : <Play className="w-5 h-5 text-blue-800" />}
      </button>

      <button
        onClick={toggleMute}
        className="bg-blue-100 rounded-full p-4 hover:bg-blue-200 transition-colors"
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? <VolumeX className="w-5 h-5 text-blue-800" /> : <Volume2 className="w-5 h-5 text-blue-800" />}
      </button>
    </div>

    {showFeedback && (
      <div
        className={`p-4 mb-6 rounded-md text-center ${isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
      >
        {isCorrect ? "Correct!" : "Incorrect!"} This is {quiz[currentQuestionIndex].question.surahName} ayat{" "}
        {quiz[currentQuestionIndex].question.verseNumber}
        <p className="text-right mt-2 text-3xl" dir="rtl">
          {quiz[currentQuestionIndex].question.arabic}
        </p>
        <p className="text-left mt-1 text-sm">{quiz[currentQuestionIndex].question.translation}</p>
      </div>
    )}

    <div className="space-y-3">
      {quiz[currentQuestionIndex]?.options.map((option) => (
        <button
          key={option.id}
          onClick={() => !showFeedback && checkAnswer(option.id)}
          disabled={showFeedback}
          className={`w-full text-center py-3 px-4 rounded-md border transition-colors ${
            selectedAnswer === option.id
              ? isCorrect
                ? "bg-green-100 border-green-600 text-green-800"
                : "bg-red-100 border-red-600 text-red-800"
              : showFeedback && option.id === quiz[currentQuestionIndex].question.id
                ? "bg-green-100 border-green-600 text-green-800"
                : "border-gray-300 hover:bg-blue-50"
          } ${showFeedback ? "cursor-default" : "cursor-pointer"}`}
        >
          {option.surahName} ayat {option.verseNumber}
        </button>
      ))}
    </div>
  </>
)}

    </div>
  )
}

