import React, { useState, useEffect, useRef } from 'react';
import { getVerse } from '../data/bibleData.js';

const DIFFICULTY_LEVELS = {
  easy: { label: 'Easy', missRate: 0.2 },
  medium: { label: 'Medium', missRate: 0.5 },
  hard: { label: 'Hard', missRate: 0.8 },
  mastery: { label: 'Mastery', missRate: 1.0 }
};

function MemoryQuiz({ selectedVerse, onSelectNewVerse }) {
  const [verseText, setVerseText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [difficulty, setDifficulty] = useState(null);
  const [words, setWords] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [stats, setStats] = useState({ attempts: 0, correct: 0 });
  const [showAnswer, setShowAnswer] = useState(false);
  const [currentFocusIndex, setCurrentFocusIndex] = useState(0);
  const inputRefs = useRef([]);

  // Fetch verse when selected
  useEffect(() => {
    if (!selectedVerse) return;

    const fetchVerse = async () => {
      setLoading(true);
      setError('');
      setDifficulty(null);
      setFeedback('');

      const verse = await getVerse(selectedVerse.book, selectedVerse.chapter, selectedVerse.verse);
      if (verse) {
        setVerseText(verse.text);
      } else {
        setError('Failed to load verse. Please try another one.');
      }
      setLoading(false);
    };

    fetchVerse();
  }, [selectedVerse]);

  // Generate blanks when difficulty is selected
  useEffect(() => {
    if (!difficulty || !verseText) return;

    const missRate = DIFFICULTY_LEVELS[difficulty].missRate;
    const wordArray = verseText
      .split(/\s+/)
      .filter(word => word.length > 0)
      .map(word => {
        // Separate word from trailing punctuation
        const match = word.match(/^(.*?)([.,!?;:—–-]*)$/);
        const cleanWord = match ? match[1] : word;
        const punctuation = match ? match[2] : '';
        
        return {
          original: word,
          cleanWord: cleanWord,
          punctuation: punctuation,
          isMissing: false // Will be set below
        };
      });

    // Calculate how many words should be missing
    let numMissing = Math.floor(wordArray.length * missRate);
    // Ensure at least 1 word is missing
    numMissing = Math.max(1, numMissing);

    // Randomly select which words will be missing
    const indices = Array.from({ length: wordArray.length }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    // Mark the first numMissing indices as missing
    for (let i = 0; i < numMissing; i++) {
      wordArray[indices[i]].isMissing = true;
    }

    setWords(wordArray);
    setAnswers(Array(wordArray.length).fill(''));
    inputRefs.current = Array(wordArray.length).fill(null);
    setFeedback('');
    setShowAnswer(false);
    setCurrentFocusIndex(0);

    // Focus first missing word input
    setTimeout(() => {
      const firstMissingIdx = wordArray.findIndex(w => w.isMissing);
      if (firstMissingIdx >= 0 && inputRefs.current[firstMissingIdx]) {
        inputRefs.current[firstMissingIdx].focus();
      }
    }, 0);
  }, [difficulty, verseText]);

  const handleDifficultySelect = (level) => {
    setDifficulty(level);
  };

  const handleAnswerChange = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);

    // Auto-expand input width based on content
    if (inputRefs.current[index]) {
      const input = inputRefs.current[index];
      // Create a temporary measurement span
      const span = document.createElement('span');
      span.textContent = value || '_';
      span.style.position = 'absolute';
      span.style.visibility = 'hidden';
      span.style.whiteSpace = 'pre';
      span.style.fontSize = '1.1rem';
      span.style.fontWeight = '600';
      span.style.fontFamily = 'inherit';
      span.style.fontStyle = 'normal';
      span.style.letterSpacing = '0.15em';
      document.body.appendChild(span);
      
      const width = span.offsetWidth;
      const borderWidth = 4; // 2px border on each side
      input.style.width = `${Math.max(width + borderWidth, 30)}px`;
      
      document.body.removeChild(span);
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      // Find next missing word after current index
      const nextMissingIdx = words.findIndex(
        (w, i) => i > index && w.isMissing
      );
      if (nextMissingIdx >= 0) {
        inputRefs.current[nextMissingIdx]?.focus();
        setCurrentFocusIndex(nextMissingIdx);
      }
    } else if (e.key === ' ') {
      // Also allow space to move to next blank
      const nextMissingIdx = words.findIndex(
        (w, i) => i > index && w.isMissing
      );
      if (nextMissingIdx >= 0 && answers[index].trim()) {
        e.preventDefault();
        inputRefs.current[nextMissingIdx]?.focus();
        setCurrentFocusIndex(nextMissingIdx);
      }
    } else if (e.key === 'Backspace' && answers[index] === '') {
      // If input is empty and backspace is pressed, move to previous missing word
      e.preventDefault();
      const prevMissingIdx = [...words]
        .reverse()
        .findIndex((w, i) => {
          const actualIdx = words.length - 1 - i;
          return w.isMissing && actualIdx < index;
        });
      
      if (prevMissingIdx >= 0) {
        const actualPrevIdx = words.length - 1 - prevMissingIdx;
        inputRefs.current[actualPrevIdx]?.focus();
        setCurrentFocusIndex(actualPrevIdx);
      }
    }
  };

  const handleCheckAnswer = () => {
    let correct = 0;
    let totalMissing = 0;

    words.forEach((word, index) => {
      if (word.isMissing) {
        totalMissing++;
        // Normalize for comparison (case-insensitive, no punctuation)
        const userAnswer = answers[index].trim().toLowerCase();
        const correctAnswer = word.cleanWord.toLowerCase();

        if (userAnswer === correctAnswer) {
          correct++;
        }
      }
    });

    const percentage = Math.round((correct / totalMissing) * 100);

    if (percentage === 100) {
      setFeedback(`✓ Perfect! You got all ${totalMissing} words correct!`);
      setStats((prev) => ({ ...prev, correct: prev.correct + 1 }));
    } else if (percentage >= 80) {
      setFeedback(`Great! You got ${correct}/${totalMissing} words correct (${percentage}%)`);
    } else if (percentage >= 50) {
      setFeedback(`Good effort! You got ${correct}/${totalMissing} words correct (${percentage}%)`);
    } else {
      setFeedback(`You got ${correct}/${totalMissing} words correct (${percentage}%). Keep practicing!`);
    }

    setStats((prev) => ({ ...prev, attempts: prev.attempts + 1 }));
  };

  const handleRevealAnswer = () => {
    setShowAnswer(true);
    setFeedback('');
  };

  const handleNewVerse = () => {
    setDifficulty(null);
    onSelectNewVerse();
  };

  const handleRetry = () => {
    setAnswers(Array(words.length).fill(''));
    setFeedback('');
    setShowAnswer(false);
    setCurrentFocusIndex(0);

    // Focus first missing word input
    setTimeout(() => {
      const firstMissingIdx = words.findIndex(w => w.isMissing);
      if (firstMissingIdx >= 0 && inputRefs.current[firstMissingIdx]) {
        inputRefs.current[firstMissingIdx].focus();
      }
    }, 0);
  };

  const renderVerseWithBlanks = () => {
    return (
      <div style={{ lineHeight: '2', fontSize: 'clamp(1rem, 3vw, 1.1rem)' }}>
        {words.map((word, index) => {
          const wordLength = word.cleanWord.length;
          
          return (
            <span key={index}>
              {word.isMissing ? (
                <>
                  <span style={{ position: 'relative', display: 'inline-block', margin: '0 0.25rem 0 0' }}>
                    {/* Underscores container */}
                    <span
                      style={{
                        display: 'inline-block',
                        position: 'relative',
                        letterSpacing: '0.15em',
                        fontWeight: '600',
                        color: '#667eea',
                        fontSize: 'inherit',
                        fontStyle: 'italic',
                        fontFamily: 'inherit'
                      }}
                    >
                      {Array(wordLength)
                        .fill('_')
                        .map((_, i) => (
                          <span key={i}>_</span>
                        ))}
                    </span>

                    {/* Transparent input overlay */}
                    <input
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      value={answers[index]}
                      onChange={(e) => handleAnswerChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      placeholder=""
                      style={{
                        position: 'absolute',
                        left: '0',
                        top: '0',
                        padding: '0',
                        margin: '0',
                        border: '2px solid transparent',
                        borderRadius: '4px',
                        textAlign: 'center',
                        fontStyle: 'normal',
                        fontSize: 'inherit',
                        fontWeight: '600',
                        backgroundColor: 'transparent',
                        color: '#333',
                        letterSpacing: '0.15em',
                        cursor: 'text',
                        outline: 'none',
                        transition: 'border-color 0.2s ease',
                        fontFamily: 'inherit',
                        width: '30px',
                        height: '1.5em',
                        boxSizing: 'border-box',
                        minWidth: '30px'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#667eea';
                        e.target.style.backgroundColor = 'rgba(102, 126, 234, 0.05)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'transparent';
                        e.target.style.backgroundColor = 'transparent';
                      }}
                      disabled={showAnswer}
                    />
                  </span>

                  {showAnswer && (
                    <span
                      style={{
                        marginLeft: '0.5rem',
                        color: '#999',
                        fontSize: '0.9rem',
                        fontStyle: 'italic'
                      }}
                    >
                      [{word.cleanWord}{word.punctuation}]
                    </span>
                  )}
                </>
              ) : (
                <span>{word.original} </span>
              )}
            </span>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading verse...</p>
      </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!verseText) {
    return null;
  }

  if (!difficulty) {
    return (
      <div>
        <div className="verse-display" style={{ background: '#f0f4ff' }}>
          <div className="verse-reference">{selectedVerse.reference}</div>
          <div className="verse-text" style={{ marginTop: '1rem' }}>"{verseText}"</div>
        </div>

        <h2 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Select Difficulty Level:</h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <button
            className="btn-primary"
            onClick={() => handleDifficultySelect('easy')}
            style={{ padding: '1rem' }}
          >
            <div style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.3rem)', fontWeight: '700', marginBottom: '0.5rem' }}>
              Easy
            </div>
            <div style={{ fontSize: 'clamp(0.8rem, 1.5vw, 0.9rem)', opacity: 0.9 }}>
              20%
            </div>
          </button>

          <button
            className="btn-primary"
            onClick={() => handleDifficultySelect('medium')}
            style={{ padding: '1rem' }}
          >
            <div style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.3rem)', fontWeight: '700', marginBottom: '0.5rem' }}>
              Medium
            </div>
            <div style={{ fontSize: 'clamp(0.8rem, 1.5vw, 0.9rem)', opacity: 0.9 }}>
              50%
            </div>
          </button>

          <button
            className="btn-primary"
            onClick={() => handleDifficultySelect('hard')}
            style={{ padding: '1rem' }}
          >
            <div style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.3rem)', fontWeight: '700', marginBottom: '0.5rem' }}>
              Hard
            </div>
            <div style={{ fontSize: 'clamp(0.8rem, 1.5vw, 0.9rem)', opacity: 0.9 }}>
              80%
            </div>
          </button>

          <button
            className="btn-primary"
            onClick={() => handleDifficultySelect('mastery')}
            style={{ padding: '1rem' }}
          >
            <div style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.3rem)', fontWeight: '700', marginBottom: '0.5rem' }}>
              Mastery
            </div>
            <div style={{ fontSize: 'clamp(0.8rem, 1.5vw, 0.9rem)', opacity: 0.9 }}>
              100%
            </div>
          </button>
        </div>

        <button
          className="btn-secondary"
          onClick={onSelectNewVerse}
          style={{ width: '100%', marginTop: '2rem' }}
        >
          Choose Different Verse
        </button>
      </div>
    );
  }

  return (
    <div className="quiz-area">
      <div className="verse-display" style={{ background: '#f0f4ff' }}>
        <div className="verse-reference">
          {selectedVerse.reference} — {DIFFICULTY_LEVELS[difficulty].label}
        </div>
      </div>

      <h2 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Fill in the missing words:</h2>

      {feedback && (
        <div
          className={
            feedback.includes('✓') || feedback.includes('Perfect') || feedback.includes('Great')
              ? 'success-message'
              : 'error-message'
          }
        >
          {feedback}
        </div>
      )}

      <div
        className="verse-display"
        style={{
          background: '#fafafa',
          padding: 'clamp(1rem, 3vw, 2rem)',
          lineHeight: '2.2',
          fontSize: 'clamp(1rem, 3vw, 1.1rem)',
          borderLeft: '4px solid #667eea'
        }}
      >
        {renderVerseWithBlanks()}
      </div>

      <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#999' }}>
        💡 Tip: Use Tab or Space to move between blanks
      </div>

      {!showAnswer && (
        <div className="button-group">
          <button className="btn-primary" onClick={handleCheckAnswer}>
            Check Answer
          </button>
          <button className="btn-secondary" onClick={handleRevealAnswer}>
            Show Answers
          </button>
        </div>
      )}

      {showAnswer && (
        <div>
          <div className="verse-display" style={{ marginTop: '1rem' }}>
            <div className="verse-text">"{verseText}"</div>
            <div className="verse-reference">- {selectedVerse.reference}</div>
          </div>
          <div className="button-group">
            <button
              className="btn-primary"
              onClick={handleRetry}
            >
              Retry
            </button>
            <button
              className="btn-primary"
              onClick={handleNewVerse}
            >
              Next Verse
            </button>
          </div>
        </div>
      )}

      <div className="stats">
        <div className="stat-card">
          <div className="stat-value">{stats.attempts}</div>
          <div className="stat-label">Attempts</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.correct}</div>
          <div className="stat-label">Perfect</div>
        </div>
      </div>

      {stats.attempts > 0 && (
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${(stats.correct / stats.attempts) * 100}%`
            }}
          ></div>
        </div>
      )}

      {!showAnswer && (
        <button
          className="btn-secondary"
          onClick={onSelectNewVerse}
          style={{ width: '100%', marginTop: '1rem' }}
        >
          Choose Different Verse
        </button>
      )}
    </div>
  );
}

export default MemoryQuiz;
