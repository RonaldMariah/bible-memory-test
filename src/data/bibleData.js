/**
 * Utility for reading Bible verses from GitHub repository
 * Source: https://github.com/lguenth/mdbible/tree/main/by_book
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

// Map of Bible book names to their markdown filenames
const BOOK_NAMES = {
  'Genesis': '01_Genesis.md',
  'Exodus': '02_Exodus.md',
  'Leviticus': '03_Leviticus.md',
  'Numbers': '04_Numbers.md',
  'Deuteronomy': '05_Deuteronomy.md',
  'Joshua': '06_Joshua.md',
  'Judges': '07_Judges.md',
  'Ruth': '08_Ruth.md',
  '1 Samuel': '09_I_Samuel.md',
  '2 Samuel': '10_II_Samuel.md',
  '1 Kings': '11_I_Kings.md',
  '2 Kings': '12_II_Kings.md',
  '1 Chronicles': '13_I_Chronicles.md',
  '2 Chronicles': '14_II_Chronicles.md',
  'Ezra': '15_Ezra.md',
  'Nehemiah': '16_Nehemiah.md',
  'Esther': '17_Esther.md',
  'Job': '18_Job.md',
  'Psalms': '19_Psalms.md',
  'Proverbs': '20_Proverbs.md',
  'Ecclesiastes': '21_Ecclesiastes.md',
  'Song of Solomon': '22_Song_of_Solomon.md',
  'Isaiah': '23_Isaiah.md',
  'Jeremiah': '24_Jeremiah.md',
  'Lamentations': '25_Lamentations.md',
  'Ezekiel': '26_Ezekiel.md',
  'Daniel': '27_Daniel.md',
  'Hosea': '28_Hosea.md',
  'Joel': '29_Joel.md',
  'Amos': '30_Amos.md',
  'Obadiah': '31_Obadiah.md',
  'Jonah': '32_Jonah.md',
  'Micah': '33_Micah.md',
  'Nahum': '34_Nahum.md',
  'Habakkuk': '35_Habakkuk.md',
  'Zephaniah': '36_Zephaniah.md',
  'Haggai': '37_Haggai.md',
  'Zechariah': '38_Zechariah.md',
  'Malachi': '39_Malachi.md',
  'Matthew': '40_Matthew.md',
  'Mark': '41_Mark.md',
  'Luke': '42_Luke.md',
  'John': '43_John.md',
  'Acts': '44_Acts.md',
  'Romans': '45_Romans.md',
  '1 Corinthians': '46_I_Corinthians.md',
  '2 Corinthians': '47_II_Corinthians.md',
  'Galatians': '48_Galatians.md',
  'Ephesians': '49_Ephesians.md',
  'Philippians': '50_Philippians.md',
  'Colossians': '51_Colossians.md',
  '1 Thessalonians': '52_I_Thessalonians.md',
  '2 Thessalonians': '53_II_Thessalonians.md',
  '1 Timothy': '54_I_Timothy.md',
  '2 Timothy': '55_II_Timothy.md',
  'Titus': '56_Titus.md',
  'Philemon': '57_Philemon.md',
  'Hebrews': '58_Hebrews.md',
  'James': '59_James.md',
  '1 Peter': '60_I_Peter.md',
  '2 Peter': '61_II_Peter.md',
  '1 John': '62_I_John.md',
  '2 John': '63_II_John.md',
  '3 John': '64_III_John.md',
  'Jude': '65_Jude.md',
  'Revelation': '66_Revelation_of_John.md'
};

// Cache for parsed Bible data
const bibleCache = {};

/**
 * Parse markdown content into structured chapter/verse data
 * @param {string} content - Raw markdown content
 * @param {string} bookName - Name of the book for reference
 * @returns {Object} Structured book data with chapters and verses
 */
function parseMarkdownContent(content, bookName) {
  const chapters = {};
  let currentChapter = null;
  let currentVerse = 0;
  let chapterVerses = {};

  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();

    // Check for chapter headers (## Chapter N)
    if (trimmed.startsWith('## Chapter ')) {
      // Save previous chapter if exists
      if (currentChapter !== null && Object.keys(chapterVerses).length > 0) {
        chapters[currentChapter] = { verses: chapterVerses };
      }

      const chapterMatch = trimmed.match(/## Chapter (\d+)/);
      if (chapterMatch) {
        currentChapter = parseInt(chapterMatch[1]);
        chapterVerses = {};
        currentVerse = 0;
      }
    }
    // Check for verse numbers at the start (number followed by period or space)
    else if (trimmed && /^\d+[\.\s]/.test(trimmed) && currentChapter !== null) {
      const verseMatch = trimmed.match(/^(\d+)[\.\s](.*)/);
      if (verseMatch) {
        currentVerse = parseInt(verseMatch[1]);
        chapterVerses[currentVerse] = { text: verseMatch[2] };
      }
    }
    // Append continuation of verse text
    else if (trimmed && currentChapter !== null && currentVerse > 0) {
      if (chapterVerses[currentVerse]) {
        chapterVerses[currentVerse].text += ' ' + trimmed;
      }
    }
  }

  // Save last chapter
  if (currentChapter !== null && Object.keys(chapterVerses).length > 0) {
    chapters[currentChapter] = { verses: chapterVerses };
  }

  return {
    name: bookName,
    chapters: chapters
  };
}

/**
 * Fetch markdown content from GitHub repository
 * @param {string} fileName - Filename in the by_book directory
 * @returns {Promise<string>} Raw markdown content
 */
async function fetchMarkdownFile(fileName) {
  try {
    const githubUrl = `https://raw.githubusercontent.com/lguenth/mdbible/main/by_book/${fileName}`;
    const response = await fetch(githubUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.text();
  } catch (error) {
    throw new Error(`Failed to load markdown file ${fileName}: ${error.message}`);
  }
}

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
      try {
        const content = await fetchMarkdownFile(fileName);
        bibleCache[book] = parseMarkdownContent(content, book);
      } catch (error) {
        console.error(`Failed to load ${book}: ${error.message}`);
        return null;
      }
    }

    const bookData = bibleCache[book];
    
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
      reference: `${book} ${chapter}:${verse}`
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
 * @returns {Promise<number[]>} Array of chapter numbers
 */
export async function getChapters(book) {
  try {
    const fileName = BOOK_NAMES[book];
    if (!fileName) {
      return [];
    }

    if (!bibleCache[book]) {
      try {
        const content = await fetchMarkdownFile(fileName);
        bibleCache[book] = parseMarkdownContent(content, book);
      } catch (error) {
        console.error(`Failed to load ${book}: ${error.message}`);
        return [];
      }
    }

    const bookData = bibleCache[book];
    
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
 * @returns {Promise<number[]>} Array of verse numbers
 */
export async function getVerses(book, chapter) {
  try {
    const fileName = BOOK_NAMES[book];
    if (!fileName) {
      return [];
    }

    if (!bibleCache[book]) {
      try {
        const content = await fetchMarkdownFile(fileName);
        bibleCache[book] = parseMarkdownContent(content, book);
      } catch (error) {
        console.error(`Failed to load ${book}: ${error.message}`);
        return [];
      }
    }

    const bookData = bibleCache[book];
    
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
  BOOK_NAMES
};
