import React, { useState } from 'react';
import PopularVersesList from './components/PopularVersesList.jsx';
import VerseManualPicker from './components/VerseManualPicker.jsx';
import MemoryQuiz from './components/MemoryQuiz.jsx';

function App() {
  const [currentTab, setCurrentTab] = useState('popular');
  const [selectedVerse, setSelectedVerse] = useState(null);

  const handleSelectVerse = (verse) => {
    setSelectedVerse(verse);
  };

  const handleSelectNewVerse = () => {
    setSelectedVerse(null);
  };

  return (
    <div className="container">
      <h1>📖 Bible Memory Test</h1>

      {!selectedVerse ? (
        <>
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
            <PopularVersesList onSelectVerse={handleSelectVerse} />
          ) : (
            <VerseManualPicker onSelectVerse={handleSelectVerse} />
          )}
        </>
      ) : (
        <MemoryQuiz selectedVerse={selectedVerse} onSelectNewVerse={handleSelectNewVerse} />
      )}
    </div>
  );
}

export default App;
