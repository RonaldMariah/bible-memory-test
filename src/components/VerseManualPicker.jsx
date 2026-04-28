import React, { useState, useEffect } from 'react';
import { getBooks, getChapters, getVerses } from '../data/bibleData.js';

function VerseManualPicker({ onSelectVerse }) {
  const [books, setBooks] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [verses, setVerses] = useState([]);
  const [selectedBook, setSelectedBook] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [selectedVerse, setSelectedVerse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load books on mount
  useEffect(() => {
    const bookList = getBooks();
    setBooks(bookList);
    if (bookList.length > 0) {
      setSelectedBook(bookList[0]);
    }
  }, []);

  // Load chapters when book changes
  useEffect(() => {
    if (!selectedBook) return;
    
    setLoading(true);
    setError('');
    getChapters(selectedBook)
      .then((chapterList) => {
        setChapters(chapterList);
        if (chapterList.length > 0) {
          setSelectedChapter(chapterList[0].toString());
          setSelectedVerse('');
          setVerses([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to load chapters');
        setLoading(false);
      });
  }, [selectedBook]);

  // Load verses when chapter changes
  useEffect(() => {
    if (!selectedBook || !selectedChapter) return;

    setLoading(true);
    setError('');
    getVerses(selectedBook, parseInt(selectedChapter))
      .then((verseList) => {
        setVerses(verseList);
        if (verseList.length > 0) {
          setSelectedVerse(verseList[0].toString());
        }
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to load verses');
        setLoading(false);
      });
  }, [selectedBook, selectedChapter]);

  const handleSelectVerse = () => {
    if (!selectedBook || !selectedChapter || !selectedVerse) {
      setError('Please select a book, chapter, and verse');
      return;
    }

    onSelectVerse({
      reference: `${selectedBook} ${selectedChapter}:${selectedVerse}`,
      book: selectedBook,
      chapter: parseInt(selectedChapter),
      verse: parseInt(selectedVerse)
    });
  };

  return (
    <div className="verse-picker">
      <p style={{ color: '#999', marginBottom: '1rem', fontSize: '0.9rem' }}>
        Manually select any Bible verse:
      </p>
      
      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label htmlFor="book-select">Book</label>
        <select
          id="book-select"
          value={selectedBook}
          onChange={(e) => setSelectedBook(e.target.value)}
          disabled={loading}
        >
          {books.map((book) => (
            <option key={book} value={book}>
              {book}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="chapter-select">Chapter</label>
        <select
          id="chapter-select"
          value={selectedChapter}
          onChange={(e) => setSelectedChapter(e.target.value)}
          disabled={loading || chapters.length === 0}
        >
          {chapters.map((chapter) => (
            <option key={chapter} value={chapter}>
              {chapter}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="verse-select">Verse</label>
        <select
          id="verse-select"
          value={selectedVerse}
          onChange={(e) => setSelectedVerse(e.target.value)}
          disabled={loading || verses.length === 0}
        >
          {verses.map((verse) => (
            <option key={verse} value={verse}>
              {verse}
            </option>
          ))}
        </select>
      </div>

      <button
        className="btn-primary"
        onClick={handleSelectVerse}
        disabled={loading || !selectedVerse}
      >
        {loading ? 'Loading...' : 'Select Verse'}
      </button>
    </div>
  );
}

export default VerseManualPicker;
