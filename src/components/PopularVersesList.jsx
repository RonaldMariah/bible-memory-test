import React from 'react';
import popularVerses from '../data/popularVerses.js';

function PopularVersesList({ onSelectVerse }) {
  return (
    <div className="popular-verses">
      <p style={{ color: '#000000ff', marginBottom: '1rem', fontSize: '0.9rem' }}>
        Quick select from popular Bible passages:
      </p>
      <ul className="verse-list">
        {popularVerses.map((verse) => (
          <li
            key={verse.reference}
            className="verse-item"
            onClick={() => onSelectVerse(verse)}
            role="button"
            tabIndex="0"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                onSelectVerse(verse);
              }
            }}
          >
            <div style={{ fontWeight: '600', color: '#667eea' }}>
              {verse.reference}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>
              {verse.preview}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PopularVersesList;
