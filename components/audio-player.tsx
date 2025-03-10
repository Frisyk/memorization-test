"use client"

import { useState, useEffect, useRef } from "react"
import { Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react"
import AudioVisualizer from "@/components/audio-visualizer"

interface AudioPlayerProps {
  audioUrl: string
  onError?: (error: string) => void
}

export default function AudioPlayer({ audioUrl, onError }: AudioPlayerProps) {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [visualizerKey, setVisualizerKey] = useState(0)
  const [audioError, setAudioError] = useState<string | null>(null)

  useEffect(() => {
    // Clean up previous audio
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.removeEventListener("ended", handleAudioEnd)
      audioRef.current.removeEventListener("error", handleAudioError)
    }

    if (!audioUrl) return

    // Create proxied URL if needed
    const finalAudioUrl = audioUrl.startsWith("http") ? `/api/audio?url=${encodeURIComponent(audioUrl)}` : audioUrl
    console.log("Loading audio from:", finalAudioUrl)

    const newAudio = new Audio(finalAudioUrl)
    newAudio.addEventListener("ended", handleAudioEnd)
    newAudio.addEventListener("error", handleAudioError)
    newAudio.addEventListener("canplay", () => {
      console.log("Audio can play")
    })

    // Preload the audio
    newAudio.preload = "auto"

    // Set volume
    newAudio.volume = isMuted ? 0 : 1

    setAudio(newAudio)
    audioRef.current = newAudio

    // Force visualizer to re-render with new audio
    setVisualizerKey((prev) => prev + 1)

    // Try to load the audio
    newAudio.load()

    // Cleanup function
    return () => {
      if (newAudio) {
        newAudio.pause()
        newAudio.removeEventListener("ended", handleAudioEnd)
        newAudio.removeEventListener("error", handleAudioError)
      }
    }
  }, [audioUrl, isMuted])

  const handleAudioEnd = () => {
    console.log("Audio playback ended")
    setIsPlaying(false)
    if (audioRef.current) {
      audioRef.current.currentTime = 0
    }
  }

  const handleAudioError = (e: Event) => {
    console.error("Audio error:", e)
    const errorMessage = "Failed to load audio. Please try again."
    setAudioError(errorMessage)
    if (onError) onError(errorMessage)
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
              if (onError) onError("Couldn't play audio. Try clicking the play button again.")
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
              if (onError) onError("Couldn't restart audio. Try clicking the play button.")
            })
        }
      }
    }
  }

  return (
    <div>
      <div className="bg-blue-600 rounded-lg p-4 mb-2">
        <div className="h-24 w-full">
          <AudioVisualizer key={visualizerKey} audio={audio} isPlaying={isPlaying} />
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
    </div>
  )
}

