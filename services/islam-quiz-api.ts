// Service untuk mengakses API Muslim v2 dari myQuran

export interface QuizQuestion {
    id: string
    question: string
    options: string[]
    correctAnswer: string
    explanation?: string
    category: string
    difficulty: "easy" | "medium" | "hard"
  }
  
  // Base URL untuk API Muslim v2
  const API_BASE_URL = "https://api.myquran.com/v2"
  
  // Interface untuk respons dari API Doa
  interface DoaResponse {
    code: number
    message: string
    data: {
      id: string
      doa: string
      ayat: string
      latin: string
      artinya: string
    }[]
  }
  
  // Interface untuk respons dari API Asmaul Husna
  interface AsmaulHusnaResponse {
    code: number
    message: string
    data: {
      index: number
      latin: string
      arabic: string
      translation_id: string
      translation_en: string
    }[]
  }
  
  // Interface untuk respons dari API Surah
  interface SurahResponse {
    code: number
    message: string
    data: {
      number: number
      sequence: number
      numberOfVerses: number
      name: {
        short: string
        long: string
        transliteration: {
          id: string
          en: string
        }
        translation: {
          id: string
          en: string
        }
      }
      revelation: {
        arab: string
        id: string
        en: string
      }
      tafsir: {
        id: string
      }
      verses: {
        number: {
          inSurah: number
          inQuran: number
        }
        meta: {
          juz: number
          page: number
          manzil: number
          ruku: number
          hizbQuarter: number
          sajda: {
            recommended: boolean
            obligatory: boolean
          }
        }
        text: {
          arab: string
          transliteration: {
            en: string
          }
        }
        translation: {
          id: string
          en: string
        }
        audio: {
          primary: string
          secondary: string[]
        }
        tafsir: {
          id: {
            short: string
            long: string
          }
        }
      }[]
    }
  }
  
  // Interface untuk respons dari API Sholat
  interface SholatResponse {
    code: number
    message: string
    data: {
      id: string
      lokasi: string
      daerah: string
      jadwal: {
        tanggal: string
        imsak: string
        subuh: string
        terbit: string
        dhuha: string
        dzuhur: string
        ashar: string
        maghrib: string
        isya: string
        date: string
      }
    }
  }
  
  // Tambahkan timeout untuk API calls
  const fetchWithTimeout = async (url: string, options = {}, timeout = 5000) => {
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), timeout)
  
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      })
      clearTimeout(id)
      return response
    } catch (error) {
      clearTimeout(id)
      throw error
    }
  }
  
  /**
   * Fungsi untuk mengambil data doa dari API
   * @returns Promise dengan data doa
   */
  export async function fetchDoa(): Promise<DoaResponse["data"]> {
    try {
      console.log("Fetching doa data from API...")
      const response = await fetchWithTimeout(`${API_BASE_URL}/doa`, {}, 5000)
  
      if (!response.ok) {
        console.error(`Failed to fetch doa: ${response.status} ${response.statusText}`)
        throw new Error(`Failed to fetch doa: ${response.status} ${response.statusText}`)
      }
  
      const data: DoaResponse = await response.json()
      console.log("Doa data fetched successfully")
      return data.data
    } catch (error) {
      console.error("Error fetching doa:", error)
      throw error
    }
  }
  
  /**
   * Fungsi untuk mengambil data asmaul husna dari API
   * @returns Promise dengan data asmaul husna
   */
  export async function fetchAsmaulHusna(): Promise<AsmaulHusnaResponse["data"]> {
    try {
      console.log("Fetching asmaul husna data from API...")
      const response = await fetchWithTimeout(`${API_BASE_URL}/asmaul-husna`, {}, 5000)
  
      if (!response.ok) {
        console.error(`Failed to fetch asmaul husna: ${response.status} ${response.statusText}`)
        throw new Error(`Failed to fetch asmaul husna: ${response.status} ${response.statusText}`)
      }
  
      const data: AsmaulHusnaResponse = await response.json()
      console.log("Asmaul husna data fetched successfully")
      return data.data
    } catch (error) {
      console.error("Error fetching asmaul husna:", error)
      throw error
    }
  }
  
  /**
   * Fungsi untuk mengambil data surah dari API
   * @param surahNumber Nomor surah (1-114)
   * @returns Promise dengan data surah
   */
  export async function fetchSurah(surahNumber: number): Promise<SurahResponse["data"]> {
    try {
      console.log(`Fetching surah ${surahNumber} data from API...`)
      const response = await fetchWithTimeout(`${API_BASE_URL}/quran/surah/${surahNumber}`, {}, 5000)
  
      if (!response.ok) {
        console.error(`Failed to fetch surah: ${response.status} ${response.statusText}`)
        throw new Error(`Failed to fetch surah: ${response.status} ${response.statusText}`)
      }
  
      const data: SurahResponse = await response.json()
      console.log(`Surah ${surahNumber} data fetched successfully`)
      return data.data
    } catch (error) {
      console.error(`Error fetching surah ${surahNumber}:`, error)
      throw error
    }
  }
  
  /**
   * Fungsi untuk mengambil data jadwal sholat dari API
   * @param cityId ID kota
   * @param date Tanggal (YYYY/MM/DD)
   * @returns Promise dengan data jadwal sholat
   */
  export async function fetchJadwalSholat(cityId: string, date: string): Promise<SholatResponse["data"]> {
    try {
      console.log(`Fetching jadwal sholat for city ${cityId} on ${date} from API...`)
      const response = await fetchWithTimeout(`${API_BASE_URL}/sholat/jadwal/${cityId}/${date}`, {}, 5000)
  
      if (!response.ok) {
        console.error(`Failed to fetch jadwal sholat: ${response.status} ${response.statusText}`)
        throw new Error(`Failed to fetch jadwal sholat: ${response.status} ${response.statusText}`)
      }
  
      const data: SholatResponse = await response.json()
      console.log(`Jadwal sholat data fetched successfully`)
      return data.data
    } catch (error) {
      console.error("Error fetching jadwal sholat:", error)
      throw error
    }
  }
  
  /**
   * Fungsi untuk menghasilkan pertanyaan kuis dari data doa
   * @param doaData Data doa dari API
   * @returns Array pertanyaan kuis
   */
  export function generateDoaQuizQuestions(doaData: DoaResponse["data"]): QuizQuestion[] {
    const questions: QuizQuestion[] = []
  
    // Acak urutan doa
    const shuffledDoa = [...doaData].sort(() => Math.random() - 0.5)
  
    // Ambil 10 doa pertama untuk pertanyaan
    const selectedDoa = shuffledDoa.slice(0, 10)
  
    selectedDoa.forEach((doa, index) => {
      // Buat opsi jawaban (1 benar, 3 salah)
      const correctOption = doa.artinya
      const otherOptions = shuffledDoa
        .filter((d) => d.id !== doa.id)
        .slice(0, 3)
        .map((d) => d.artinya)
  
      const options = [...otherOptions, correctOption].sort(() => Math.random() - 0.5)
  
      questions.push({
        id: `doa-${index}`,
        question: `Apa arti dari doa: "${doa.doa}"?`,
        options,
        correctAnswer: correctOption,
        explanation: `Doa ini dalam bahasa Arab berbunyi: "${doa.ayat}" dan dalam latin dibaca: "${doa.latin}"`,
        category: "Doa",
        difficulty: "medium",
      })
    })
  
    return questions
  }
  
  /**
   * Fungsi untuk menghasilkan pertanyaan kuis dari data asmaul husna
   * @param asmaulHusnaData Data asmaul husna dari API
   * @returns Array pertanyaan kuis
   */
  export function generateAsmaulHusnaQuizQuestions(asmaulHusnaData: AsmaulHusnaResponse["data"]): QuizQuestion[] {
    const questions: QuizQuestion[] = []
  
    // Acak urutan asmaul husna
    const shuffledAsma = [...asmaulHusnaData].sort(() => Math.random() - 0.5)
  
    // Ambil 10 asma pertama untuk pertanyaan
    const selectedAsma = shuffledAsma.slice(0, 10)
  
    selectedAsma.forEach((asma, index) => {
      // Buat opsi jawaban (1 benar, 3 salah)
      const correctOption = asma.translation_id
      const otherOptions = shuffledAsma
        .filter((a) => a.index !== asma.index)
        .slice(0, 3)
        .map((a) => a.translation_id)
  
      const options = [...otherOptions, correctOption].sort(() => Math.random() - 0.5)
  
      questions.push({
        id: `asma-${index}`,
        question: `Apa arti dari Asmaul Husna: "${asma.latin}" (${asma.arabic})?`,
        options,
        correctAnswer: correctOption,
        explanation: `${asma.latin} (${asma.arabic}) adalah salah satu dari 99 nama Allah yang berarti "${asma.translation_id}"`,
        category: "Asmaul Husna",
        difficulty: "medium",
      })
    })
  
    return questions
  }
  
  /**
   * Fungsi untuk menghasilkan pertanyaan kuis dari data surah
   * @param surahData Data surah dari API
   * @returns Array pertanyaan kuis
   */
  export function generateSurahQuizQuestions(surahData: SurahResponse["data"]): QuizQuestion[] {
    const questions: QuizQuestion[] = []
  
    // Ambil beberapa ayat acak dari surah
    const verses = surahData.verses
    const shuffledVerses = [...verses].sort(() => Math.random() - 0.5).slice(0, 5)
  
    shuffledVerses.forEach((verse) => {
      // Buat pertanyaan tentang arti ayat
      const correctOption = verse.translation.id
      const otherOptions = verses
        .filter((v) => v.number.inSurah !== verse.number.inSurah)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map((v) => v.translation.id)
  
      const options = [...otherOptions, correctOption].sort(() => Math.random() - 0.5)
  
      questions.push({
        id: `surah-${surahData.number}-verse-${verse.number.inSurah}`,
        question: `Apa arti dari ayat berikut: "${verse.text.arab}"?`,
        options,
        correctAnswer: correctOption,
        explanation: `Ayat ini adalah Surah ${surahData.name.transliteration.id} ayat ${verse.number.inSurah}`,
        category: "Al-Quran",
        difficulty: "hard",
      })
    })
  
    return questions
  }
  
  /**
   * Fungsi untuk menghasilkan pertanyaan kuis dari data jadwal sholat
   * @param sholatData Data jadwal sholat dari API
   * @returns Array pertanyaan kuis
   */
  export function generateSholatQuizQuestions(sholatData: SholatResponse["data"]): QuizQuestion[] {
    const questions: QuizQuestion[] = []
  
    // Buat pertanyaan tentang waktu sholat
    const waktuSholat = [
      { nama: "Subuh", waktu: sholatData.jadwal.subuh },
      { nama: "Dzuhur", waktu: sholatData.jadwal.dzuhur },
      { nama: "Ashar", waktu: sholatData.jadwal.ashar },
      { nama: "Maghrib", waktu: sholatData.jadwal.maghrib },
      { nama: "Isya", waktu: sholatData.jadwal.isya },
    ]
  
    waktuSholat.forEach((sholat, index) => {
      const correctOption = sholat.waktu
      const otherOptions = waktuSholat.filter((s) => s.nama !== sholat.nama).map((s) => s.waktu)
  
      const options = [...otherOptions, correctOption].sort(() => Math.random() - 0.5)
  
      questions.push({
        id: `sholat-${index}`,
        question: `Pada tanggal ${sholatData.jadwal.tanggal} di ${sholatData.lokasi}, ${sholatData.daerah}, jam berapakah waktu sholat ${sholat.nama}?`,
        options,
        correctAnswer: correctOption,
        explanation: `Waktu sholat ${sholat.nama} pada tanggal ${sholatData.jadwal.tanggal} di ${sholatData.lokasi} adalah pukul ${sholat.waktu}`,
        category: "Sholat",
        difficulty: "easy",
      })
    })
  
    return questions
  }
  
  /**
   * Fungsi utama untuk mengambil data kuis dari berbagai sumber API
   * @param category Kategori kuis (doa, asmaul-husna, quran, sholat)
   * @param difficulty Tingkat kesulitan (easy, medium, hard)
   * @param limit Jumlah pertanyaan yang diinginkan
   * @returns Promise dengan data kuis
   */
  export async function fetchIslamicQuiz(
    category?: string,
    difficulty?: "easy" | "medium" | "hard",
    limit = 10,
  ): Promise<QuizQuestion[]> {
    console.log(
      `Fetching Islamic quiz with category: ${category || "all"}, difficulty: ${difficulty || "all"}, limit: ${limit}`,
    )
  
    try {
      let questions: QuizQuestion[] = []
      let apiSuccess = false
  
      // Coba ambil data dari API dengan timeout
      try {
        // Ambil data berdasarkan kategori
        if (!category || category.toLowerCase() === "doa") {
          console.log("Attempting to fetch doa data...")
          try {
            const doaData = await fetchDoa()
            questions = [...questions, ...generateDoaQuizQuestions(doaData)]
            apiSuccess = true
            console.log("Successfully generated doa questions")
          } catch (error) {
            console.error("Failed to fetch doa data, using fallback:", error)
          }
        }
  
        if (!category || category.toLowerCase() === "asmaul-husna") {
          console.log("Attempting to fetch asmaul husna data...")
          try {
            const asmaulHusnaData = await fetchAsmaulHusna()
            questions = [...questions, ...generateAsmaulHusnaQuizQuestions(asmaulHusnaData)]
            apiSuccess = true
            console.log("Successfully generated asmaul husna questions")
          } catch (error) {
            console.error("Failed to fetch asmaul husna data, using fallback:", error)
          }
        }
  
        if (!category || category.toLowerCase() === "quran") {
          console.log("Attempting to fetch quran data...")
          try {
            // Ambil beberapa surah acak
            const randomSurahNumbers = Array.from({ length: 3 }, () => Math.floor(Math.random() * 114) + 1)
            console.log(`Selected random surah numbers: ${randomSurahNumbers.join(", ")}`)
  
            for (const num of randomSurahNumbers) {
              try {
                const surah = await fetchSurah(num)
                questions = [...questions, ...generateSurahQuizQuestions(surah)]
                apiSuccess = true
                console.log(`Successfully generated questions for surah ${num}`)
              } catch (error) {
                console.error(`Failed to fetch surah ${num}, skipping:`, error)
              }
            }
          } catch (error) {
            console.error("Failed to fetch quran data, using fallback:", error)
          }
        }
  
        if (!category || category.toLowerCase() === "sholat") {
          console.log("Attempting to fetch sholat data...")
          try {
            // Ambil jadwal sholat untuk Jakarta hari ini
            const today = new Date()
            const dateStr = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, "0")}/${String(today.getDate()).padStart(2, "0")}`
            console.log(`Using date: ${dateStr} for sholat schedule`)
  
            const sholatData = await fetchJadwalSholat("1301", dateStr) // 1301 adalah ID untuk Jakarta
            questions = [...questions, ...generateSholatQuizQuestions(sholatData)]
            apiSuccess = true
            console.log("Successfully generated sholat questions")
          } catch (error) {
            console.error("Failed to fetch sholat data, using fallback:", error)
          }
        }
      } catch (error) {
        console.error("Error fetching from API, will use fallback data:", error)
      }
  
      // Jika tidak ada data yang berhasil diambil dari API, gunakan data fallback
      if (!apiSuccess || questions.length === 0) {
        console.log("No data successfully fetched from API, using fallback data")
        questions = filterFallbackData(category, difficulty, limit * 2) // Ambil lebih banyak untuk variasi
      }
  
      // Filter berdasarkan tingkat kesulitan jika ada
      if (difficulty) {
        questions = questions.filter((q) => q.difficulty === difficulty)
        console.log(`Filtered to ${questions.length} questions with difficulty: ${difficulty}`)
      }
  
      // Jika masih tidak ada pertanyaan yang cocok, gunakan semua data fallback
      if (questions.length === 0) {
        console.log("No questions match the criteria, using all fallback data")
        questions = [...fallbackQuizData]
      }
  
      // Acak urutan pertanyaan
      questions = questions.sort(() => Math.random() - 0.5)
  
      // Batasi jumlah pertanyaan
      const result = questions.slice(0, limit)
      console.log(`Returning ${result.length} questions`)
      return result
    } catch (error) {
      console.error("Critical error in fetchIslamicQuiz, using fallback data:", error)
      // Pastikan selalu mengembalikan data meskipun terjadi error
      return filterFallbackData(category, difficulty, limit)
    }
  }
  
  // Data fallback jika API tidak tersedia
  const fallbackQuizData: QuizQuestion[] = [
    {
      id: "1",
      question: "Siapakah nabi terakhir dalam Islam?",
      options: ["Nabi Isa AS", "Nabi Muhammad SAW", "Nabi Musa AS", "Nabi Ibrahim AS"],
      correctAnswer: "Nabi Muhammad SAW",
      explanation: "Nabi Muhammad SAW adalah nabi dan rasul terakhir yang diutus Allah SWT.",
      category: "Aqidah",
      difficulty: "easy",
    },
    {
      id: "2",
      question: "Berapa jumlah rakaat shalat Maghrib?",
      options: ["2 rakaat", "3 rakaat", "4 rakaat", "5 rakaat"],
      correctAnswer: "3 rakaat",
      explanation: "Shalat Maghrib terdiri dari 3 rakaat, dengan 2 rakaat pertama dibaca dengan suara keras.",
      category: "Sholat",
      difficulty: "easy",
    },
    {
      id: "3",
      question: "Apa nama kitab suci umat Islam?",
      options: ["Taurat", "Zabur", "Injil", "Al-Quran"],
      correctAnswer: "Al-Quran",
      explanation: "Al-Quran adalah kitab suci umat Islam yang diturunkan kepada Nabi Muhammad SAW.",
      category: "Aqidah",
      difficulty: "easy",
    },
    {
      id: "4",
      question: "Kapan Nabi Muhammad SAW lahir?",
      options: ["570 M", "571 M", "610 M", "632 M"],
      correctAnswer: "570 M",
      explanation: "Nabi Muhammad SAW lahir pada tahun 570 M yang dikenal sebagai tahun Gajah.",
      category: "Sejarah",
      difficulty: "medium",
    },
    {
      id: "5",
      question: "Apa nama malaikat yang menyampaikan wahyu kepada Nabi Muhammad SAW?",
      options: ["Jibril", "Mikail", "Israfil", "Izrail"],
      correctAnswer: "Jibril",
      explanation: "Malaikat Jibril bertugas menyampaikan wahyu dari Allah SWT kepada para nabi dan rasul.",
      category: "Aqidah",
      difficulty: "easy",
    },
    {
      id: "6",
      question: "Berapa jumlah rukun Islam?",
      options: ["3", "4", "5", "6"],
      correctAnswer: "5",
      explanation: "Rukun Islam ada 5: syahadat, shalat, zakat, puasa Ramadhan, dan haji bagi yang mampu.",
      category: "Aqidah",
      difficulty: "easy",
    },
    {
      id: "7",
      question: "Apa nama peristiwa perpindahan Nabi Muhammad SAW dari Mekah ke Madinah?",
      options: ["Isra Mi'raj", "Hijrah", "Fathu Makkah", "Haji Wada"],
      correctAnswer: "Hijrah",
      explanation: "Hijrah adalah perpindahan Nabi Muhammad SAW dan para sahabat dari Mekah ke Madinah.",
      category: "Sejarah",
      difficulty: "easy",
    },
    {
      id: "8",
      question: "Siapakah khalifah pertama setelah wafatnya Nabi Muhammad SAW?",
      options: ["Abu Bakar Ash-Shiddiq", "Umar bin Khattab", "Utsman bin Affan", "Ali bin Abi Thalib"],
      correctAnswer: "Abu Bakar Ash-Shiddiq",
      explanation: "Abu Bakar Ash-Shiddiq adalah khalifah pertama dalam periode Khulafaur Rasyidin.",
      category: "Sejarah",
      difficulty: "medium",
    },
    {
      id: "9",
      question: "Apa nama bulan puasa dalam Islam?",
      options: ["Syawal", "Rajab", "Ramadhan", "Dzulhijjah"],
      correctAnswer: "Ramadhan",
      explanation: "Ramadhan adalah bulan ke-9 dalam kalender Hijriyah dan merupakan bulan puasa bagi umat Islam.",
      category: "Ibadah",
      difficulty: "easy",
    },
    {
      id: "10",
      question: "Berapa jumlah rakaat shalat Tarawih yang biasa dilakukan?",
      options: ["8 rakaat", "11 rakaat", "20 rakaat", "23 rakaat"],
      correctAnswer: "20 rakaat",
      explanation: "Shalat Tarawih umumnya dilakukan sebanyak 20 rakaat, meskipun ada juga yang melakukan 8 rakaat.",
      category: "Sholat",
      difficulty: "medium",
    },
    {
      id: "11",
      question: "Apa arti dari Asmaul Husna 'Ar-Rahman'?",
      options: ["Yang Maha Penyayang", "Yang Maha Pengasih", "Yang Maha Perkasa", "Yang Maha Adil"],
      correctAnswer: "Yang Maha Pengasih",
      explanation: "Ar-Rahman adalah salah satu dari 99 Asmaul Husna yang berarti Yang Maha Pengasih.",
      category: "Asmaul Husna",
      difficulty: "medium",
    },
    {
      id: "12",
      question: "Doa apa yang dibaca ketika berbuka puasa?",
      options: [
        "Allahumma laka sumtu wa bika aamantu wa 'alaika tawakkaltu wa 'alaa rizqika afthartu",
        "Bismillahi tawakkaltu 'alallah, laa haula wa laa quwwata illa billah",
        "Allahumma innii as-aluka 'ilman naafi'an, wa rizqan thayyiban, wa 'amalan mutaqabbalan",
        "Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina 'adzaban-nar",
      ],
      correctAnswer: "Allahumma laka sumtu wa bika aamantu wa 'alaika tawakkaltu wa 'alaa rizqika afthartu",
      explanation:
        "Doa berbuka puasa adalah 'Allahumma laka sumtu wa bika aamantu wa 'alaika tawakkaltu wa 'alaa rizqika afthartu' yang artinya 'Ya Allah, untuk-Mu aku berpuasa, dengan-Mu aku beriman, kepada-Mu aku bertawakal, dan dengan rezeki-Mu aku berbuka'.",
      category: "Doa",
      difficulty: "medium",
    },
  ]
  
  /**
   * Fungsi untuk memfilter data fallback sesuai parameter
   */
  function filterFallbackData(category?: string, difficulty?: "easy" | "medium" | "hard", limit = 10): QuizQuestion[] {
    let filteredData = [...fallbackQuizData]
  
    // Filter berdasarkan kategori jika ada
    if (category) {
      filteredData = filteredData.filter((q) => q.category.toLowerCase() === category.toLowerCase())
    }
  
    // Filter berdasarkan tingkat kesulitan jika ada
    if (difficulty) {
      filteredData = filteredData.filter((q) => q.difficulty === difficulty)
    }
  
    // Acak urutan pertanyaan
    filteredData = filteredData.sort(() => Math.random() - 0.5)
  
    // Batasi jumlah pertanyaan
    return filteredData.slice(0, limit)
  }
  
  /**
   * Fungsi untuk mendapatkan kategori kuis yang tersedia
   */
  export function getAvailableCategories(): string[] {
    return ["Doa", "Asmaul Husna", "Al-Quran", "Sholat", "Aqidah", "Sejarah", "Ibadah"]
  }
  
  /**
   * Fungsi untuk mendapatkan tingkat kesulitan yang tersedia
   */
  export function getAvailableDifficulties(): string[] {
    return ["easy", "medium", "hard"]
  }
  
  