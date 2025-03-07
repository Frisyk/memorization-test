"use client"

import { useRef, useEffect } from "react"

interface AudioVisualizerProps {
  audio: HTMLAudioElement | null
  isPlaying: boolean
}

export default function AudioVisualizer({ audio, isPlaying }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)

  useEffect(() => {
    // Clean up previous audio context
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
      analyserRef.current = null
      sourceRef.current = null
    }

    if (!audio) return

    // Create new audio context
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    audioContextRef.current = audioContext

    // Create analyzer
    const analyser = audioContext.createAnalyser()
    analyser.fftSize = 256
    analyserRef.current = analyser

    // Connect audio to analyzer
    const source = audioContext.createMediaElementSource(audio)
    source.connect(analyser)
    analyser.connect(audioContext.destination)
    sourceRef.current = source

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [audio])

  useEffect(() => {
    if (!canvasRef.current || !analyserRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const analyser = analyserRef.current
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      if (!isPlaying) {
        // Draw a static wave when not playing
        ctx.fillStyle = "white"
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        const centerY = canvas.height / 2
        const amplitude = canvas.height / 4

        ctx.beginPath()
        for (let i = 0; i < canvas.width; i += 5) {
          const y = centerY + Math.sin(i * 0.05) * amplitude * 0.3
          ctx.rect(i, centerY, 2, y - centerY)
          ctx.rect(i, y, 2, centerY - y)
        }
        ctx.fill()
        return
      }

      animationRef.current = requestAnimationFrame(draw)
      analyser.getByteFrequencyData(dataArray)

      ctx.fillStyle = "white"
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const barWidth = (canvas.width / bufferLength) * 2.5
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = ((dataArray[i] / 255) * canvas.height) / 2

        // Draw bar from the middle (for symmetrical effect)
        const centerY = canvas.height / 2
        ctx.fillRect(x, centerY - barHeight, barWidth, barHeight)
        ctx.fillRect(x, centerY, barWidth, barHeight)

        x += barWidth + 1
      }
    }

    if (isPlaying) {
      draw()
    } else {
      // Draw static visualization when paused
      draw()
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying])

  return <canvas ref={canvasRef} className="w-full h-full rounded" width={300} height={100} />
}

