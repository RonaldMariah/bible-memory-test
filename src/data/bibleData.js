/**
 * Utility for fetching Bible verses from aruljohn/Bible-kjv GitHub repo
 * Uses raw content from GitHub for direct JSON access
 */

const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/aruljohn/Bible-kjv/master/';

// Map of Bible book names to their JSON filenames
const BOOK_NAMES = {
  'Genesis': 'Genesis.json',
  'Exodus': 'Exodus.json',
  'Leviticus': 'Leviticus.json',
  'Numbers': 'Numbers.json',
  'Deuteronomy': 'Deuteronomy.json',
  'Joshua': 'Joshua.json',
  'Judges': 'Judges.json',
  'Ruth': 'Ruth.json',
  '1 Samuel': '1Samuel.json',
  '2 Samuel': '2Samuel.json',
  '1 Kings': '1Kings.json',
  '2 Kings': '2Kings.json',
  '1 Chronicles': '1Chronicles.json',
  '2 Chronicles': '2Chronicles.json',
  'Ezra': 'Ezra.json',
  'Nehemiah': 'Nehemiah.json',
  'Esther': 'Esther.json',
  'Job': 'Job.json',
  'Psalms': 'Psalms.json',
  'Proverbs': 'Proverbs.json',
  'Ecclesiastes': 'Ecclesiastes.json',
  'Isaiah': 'Isaiah.json',
  'Jeremiah': 'Jeremiah.json',
  'Lamentations': 'Lamentations.json',
  'Ezekiel': 'Ezekiel.json',
  'Daniel': 'Daniel.json',
  'Hosea': 'Hosea.json',
  'Joel': 'Joel.json',
  'Amos': 'Amos.json',
  'Obadiah': 'Obadiah.json',
  'Jonah': 'Jonah.json',
  'Micah': 'Micah.json',
  'Nahum': 'Nahum.json',
  'Habakkuk': 'Habakkuk.json',
  'Zephaniah': 'Zephaniah.json',
  'Haggai': 'Haggai.json',
  'Zechariah': 'Zechariah.json',
  'Malachi': 'Malachi.json',
  'Matthew': 'Matthew.json',
  'Mark': 'Mark.json',
  'Luke': 'Luke.json',
  'John': 'John.json',
  'Acts': 'Acts.json',
  'Romans': 'Romans.json',
  '1 Corinthians': '1Corinthians.json',
  '2 Corinthians': '2Corinthians.json',
  'Galatians': 'Galatians.json',
  'Ephesians': 'Ephesians.json',
  'Philippians': 'Philippians.json',
  'Colossians': 'Colossians.json',
  '1 Thessalonians': '1Thessalonians.json',
  '2 Thessalonians': '2Thessalonians.json',
  '1 Timothy': '1Timothy.json',
  '2 Timothy': '2Timothy.json',
  'Titus': 'Titus.json',
  'Philemon': 'Philemon.json',
  'Hebrews': 'Hebrews.json',
  'James': 'James.json',
  '1 Peter': '1Peter.json',
  '2 Peter': '2Peter.json',
  '1 John': '1John.json',
  '2 John': '2John.json',
  '3 John': '3John.json',
  'Jude': 'Jude.json',
  'Revelation': 'Revelation.json'
};

// Cache for fetched Bible data
const bibleCache = {};

/**
 * Fetch a specific verse from the Bible
 * @param {string} book - Book name (e.g., "John", "Psalms")
 * @param {number} chapter - Chapter number
 * @param {number} verse - Verse number
 * @returns {Promise<{text: string, reference: string}|null>} Verse text or null if not found
 */
export async function getVerse(book, chapter, verse) {
  try {
    // Normalize book name for filename lookup
    const fileName = BOOK_NAMES[book];
    if (!fileName) {
      console.error(`Unknown book: ${book}`);
      return null;
    }

    // Check cache first
    if (!bibleCache[book]) {
      const url = `${GITHUB_RAW_URL}${fileName}`;
      const response = await fetch(url);
      if (!response.ok) {
        console.error(`Failed to fetch ${book}: ${response.status}`);
        return null;
      }
      bibleCache[book] = await response.json();
    }

    const bookData = bibleCache[book];
    
    // Handle both array and object structures for chapters
    let chapterData;
    if (Array.isArray(bookData.chapters)) {
      // If chapters is an array, chapter numbers are indices
      chapterData = bookData.chapters[chapter - 1];
    } else {
      // If chapters is an object, try both string and number keys
      chapterData = bookData.chapters[chapter] || bookData.chapters[chapter.toString()];
    }
    
    if (!chapterData) {
      console.error(`Chapter ${chapter} not found in ${book}`, bookData.chapters);
      return null;
    }

    // Handle both array and object structures for verses
    let verseData;
    if (Array.isArray(chapterData.verses)) {
      // If verses is an array, verse numbers are indices
      verseData = chapterData.verses[verse - 1];
    } else {
      // If verses is an object, try both string and number keys
      verseData = chapterData.verses[verse] || chapterData.verses[verse.toString()];
    }
    
    if (!verseData) {
      console.error(`Verse ${verse} not found in ${book} ${chapter}`, chapterData.verses);
      return null;
    }

    return {
      text: verseData.text,
      reference: `${book} ${chapter}:${verse}`
    };
  } catch (error) {
    console.error(`Error fetching verse: ${error.message}`);
    return null;
  }
}

/**
 * Get list of available books
 * @returns {string[]} Array of book names
 */
export function getBooks() {
  return Object.keys(BOOK_NAMES).sort();
}

/**
 * Get available chapters for a book
 * @param {string} book - Book name
 * @returns {Promise<number[]>} Array of chapter numbers
 */
export async function getChapters(book) {
  try {
    const fileName = BOOK_NAMES[book];
    if (!fileName) {
      return [];
    }

    if (!bibleCache[book]) {
      const url = `${GITHUB_RAW_URL}${fileName}`;
      const response = await fetch(url);
      if (!response.ok) {
        return [];
      }
      bibleCache[book] = await response.json();
    }

    const bookData = bibleCache[book];
    
    // Handle both array and object structures
    if (Array.isArray(bookData.chapters)) {
      // If chapters is an array, return 1-indexed chapter numbers
      return bookData.chapters.map((_, idx) => idx + 1);
    } else {
      // If chapters is an object, parse the keys as numbers
      return Object.keys(bookData.chapters)
        .map(num => parseInt(num))
        .sort((a, b) => a - b);
    }
  } catch (error) {
    console.error(`Error getting chapters for ${book}: ${error.message}`);
    return [];
  }
}

/**
 * Get available verses for a chapter
 * @param {string} book - Book name
 * @param {number} chapter - Chapter number
 * @returns {Promise<number[]>} Array of verse numbers
 */
export async function getVerses(book, chapter) {
  try {
    const fileName = BOOK_NAMES[book];
    if (!fileName) {
      return [];
    }

    if (!bibleCache[book]) {
      const url = `${GITHUB_RAW_URL}${fileName}`;
      const response = await fetch(url);
      if (!response.ok) {
        return [];
      }
      bibleCache[book] = await response.json();
    }

    const bookData = bibleCache[book];
    
    // Handle both array and object structures for chapters
    let chapterData;
    if (Array.isArray(bookData.chapters)) {
      chapterData = bookData.chapters[chapter - 1];
    } else {
      chapterData = bookData.chapters[chapter] || bookData.chapters[chapter.toString()];
    }
    
    if (!chapterData) {
      return [];
    }

    // Handle both array and object structures for verses
    if (Array.isArray(chapterData.verses)) {
      // If verses is an array, return 1-indexed verse numbers
      return chapterData.verses.map((_, idx) => idx + 1);
    } else {
      // If verses is an object, parse the keys as numbers
      return Object.keys(chapterData.verses)
        .map(num => parseInt(num))
        .sort((a, b) => a - b);
    }
  } catch (error) {
    console.error(`Error getting verses for ${book} ${chapter}: ${error.message}`);
    return [];
  }
}

export default {
  getVerse,
  getBooks,
  getChapters,
  getVerses,
  BOOK_NAMES
};
