/**
 * Utility for reading Bible verses from local JSON files
 * Data source: https://github.com/bobuk/holybooks/tree/master/EN
 */

// Array of Bible book names in biblical order
const BOOKS_IN_ORDER = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
  'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings',
  '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah', 'Esther',
  'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Isaiah', 'Jeremiah', 'Lamentations',
  'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah',
  'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
  'Matthew', 'Mark', 'Luke', 'John', 'Acts',
  'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
  'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
  '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James',
  '1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude', 'Revelation'
];

// Map of Bible book names to their 3-letter directory codes
const BOOK_CODES = {
  // Old Testament
  'Genesis': 'GEN',
  'Exodus': 'EXO',
  'Leviticus': 'LEV',
  'Numbers': 'NUM',
  'Deuteronomy': 'DEU',
  'Joshua': 'JOS',
  'Judges': 'JDG',
  'Ruth': 'RUT',
  '1 Samuel': '1SA',
  '2 Samuel': '2SA',
  '1 Kings': '1KI',
  '2 Kings': '2KI',
  '1 Chronicles': '1CH',
  '2 Chronicles': '2CH',
  'Ezra': 'EZR',
  'Nehemiah': 'NEH',
  'Esther': 'EST',
  'Job': 'JOB',
  'Psalms': 'PSA',
  'Proverbs': 'PRO',
  'Ecclesiastes': 'ECC',
  'Isaiah': 'ISA',
  'Jeremiah': 'JER',
  'Lamentations': 'LAM',
  'Ezekiel': 'EZK',
  'Daniel': 'DAN',
  'Hosea': 'HOS',
  'Joel': 'JOL',
  'Amos': 'AMO',
  'Obadiah': 'OBA',
  'Jonah': 'JON',
  'Micah': 'MIC',
  'Nahum': 'NAM',
  'Habakkuk': 'HAB',
  'Zephaniah': 'ZEP',
  'Haggai': 'HAG',
  'Zechariah': 'ZEC',
  'Malachi': 'MAL',
  // New Testament
  'Matthew': 'MAT',
  'Mark': 'MRK',
  'Luke': 'LUK',
  'John': 'JHN',
  'Acts': 'ACT',
  'Romans': 'ROM',
  '1 Corinthians': '1CO',
  '2 Corinthians': '2CO',
  'Galatians': 'GAL',
  'Ephesians': 'EPH',
  'Philippians': 'PHP',
  'Colossians': 'COL',
  '1 Thessalonians': '1TH',
  '2 Thessalonians': '2TH',
  '1 Timothy': '1TI',
  '2 Timothy': '2TI',
  'Titus': 'TIT',
  'Philemon': 'PHM',
  'Hebrews': 'HEB',
  'James': 'JAS',
  '1 Peter': '1PE',
  '2 Peter': '2PE',
  '1 John': '1JN',
  '2 John': '2JN',
  '3 John': '3JN',
  'Jude': 'JUD',
  'Revelation': 'REV'
};

// Available Bible translations
export const AVAILABLE_TRANSLATIONS = [
  { id: 'AMP', name: 'The Amplified Bible' },
  { id: 'ASV', name: 'American Standard Version' },
  { id: 'CPDV', name: 'Catholic Public Domain Version' },
  { id: 'ERV', name: 'English Revised Version' },
  { id: 'ESV', name: 'English Standard Version' },
  { id: 'KJV', name: 'King James Version' },
  { id: 'NASB', name: 'New American Standard Bible' },
  { id: 'WEB', name: 'World English Bible' }
];

// Cache for parsed Bible data - keys are "[book]:[translation]"
const bibleCache = {};

/**
 * Determine if a book is in the Old Testament or New Testament
 * @param {string} bookCode - 3-letter book code
 * @returns {string} Either 'OT' or 'NT'
 */
function getTestament(bookCode) {
  // Books from Matthew onwards are New Testament
  const NT_START_CODE = 'MAT';
  const NT_CODES = ['MAT', 'MRK', 'LUK', 'JHN', 'ACT', 'ROM', '1CO', '2CO', 'GAL', 
                     'EPH', 'PHP', 'COL', '1TH', '2TH', '1TI', '2TI', 'TIT', 'PHM', 
                     'HEB', 'JAS', '1PE', '2PE', '1JN', '2JN', '3JN', 'JUD', 'REV'];
  return NT_CODES.includes(bookCode) ? 'NT' : 'OT';
}

/**
 * Parse JSON content into structured chapter/verse data
 * @param {Object} jsonData - Parsed JSON data from the translation file
 * @param {string} bookName - Name of the book for reference
 * @returns {Object} Structured book data with chapters and verses
 */
function parseJsonContent(jsonData, bookName) {
  const chapters = {};
  
  // Navigate through the nested text arrays
  if (!jsonData.text || !Array.isArray(jsonData.text)) {
    console.error(`Invalid JSON structure for ${bookName}`);
    return { name: bookName, chapters: {} };
  }

  // Iterate through chapters (first level of text array)
  jsonData.text.forEach((chapterData, chapterIndex) => {
    const chapterNum = chapterIndex + 1;
    const chapterVerses = {};

    // Each chapter has a text array with verses
    if (chapterData.text && Array.isArray(chapterData.text)) {
      chapterData.text.forEach((verseData) => {
        if (verseData.ID && verseData.text) {
          const verseNum = parseInt(verseData.ID);
          // Skip empty verses
          if (verseData.text.trim()) {
            chapterVerses[verseNum] = {
              text: verseData.text.trim()
            };
          }
        }
      });
    }

    if (Object.keys(chapterVerses).length > 0) {
      chapters[chapterNum] = { verses: chapterVerses };
    }
  });

  return {
    name: bookName,
    chapters: chapters
  };
}

/**
 * Load JSON file from GitHub holybooks repository
 * @param {string} bookCode - 3-letter book code
 * @param {string} translation - Translation ID (e.g., 'ESV', 'KJV')
 * @returns {Promise<Object>} Parsed JSON data
 */
async function loadJsonFile(bookCode, translation) {
  try {
    const testament = getTestament(bookCode);
    const url = `https://raw.githubusercontent.com/bobuk/holybooks/master/EN/${testament}/${bookCode}/${translation}.json`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    throw new Error(`Failed to load ${translation} for ${bookCode}: ${error.message}`);
  }
}

/**
 * Fetch a specific verse from the Bible
 * @param {string} book - Book name (e.g., "John", "Psalms")
 * @param {number} chapter - Chapter number
 * @param {number} verse - Verse number
 * @param {string} translation - Translation ID (default: 'ESV')
 * @returns {Promise<{text: string, reference: string, translation: string}|null>} Verse text or null if not found
 */
export async function getVerse(book, chapter, verse, translation = 'ESV') {
  try {
    // Normalize book name and get book code
    const bookCode = BOOK_CODES[book];
    if (!bookCode) {
      console.error(`Unknown book: ${book}`);
      return null;
    }

    const cacheKey = `${book}:${translation}`;

    // Check cache first
    if (!bibleCache[cacheKey]) {
      try {
        const jsonData = await loadJsonFile(bookCode, translation);
        bibleCache[cacheKey] = parseJsonContent(jsonData, book);
      } catch (error) {
        console.error(`Failed to load ${book} (${translation}): ${error.message}`);
        return null;
      }
    }

    const bookData = bibleCache[cacheKey];
    
    // Get chapter data
    const chapterData = bookData.chapters[chapter];
    
    if (!chapterData) {
      console.error(`Chapter ${chapter} not found in ${book}`);
      return null;
    }

    // Get verse data
    const verseData = chapterData.verses[verse];
    
    if (!verseData) {
      console.error(`Verse ${verse} not found in ${book} ${chapter}`);
      return null;
    }

    return {
      text: verseData.text,
      reference: `${book} ${chapter}:${verse}`,
      translation: translation
    };
  } catch (error) {
    console.error(`Error fetching verse: ${error.message}`);
    return null;
  }
}

/**
 * Get list of available books in biblical order
 * @returns {string[]} Array of book names in biblical order
 */
export function getBooks() {
  return BOOKS_IN_ORDER;
}

/**
 * Get available chapters for a book
 * @param {string} book - Book name
 * @param {string} translation - Translation ID (default: 'ESV')
 * @returns {Promise<number[]>} Array of chapter numbers
 */
export async function getChapters(book, translation = 'ESV') {
  try {
    const bookCode = BOOK_CODES[book];
    if (!bookCode) {
      return [];
    }

    const cacheKey = `${book}:${translation}`;

    if (!bibleCache[cacheKey]) {
      try {
        const jsonData = await loadJsonFile(bookCode, translation);
        bibleCache[cacheKey] = parseJsonContent(jsonData, book);
      } catch (error) {
        console.error(`Failed to load ${book} (${translation}): ${error.message}`);
        return [];
      }
    }

    const bookData = bibleCache[cacheKey];
    
    // Get all chapter numbers from the chapters object
    return Object.keys(bookData.chapters)
      .map(num => parseInt(num))
      .sort((a, b) => a - b);
  } catch (error) {
    console.error(`Error getting chapters for ${book}: ${error.message}`);
    return [];
  }
}

/**
 * Get available verses for a chapter
 * @param {string} book - Book name
 * @param {number} chapter - Chapter number
 * @param {string} translation - Translation ID (default: 'ESV')
 * @returns {Promise<number[]>} Array of verse numbers
 */
export async function getVerses(book, chapter, translation = 'ESV') {
  try {
    const bookCode = BOOK_CODES[book];
    if (!bookCode) {
      return [];
    }

    const cacheKey = `${book}:${translation}`;

    if (!bibleCache[cacheKey]) {
      try {
        const jsonData = await loadJsonFile(bookCode, translation);
        bibleCache[cacheKey] = parseJsonContent(jsonData, book);
      } catch (error) {
        console.error(`Failed to load ${book} (${translation}): ${error.message}`);
        return [];
      }
    }

    const bookData = bibleCache[cacheKey];
    
    // Get chapter data
    const chapterData = bookData.chapters[chapter];
    
    if (!chapterData) {
      return [];
    }

    // Get all verse numbers from the verses object
    return Object.keys(chapterData.verses)
      .map(num => parseInt(num))
      .sort((a, b) => a - b);
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
  AVAILABLE_TRANSLATIONS,
  BOOK_CODES
};
