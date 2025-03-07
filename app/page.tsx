import Link from "next/link"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50 p-4">
      <h1 className="text-3xl font-bold text-blue-800 mb-8">Islamic Learning App</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        <Link
          href="/hafalan"
          className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center hover:shadow-lg transition-shadow"
        >
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2c-1.7 0-3 1.2-3 2.6v6.8c0 1.4 1.3 2.6 3 2.6s3-1.2 3-2.6V4.6C15 3.2 13.7 2 12 2z"></path>
              <path d="M19 10v1a7 7 0 0 1-14 0v-1M12 18.5v3.5M8 22h8"></path>
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-blue-800 mb-2">Tes Hafalan</h2>
          <p className="text-gray-600 text-center">Latih hafalan ayat-ayat Al-Quran</p>
        </Link>

        <Link
          href="/asesmen"
          className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center hover:shadow-lg transition-shadow"
        >
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 11l3 3L22 4"></path>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-blue-800 mb-2">Asesmen</h2>
          <p className="text-gray-600 text-center">Pelajari gerakan sholat dengan benar</p>
        </Link>
      </div>
    </div>
  )
}

