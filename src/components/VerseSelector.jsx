import React, { useState, useEffect } from 'react';

function VerseSelector({ verses, onSelect, onCancel, book, chapter }) {
  const [selectedVerses, setSelectedVerses] = useState([]);
  const [selectionMode, setSelectionMode] = useState('single'); // 'single' or 'range'

  const handleVerseClick = (verse) => {
    if (selectionMode === 'single') {
      setSelectedVerses([verse]);
    } else {
      // Range mode - allow selecting a range
      if (selectedVerses.length === 0) {
        setSelectedVerses([verse]);
      } else if (selectedVerses.length === 1) {
        const start = Math.min(selectedVerses[0], verse);
        const end = Math.max(selectedVerses[0], verse);
        const range = [];
        for (let i = start; i <= end; i++) {
          range.push(i);
        }
        setSelectedVerses(range);
      } else {
        // Already have a range, reset to new single selection
        setSelectedVerses([verse]);
      }
    }
  };

  const handleConfirm = () => {
    if (selectedVerses.length === 0) {
      alert('Please select at least one verse');
      return;
    }

    if (selectedVerses.length === 1) {
      onSelect({
        reference: `${book} ${chapter}:${selectedVerses[0]}`,
        book: book,
        chapter: parseInt(chapter),
        verse: selectedVerses[0],
        isRange: false
      });
    } else {
      onSelect({
        reference: `${book} ${chapter}:${Math.min(...selectedVerses)}-${Math.max(...selectedVerses)}`,
        book: book,
        chapter: parseInt(chapter),
        startVerse: Math.min(...selectedVerses),
        endVerse: Math.max(...selectedVerses),
        isRange: true
      });
    }
  };

  const toggleSelectionMode = () => {
    setSelectedVerses([]);
    setSelectionMode(selectionMode === 'single' ? 'range' : 'single');
  };

  const isVerseSelected = (verse) => selectedVerses.includes(verse);
  const isVerseInRange = (verse) => {
    if (selectedVerses.length <= 1) return false;
    const min = Math.min(...selectedVerses);
    const max = Math.max(...selectedVerses);
    return verse >= min && verse <= max;
  };

  // Create grid layout for verses
  const verseColumns = 5;
  const verseGrid = [];
  for (let i = 0; i < verses.length; i += verseColumns) {
    verseGrid.push(verses.slice(i, i + verseColumns));
  }

  return (
    <div className="verse-selector-overlay">
      <div className="verse-selector-dialog">
        <div className="verse-selector-header">
          <h3>
            {book} {chapter}
            {selectedVerses.length > 0 && (
              <span style={{ marginLeft: '1rem', fontSize: '0.8em', color: '#666' }}>
                {selectedVerses.length === 1
                  ? `Verse ${selectedVerses[0]} selected`
                  : `Verses ${Math.min(...selectedVerses)}-${Math.max(...selectedVerses)} selected`}
              </span>
            )}
          </h3>
          <div style={{ marginTop: '0.5rem' }}>
            <button
              className={`mode-toggle-btn ${selectionMode === 'single' ? 'active' : ''}`}
              onClick={() => {
                setSelectionMode('single');
                setSelectedVerses([]);
              }}
            >
              Single
            </button>
            <button
              className={`mode-toggle-btn ${selectionMode === 'range' ? 'active' : ''}`}
              onClick={() => {
                setSelectionMode('range');
                setSelectedVerses([]);
              }}
            >
              Range
            </button>
          </div>
        </div>

        <div className="verse-grid">
          {verseGrid.map((row, rowIndex) => (
            <div key={rowIndex} className="verse-row">
              {row.map((verse) => (
                <button
                  key={verse}
                  className={`verse-btn ${
                    isVerseSelected(verse)
                      ? 'selected'
                      : isVerseInRange(verse)
                      ? 'in-range'
                      : ''
                  }`}
                  onClick={() => handleVerseClick(verse)}
                >
                  {verse}
                </button>
              ))}
            </div>
          ))}
        </div>

        <div className="verse-selector-footer">
          <button
            className="btn-secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleConfirm}
            disabled={selectedVerses.length === 0}
          >
            Confirm Selection
          </button>
        </div>
      </div>
    </div>
  );
}

export default VerseSelector;
