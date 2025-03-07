"use client";

import { useRef, useEffect, useState } from "react";

interface AudioVisualizerProps {
  audio: HTMLAudioElement | null;
  isPlaying: boolean;
}

export default function AudioVisualizer({ audio, isPlaying }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Function to draw a static wave when there's no audio playing
  const drawStaticWave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "white";
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerY = canvas.height / 2;
    const amplitude = canvas.height / 4;

    ctx.beginPath();
    for (let i = 0; i < canvas.width; i += 5) {
      const y = centerY + Math.sin(i * 0.05) * amplitude * 0.3;
      ctx.rect(i, centerY, 2, y - centerY);
      ctx.rect(i, y, 2, centerY - y);
    }
    ctx.fill();
  };

  useEffect(() => {
    if (!audio) return;

    try {
      // Gunakan AudioContext global jika belum ada
      if (!audioContextRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) {
          setError("AudioContext not supported in this browser");
          return;
        }
        audioContextRef.current = new AudioContext();
      }

      const audioContext = audioContextRef.current;
      if (!audioContext) return;

      // Cegah multiple source connections
      if (!sourceRef.current) {
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyserRef.current = analyser;

        const source = audioContext.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        sourceRef.current = source;
      }
    } catch (err) {
      console.error("Error setting up audio visualization:", err);
      setError("Failed to set up audio visualization");
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audio]);

  useEffect(() => {
    if (!canvasRef.current || !analyserRef.current) {
      drawStaticWave();
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!isPlaying) {
        drawStaticWave();
        return;
      }

      try {
        animationRef.current = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);

        ctx.fillStyle = "white";
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 2.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = ((dataArray[i] / 255) * canvas.height) / 2;
          const centerY = canvas.height / 2;
          ctx.fillRect(x, centerY - barHeight, barWidth, barHeight);
          ctx.fillRect(x, centerY, barWidth, barHeight);
          x += barWidth + 1;
        }
      } catch (err) {
        console.error("Error drawing visualization:", err);
        drawStaticWave();
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      }
    };

    if (isPlaying) {
      draw();
    } else {
      drawStaticWave();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);

  return (
    <>
      <canvas ref={canvasRef} className="w-full h-full rounded" width={300} height={100} />
      {error && <div className="text-xs text-white text-center mt-1">{error}</div>}
    </>
  );
}
