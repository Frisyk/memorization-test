"use client"
import Link from "next/link"
import { BookOpen, History, Award } from "lucide-react"

export default function HafalanOverviewPage() {
  return (
    <div className="mx-auto bg-white min-h-screen p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-blue-800 text-center flex-1">Tes Hafalan Al-Quran</h1>
      </div>
      <main className="md:w-4/5 mx-auto">

      <div className="text-center mb-8">
        <p className="text-gray-600">
          Uji kemampuan hafalan Al-Quran Anda dengan mendengarkan ayat dan memilih surah dan ayat yang benar.
        </p>
      </div>

      <div className="grid gap-4">
        <Link
          href="/hafalan/quiz"
          className="bg-blue-50 p-4 rounded-lg flex items-center hover:bg-blue-100 transition-colors"
        >
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mr-4">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">Mulai Kuis Baru</h2>
            <p className="text-gray-600 text-sm">Pilih tingkat kesulitan dan mulai kuis</p>
          </div>
        </Link>

        <Link
          href="/hafalan/history"
          className="bg-blue-50 p-4 rounded-lg flex items-center hover:bg-blue-100 transition-colors"
        >
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mr-4">
            <History className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">Riwayat Kuis</h2>
            <p className="text-gray-600 text-sm">Lihat hasil kuis sebelumnya</p>
          </div>
        </Link>

        <Link
          href="/hafalan/achievements"
          className="bg-blue-50 p-4 rounded-lg flex items-center hover:bg-blue-100 transition-colors"
        >
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mr-4">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">Pencapaian</h2>
            <p className="text-gray-600 text-sm">Lihat pencapaian dan statistik Anda</p>
          </div>
        </Link>
      </div>

      <div className="mt-8 bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Tentang Tes Hafalan</h3>
        <p className="text-sm text-gray-600">
          Fitur ini membantu Anda menguji kemampuan mengenali ayat-ayat Al-Quran. Dengarkan audio ayat dan pilih surah
          dan ayat yang benar dari pilihan yang tersedia.
        </p>
      </div>
      </main>
    </div>
  )
}

