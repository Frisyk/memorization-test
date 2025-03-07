// Service to fetch data from equran.id API

export interface QuranVerse {
  nomorAyat: number
  teksArab: string
  teksLatin: string
  teksIndonesia: string
  audio: {
    [key: string]: string
  }
}

export interface QuranSurah {
  nomor: number
  nama: string
  namaLatin: string
  jumlahAyat: number
  tempatTurun: string
  arti: string
  deskripsi: string
  audioFull: {
    [key: string]: string
  }
  ayat: QuranVerse[]
}

export interface QuranApiResponse {
  code: number
  message: string
  data: QuranSurah
}

// Cache for storing fetched surahs to avoid redundant API calls
const surahCache: Record<number, QuranSurah> = {}

/**
 * Fetch a specific surah from the equran.id API
 * @param surahNumber The number of the surah to fetch (1-114)
 * @returns Promise with the surah data
 */
export async function fetchSurah(surahNumber: number): Promise<QuranSurah> {
  // Check if we have this surah in cache
  if (surahCache[surahNumber]) {
    return surahCache[surahNumber]
  }

  try {
    const response = await fetch(`https://equran.id/api/v2/surat/${surahNumber}`)

    if (!response.ok) {
      throw new Error(`Failed to fetch surah: ${response.status} ${response.statusText}`)
    }

    const data: QuranApiResponse = await response.json()

    if (data.code !== 200) {
      throw new Error(`API returned error: ${data.message}`)
    }

    // Store in cache
    surahCache[surahNumber] = data.data

    return data.data
  } catch (error) {
    console.error("Error fetching surah:", error)
    throw error
  }
}

/**
 * Get random unique surah numbers
 * @param count Number of random surahs to get
 * @returns Array of random surah numbers
 */
export function getRandomSurahNumbers(count = 5): number[] {
  const totalSurahs = 114
  const numbers: number[] = []

  // Ensure we don't request more than available
  const actualCount = Math.min(count, totalSurahs)

  while (numbers.length < actualCount) {
    // Generate random number between 1 and 114
    const randomNum = Math.floor(Math.random() * totalSurahs) + 1

    // Only add if not already in the array
    if (!numbers.includes(randomNum)) {
      numbers.push(randomNum)
    }
  }

  return numbers
}

/**
 * Fetch random surahs for the quiz
 * @param count Number of random surahs to fetch
 * @returns Promise with an array of surahs
 */
export async function fetchRandomSurahs(count = 5): Promise<QuranSurah[]> {
  const randomSurahNumbers = getRandomSurahNumbers(count)
  const promises = randomSurahNumbers.map((number) => fetchSurah(number))
  return Promise.all(promises)
}

/**
 * Get a random verse from a specific surah
 * @param surah The surah object
 * @param reciterId The ID of the reciter (01-05)
 * @returns An object with verse data and audio URL
 */
export function getRandomVerseFromSurah(
  surah: QuranSurah,
  reciterId = "05",
): {
  id: string
  surahNumber: number
  surahName: string
  verseNumber: number
  arabic: string
  translation: string
  audioUrl: string
} {
  const randomVerseIndex = Math.floor(Math.random() * surah.ayat.length)
  const verse = surah.ayat[randomVerseIndex]

  return {
    id: `${surah.nomor}-${verse.nomorAyat}`,
    surahNumber: surah.nomor,
    surahName: surah.namaLatin,
    verseNumber: verse.nomorAyat,
    arabic: verse.teksArab,
    translation: verse.teksIndonesia,
    audioUrl: verse.audio[reciterId],
  }
}

/**
 * Generate quiz data with questions and options
 * @param surahs Array of surah objects
 * @param questionCount Number of questions to generate
 * @param optionsPerQuestion Number of options per question
 * @param reciterId The ID of the reciter (01-05)
 * @returns Array of quiz questions with options
 */
export function generateQuizData(
  surahs: QuranSurah[],
  questionCount = 5,
  optionsPerQuestion = 4,
  reciterId = "05",
): Array<{
  question: {
    id: string
    surahNumber: number
    surahName: string
    verseNumber: number
    arabic: string
    translation: string
    audioUrl: string
  }
  options: Array<{
    id: string
    surahNumber: number
    surahName: string
    verseNumber: number
  }>
}> {
  // Create a pool of all possible verses
  const versePool: Array<{
    id: string
    surahNumber: number
    surahName: string
    verseNumber: number
    arabic: string
    translation: string
    audioUrl: string
  }> = []

  surahs.forEach((surah) => {
    surah.ayat.forEach((verse) => {
      versePool.push({
        id: `${surah.nomor}-${verse.nomorAyat}`,
        surahNumber: surah.nomor,
        surahName: surah.namaLatin,
        verseNumber: verse.nomorAyat,
        arabic: verse.teksArab,
        translation: verse.teksIndonesia,
        audioUrl: verse.audio[reciterId],
      })
    })
  })

  // Shuffle the verse pool
  const shuffledPool = [...versePool].sort(() => Math.random() - 0.5)

  // Take only what we need for questions
  const actualQuestionCount = Math.min(questionCount, shuffledPool.length)
  const questionVerses = shuffledPool.slice(0, actualQuestionCount)

  // Generate quiz questions with options
  return questionVerses.map((questionVerse) => {
    // Create correct option
    const correctOption = {
      id: questionVerse.id,
      surahNumber: questionVerse.surahNumber,
      surahName: questionVerse.surahName,
      verseNumber: questionVerse.verseNumber,
    }

    // Create pool for incorrect options (excluding the correct one)
    const incorrectOptionsPool = versePool
      .filter((v) => v.id !== questionVerse.id)
      .map((v) => ({
        id: v.id,
        surahNumber: v.surahNumber,
        surahName: v.surahName,
        verseNumber: v.verseNumber,
      }))
      .sort(() => Math.random() - 0.5)

    // Take needed number of incorrect options
    const incorrectOptions = incorrectOptionsPool.slice(0, optionsPerQuestion - 1)

    // Combine and shuffle all options
    const allOptions = [correctOption, ...incorrectOptions].sort(() => Math.random() - 0.5)

    return {
      question: questionVerse,
      options: allOptions,
    }
  })
}

