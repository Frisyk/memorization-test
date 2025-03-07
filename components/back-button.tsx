"use client"

import { useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"

export default function BackButton() {
  const router = useRouter()

  return (
    <button
      onClick={() => router.back()}
      className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
      aria-label="Go back"
    >
      <ChevronLeft className="w-6 h-6" />
    </button>
  )
}

