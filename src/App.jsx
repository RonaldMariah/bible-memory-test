import React, { useState } from 'react';
import { AVAILABLE_TRANSLATIONS } from './data/bibleData.js';
import PopularVersesList from './components/PopularVersesList.jsx';
import VerseManualPicker from './components/VerseManualPicker.jsx';
import MemoryQuiz from './components/MemoryQuiz.jsx';

function App() {
  const [currentTab, setCurrentTab] = useState('popular');
  const [selectedVerse, setSelectedVerse] = useState(null);
  const [selectedTranslation, setSelectedTranslation] = useState('ESV');

  const handleSelectVerse = (verse) => {
    setSelectedVerse(verse);
  };

  const handleSelectNewVerse = () => {
    setSelectedVerse(null);
  };

  const handleHomeClick = () => {
    setSelectedVerse(null);
    setCurrentTab('popular');
  };

  const currentTranslationName = AVAILABLE_TRANSLATIONS.find(t => t.id === selectedTranslation)?.name || selectedTranslation;

  return (
    <div className="container">
      <h1 onClick={handleHomeClick} style={{ cursor: 'pointer' }}>📖 Memory Verses</h1>
      <p style={{ textAlign: 'center', color: '#000000ff', fontSize: '0.95rem', marginBottom: '1.5rem', fontWeight: '400', marginTop: '-0.5rem' }}>
        Memorize and practice Bible verses using the {currentTranslationName} translation
      </p>

      {!selectedVerse ? (
        <>
          <div className="translation-selector" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
            <label htmlFor="translation-select" style={{ marginRight: '0.5rem', fontWeight: '500' }}>
              Bible Translation:
            </label>
            <select
              id="translation-select"
              value={selectedTranslation}
              onChange={(e) => setSelectedTranslation(e.target.value)}
              style={{
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              {AVAILABLE_TRANSLATIONS.map((translation) => (
                <option key={translation.id} value={translation.id}>
                  {translation.name} ({translation.id})
                </option>
              ))}
            </select>
          </div>

          <div className="tabs">
            <button
              className={`tab-button ${currentTab === 'popular' ? 'active' : ''}`}
              onClick={() => setCurrentTab('popular')}
            >
              Popular Verses
            </button>
            <button
              className={`tab-button ${currentTab === 'manual' ? 'active' : ''}`}
              onClick={() => setCurrentTab('manual')}
            >
              Manual Picker
            </button>
          </div>

          {currentTab === 'popular' ? (
            <PopularVersesList onSelectVerse={handleSelectVerse} translation={selectedTranslation} />
          ) : (
            <VerseManualPicker onSelectVerse={handleSelectVerse} translation={selectedTranslation} />
          )}
        </>
      ) : (
        <MemoryQuiz selectedVerse={selectedVerse} onSelectNewVerse={handleSelectNewVerse} translation={selectedTranslation} />
      )}
    </div>
  );
}

export default App;
