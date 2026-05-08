import React, { useState, useEffect } from 'react';
import { getBooks, getChapters, getVerses, getVerse, getVerseRange } from '../data/bibleData.js';
import VerseSelector from './VerseSelector.jsx';

function VerseManualPicker({ onSelectVerse, translation = 'ESV' }) {
  const [books, setBooks] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [verses, setVerses] = useState([]);
  const [selectedBook, setSelectedBook] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showVerseSelector, setShowVerseSelector] = useState(false);
  const [previewVerse, setPreviewVerse] = useState(null);

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
    getChapters(selectedBook, translation)
      .then((chapterList) => {
        setChapters(chapterList);
        if (chapterList.length > 0) {
          setSelectedChapter(chapterList[0].toString());
          setVerses([]);
          setPreviewVerse(null);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to load chapters');
        setLoading(false);
      });
  }, [selectedBook, translation]);

  // Load verses when chapter changes
  useEffect(() => {
    if (!selectedBook || !selectedChapter) return;

    setLoading(true);
    setError('');
    getVerses(selectedBook, parseInt(selectedChapter), translation)
      .then((verseList) => {
        setVerses(verseList);
        setPreviewVerse(null);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to load verses');
        setLoading(false);
      });
  }, [selectedBook, selectedChapter, translation]);

  // Load preview verse(s) when they're selected
  useEffect(() => {
    const loadPreview = async () => {
      if (!previewVerse) return;

      try {
        let verseData;
        if (previewVerse.isRange) {
          verseData = await getVerseRange(
            previewVerse.book,
            previewVerse.chapter,
            previewVerse.startVerse,
            previewVerse.endVerse,
            translation
          );
        } else {
          verseData = await getVerse(
            previewVerse.book,
            previewVerse.chapter,
            previewVerse.verse,
            translation
          );
        }
        setPreviewVerse(verseData);
      } catch (err) {
        console.error('Error loading preview:', err);
      }
    };

    loadPreview();
  }, [translation]);

  const handleSelectVerse = () => {
    if (!selectedBook || !selectedChapter) {
      setError('Please select a book and chapter');
      return;
    }
    setShowVerseSelector(true);
  };

  const handleVerseSelection = (selectedVerseData) => {
    setShowVerseSelector(false);
    setPreviewVerse(selectedVerseData);
    onSelectVerse(selectedVerseData);
  };

  return (
    <div className="verse-picker">
      <p style={{ color: '#999', marginBottom: '1rem', fontSize: '0.9rem' }}>
        Manually select any Bible verse or verse range:
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

      {previewVerse && (
        <div className="verse-preview">
          <h4 style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>Preview</h4>
          <p style={{ 
            fontSize: '0.95rem', 
            lineHeight: '1.6', 
            backgroundColor: '#f5f5f5', 
            padding: '1rem', 
            borderRadius: '4px',
            marginBottom: '1rem'
          }}>
            <strong>{previewVerse.reference}</strong>
            <br />
            {previewVerse.text}
          </p>
        </div>
      )}

      <button
        className="btn-primary"
        onClick={handleSelectVerse}
        disabled={loading || !selectedChapter || verses.length === 0}
      >
        {loading ? 'Loading...' : 'Select Verses'}
      </button>

      {showVerseSelector && verses.length > 0 && (
        <VerseSelector
          verses={verses}
          book={selectedBook}
          chapter={selectedChapter}
          onSelect={handleVerseSelection}
          onCancel={() => setShowVerseSelector(false)}
        />
      )}
    </div>
  );
}

export default VerseManualPicker;
