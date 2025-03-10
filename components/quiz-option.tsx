"use client"

interface QuizOptionProps {
  id: string
  label: string
  isSelected: boolean
  isCorrect?: boolean
  showFeedback: boolean
  correctId?: string
  onClick: (id: string) => void
  disabled?: boolean
}

export default function QuizOption({
  id,
  label,
  isSelected,
  isCorrect,
  showFeedback,
  correctId,
  onClick,
  disabled = false,
}: QuizOptionProps) {
  const getClassName = () => {
    if (!showFeedback) {
      return isSelected ? "bg-blue-100 border-blue-600 text-blue-800" : "border-gray-300 hover:bg-blue-50"
    }

    if (isSelected) {
      return isCorrect ? "bg-green-100 border-green-600 text-green-800" : "bg-red-100 border-red-600 text-red-800"
    }

    if (correctId === id) {
      return "bg-green-100 border-green-600 text-green-800"
    }

    return "border-gray-300"
  }

  return (
    <button
      onClick={() => !disabled && onClick(id)}
      disabled={disabled}
      className={`w-full text-center py-3 px-4 rounded-md border transition-colors ${getClassName()} ${
        disabled ? "cursor-default" : "cursor-pointer"
      }`}
    >
      {label}
    </button>
  )
}

