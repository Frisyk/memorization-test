/* eslint-disable @typescript-eslint/no-explicit-any */
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
  if (!audio) return

  // Gunakan audio context yang sudah ada jika tersedia
  if (!audioContextRef.current) {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
  }

  // Cek apakah elemen audio sudah memiliki source
  if (!sourceRef.current) {
    const source = audioContextRef.current.createMediaElementSource(audio)
    sourceRef.current = source
    analyserRef.current = audioContextRef.current.createAnalyser()
    
    source.connect(analyserRef.current)
    analyserRef.current.connect(audioContextRef.current.destination)
  }

  
  return () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
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

      const barWidth = (canvas.width / bufferLength) * 10
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = ((dataArray[i] / 255) * canvas.height) / 2

        // Draw bar from the middle (for symmetrical effect)
        const centerY = canvas.height / 2
        ctx.fillRect(x, centerY - barHeight, barWidth, barHeight)
        ctx.fillRect(x, centerY, barWidth, barHeight)

        x += barWidth + 2
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

