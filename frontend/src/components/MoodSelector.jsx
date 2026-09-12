import React from 'react';
import { Sparkles, X } from 'lucide-react';

export default function MoodSelector({ moods = [], selectedMood, onSelectMood }) {
  if (!moods || moods.length === 0) return null;

  return (
    <div className="mood-bar-container">
      <div className="mood-bar-header">
        <div className="mood-bar-title">
          <Sparkles size={16} color="var(--accent-amber)" />
          <span>Discover by Mood &amp; Vibe</span>
        </div>
        {selectedMood && (
          <button className="mood-clear-btn" onClick={() => onSelectMood('')}>
            <X size={13} />
            <span>Clear Mood</span>
          </button>
        )}
      </div>

      <div className="mood-pills-row">
        {moods.map((m) => {
          const isSelected = selectedMood === m.id;
          return (
            <button
              key={m.id}
              className={`mood-pill ${isSelected ? 'active' : ''}`}
              onClick={() => onSelectMood(isSelected ? '' : m.id)}
              title={m.desc}
            >
              <span className="mood-emoji">{m.emoji}</span>
              <span className="mood-label">{m.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
