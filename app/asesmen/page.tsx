"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import BackButton from "@/components/back-button";
import prayerData from "@/data/prayer.json";
import { Check, ChevronLeft, ChevronRight, X } from "lucide-react";

export default function AsesmenPage() {
  const [chapterId, setChapterId] = useState<number>(1);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [timeLeft, setTimeLeft] = useState<number>(300);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const chapter = prayerData.chapters.find((c) => c.id === chapterId);
  const step = chapter?.steps.find((s) => s.id === currentStep);

  useEffect(() => {
    if (!chapter) return;

    setTimeLeft(chapter.timeLimit);
    setCurrentStep(1);
    setIsFinished(false);
    setSelectedAnswer(null);
  }, [chapterId]);

  useEffect(() => {
    if (isFinished || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isFinished, timeLeft]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleNext = (): void => {
    if (!chapter) return;
    if (currentStep < chapter.steps.length) {
      setCurrentStep((prev) => prev + 1);
      setSelectedAnswer(null);
    }
  };

  const handlePrev = (): void => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      setSelectedAnswer(null);
    }
  };

  const handleFinish = (): void => {
    setIsFinished(true);
  };

  const handleAnswerSelect = (answer: string): void => {
    setSelectedAnswer(answer);
  };

  return (
    <div className="mx-auto bg-white min-h-screen p-4 relative">
      <button className="absolute top-4 right-4 p-2 bg-gray-200 rounded-full" onClick={() => window.history.back()}>
        <X className="w-6 h-6 text-gray-800" />
      </button>

      <div className="flex items-center justify-between mb-6">
        <BackButton />
        <h1 className="text-xl font-bold text-blue-800 text-center flex-1">Asesmen</h1>
        <div className="w-6"></div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium">{chapter?.title || "Bab tidak ditemukan"}</h2>
        <div className="text-right text-blue-800 font-bold">{formatTime(timeLeft)}</div>
      </div>

      <div className="flex justify-between mb-8">
        {chapter?.steps.map((s) => (
          <button
            key={s.id}
            onClick={() => setCurrentStep(s.id)}
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              s.id === currentStep
                ? "bg-blue-600 text-white"
                : s.id < currentStep
                ? "bg-white text-blue-600 border-2 border-blue-600"
                : "bg-white text-blue-600 border border-blue-300"
            }`}
          >
            {s.id}
          </button>
        ))}
      </div>

      {step && (
        <>
          <div className="bg-blue-50 rounded-lg p-4 mb-6 flex justify-center">
            <div className="relative w-40 h-40">
              <Image src={step.image || "/placeholder.svg"} alt={step.name} fill className="object-contain" />
            </div>
          </div>

          <p className="text-center mb-6">Gambar tersebut menunjukkan gerakan {step.name.toLowerCase()}</p>

          <div className="space-y-3 mb-8">
            {chapter?.steps.map((option) => (
              <button
                key={option.id}
                onClick={() => handleAnswerSelect(option.name)}
                className={`w-full text-center py-3 px-4 rounded-md border transition-colors ${
                  selectedAnswer === option.name
                    ? option.name === step.name
                      ? "bg-green-100 border-green-600 text-green-800"
                      : "bg-red-100 border-red-600 text-red-800"
                    : "border-gray-300 hover:bg-blue-50"
                }`}
              >
                {option.name}
              </button>
            ))}
          </div>

          {selectedAnswer === step.name && (
            <div className="bg-green-100 text-green-800 p-3 rounded-md mb-6">Benar! {step.description}</div>
          )}

          {selectedAnswer !== null && selectedAnswer !== step.name && (
            <div className="bg-red-100 text-red-800 p-3 rounded-md mb-6">Jawaban salah. Coba lagi.</div>
          )}

          <div className="flex justify-between">
            {isFinished ? (
              <button
                onClick={() => {
                  setChapterId((prev) => (prev < prayerData.chapters.length ? prev + 1 : 1));
                  setIsFinished(false);
                }}
                className="bg-blue-600 text-white py-3 px-6 rounded-md w-full flex items-center justify-center"
              >
                Lanjut ke Bab Berikutnya
              </button>
            ) : (
              <>
                <button onClick={handleFinish} className="bg-blue-100 text-blue-800 py-2 px-4 rounded-md flex items-center">
                  <Check className="w-5 h-5 mr-1" /> Finish
                </button>

                <div className="flex space-x-2">
                  <button onClick={handlePrev} disabled={currentStep === 1} className="p-2 rounded-md bg-blue-100 text-blue-800">
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <button onClick={handleNext} disabled={currentStep === chapter?.steps.length} className="p-2 rounded-md bg-blue-100 text-blue-800">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
