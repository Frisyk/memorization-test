"use client"

import { useState, useEffect } from "react"
import BackButton from "@/components/back-button"
import quranData from "@/data/quran.json"
import { Play, Pause, RotateCcw } from "lucide-react"
import AudioVisualizer from "@/components/audio-visualizer"

export default function HafalanPage() {
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0)
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [score, setScore] = useState(0)
  const [shuffledVerses, setShuffledVerses] = useState<typeof quranData.verses>([])

  // Initialize quiz with shuffled verses
  useEffect(() => {
    const shuffled = [...quranData.verses].sort(() => Math.random() - 0.5)
    setShuffledVerses(shuffled)

    // Preload first audio
    if (shuffled.length > 0) {
      const newAudio = new Audio(shuffled[0].audioSrc)
      newAudio.addEventListener("timeupdate", updateProgress)
      newAudio.addEventListener("loadedmetadata", setAudioData)
      newAudio.addEventListener("ended", handleAudioEnd)
      setAudio(newAudio)
    }
  }, [])

  useEffect(() => {
    // Clean up previous audio
    if (audio) {
      audio.pause()
      audio.removeEventListener("timeupdate", updateProgress)
      audio.removeEventListener("loadedmetadata", setAudioData)
      audio.removeEventListener("ended", handleAudioEnd)
    }

    if (currentQuizIndex < shuffledVerses.length) {
      // Create new audio element for current quiz
      const newAudio = new Audio(shuffledVerses[currentQuizIndex].audioSrc)
      newAudio.addEventListener("timeupdate", updateProgress)
      newAudio.addEventListener("loadedmetadata", setAudioData)
      newAudio.addEventListener("ended", handleAudioEnd)
      setAudio(newAudio)
    }

    return () => {
      if (audio) {
        audio.pause()
        audio.removeEventListener("timeupdate", updateProgress)
        audio.removeEventListener("loadedmetadata", setAudioData)
        audio.removeEventListener("ended", handleAudioEnd)
      }
    }
  }, [currentQuizIndex, shuffledVerses])

  const updateProgress = () => {
    if (audio) {
      setCurrentTime(audio.currentTime)
    }
  }

  const setAudioData = () => {
    if (audio) {
      setDuration(audio.duration)
    }
  }

  const handleAudioEnd = () => {
    setIsPlaying(false)
    if (audio) {
      audio.currentTime = 0
    }
  }

  const togglePlayPause = () => {
    if (audio) {
      if (isPlaying) {
        audio.pause()
      } else {
        audio.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const restartAudio = () => {
    if (audio) {
      audio.currentTime = 0
      if (!isPlaying) {
        audio.play()
        setIsPlaying(true)
      }
    }
  }

  const checkAnswer = (verseId: number) => {
    setSelectedAnswer(verseId)
    const isAnswerCorrect = verseId === shuffledVerses[currentQuizIndex].id
    setIsCorrect(isAnswerCorrect)
    setShowFeedback(true)

    if (isAnswerCorrect) {
      setScore((prev) => prev + 1)
    }

    // Move to next question after a delay
    setTimeout(() => {
      if (currentQuizIndex < shuffledVerses.length - 1) {
        setCurrentQuizIndex((prev) => prev + 1)
        setSelectedAnswer(null)
        setShowFeedback(false)
      } else {
        setQuizCompleted(true)
      }
    }, 2000)
  }

  const resetQuiz = () => {
    const shuffled = [...quranData.verses].sort(() => Math.random() - 0.5)
    setShuffledVerses(shuffled)
    setCurrentQuizIndex(0)
    setSelectedAnswer(null)
    setShowFeedback(false)
    setQuizCompleted(false)
    setScore(0)
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen p-4">
      <div className="flex items-center justify-between mb-6">
        <BackButton />
        <h1 className="text-xl font-bold text-blue-800 text-center flex-1">Tes Hafalan</h1>
        <div className="w-6"></div> {/* Spacer for alignment */}
      </div>

      {quizCompleted ? (
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold mb-4">Quiz Completed!</h2>
          <p className="text-lg mb-6">
            Your score: {score} / {shuffledVerses.length}
          </p>
          <button
            onClick={resetQuiz}
            className="bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : (
        <>
          <div className="mb-4 text-center">
            <p className="text-sm text-gray-600">
              Question {currentQuizIndex + 1} of {shuffledVerses.length}
            </p>
            <p className="text-lg font-medium">Listen to the audio and select the correct surah and verse</p>
          </div>

          <div className="bg-blue-600 rounded-lg p-4 mb-6">
            <div className="h-24 w-full">
              <AudioVisualizer audio={audio} isPlaying={isPlaying} />
            </div>
          </div>

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
              onClick={() => audio && (audio.currentTime = Math.min(audio.duration, audio.currentTime + 10))}
              className="bg-blue-100 rounded-full p-4 hover:bg-blue-200 transition-colors"
              aria-label="Forward"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-blue-800"
              >
                <polygon points="5 4 15 12 5 20 5 4"></polygon>
                <line x1="19" y1="5" x2="19" y2="19"></line>
              </svg>
            </button>
          </div>

          {showFeedback && (
            <div
              className={`p-4 mb-6 rounded-md text-center ${isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
            >
              {isCorrect ? "Correct!" : "Incorrect!"} This is {shuffledVerses[currentQuizIndex].surah} ayat{" "}
              {shuffledVerses[currentQuizIndex].ayat}
            </div>
          )}

          <div className="space-y-3">
            {quranData.verses.map((verse) => (
              <button
                key={verse.id}
                onClick={() => !showFeedback && checkAnswer(verse.id)}
                disabled={showFeedback}
                className={`w-full text-center py-3 px-4 rounded-md border transition-colors ${
                  selectedAnswer === verse.id
                    ? isCorrect
                      ? "bg-green-100 border-green-600 text-green-800"
                      : "bg-red-100 border-red-600 text-red-800"
                    : showFeedback && verse.id === shuffledVerses[currentQuizIndex].id
                      ? "bg-green-100 border-green-600 text-green-800"
                      : "border-gray-300 hover:bg-blue-50"
                } ${showFeedback ? "cursor-default" : "cursor-pointer"}`}
              >
                {verse.surah} ayat {verse.ayat}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

