// components/ScoreEntry.tsx
import React, { useState } from 'react';
import CustomButton from './CustomButton';

interface ScoreEntryProps {
  onAddEntry: (score: number, note: string) => void;
  currentPlayer: string;
}

const ScoreEntry: React.FC<ScoreEntryProps> = ({ onAddEntry, currentPlayer }) => {
  const [score, setScore] = useState('');
  const [note, setNote] = useState('');

  const handleEndTurn = () => {
    if (score.trim() === '') {
      onAddEntry(0, "Farkle");
    } else {
      const parsedScore = parseInt(score, 10);
      if (!isNaN(parsedScore)) {
        onAddEntry(parsedScore, note);
      } else {
        console.warn('Enter a valid number for the score.');
        return;
      }
    }
    setScore('');
    setNote('');
  };

  const buttonLabel = score.trim() === '' ? "Farkle!" : "End Turn";

  return (
    <div 
      className="w-full p-6 rounded-t-3xl shadow-2xl border-t-2"
      style={{ 
        backgroundColor: '#ffffff',
        borderTopColor: 'rgba(0, 0, 0, 0.1)',
      }}
    >
      <p className="text-xl font-bold mb-4 text-center text-gray-800">
        Current Player: <span className="text-blue-600">{currentPlayer}</span>
      </p>
      
      <div className="space-y-4">
        <div>
          <label className="text-base font-semibold mb-2 block text-gray-700">Score:</label>
          <input
            type="number"
            className="input-modern w-full focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
            style={{
              borderColor: '#CBD5E0',
            }}
            placeholder="Enter Score"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            onFocus={(e) => {
              e.target.style.borderColor = '#5DADE2';
              e.target.style.boxShadow = '0 0 0 3px rgba(93, 173, 226, 0.25)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#CBD5E0';
              e.target.style.boxShadow = 'none';
            }}
            aria-label="Score Input"
          />
        </div>
        
        <div>
          <label className="text-base font-semibold mb-2 block text-gray-700">Note (Optional):</label>
          <input
            type="text"
            className="input-modern w-full focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
            style={{
              borderColor: '#CBD5E0',
            }}
            placeholder="Enter note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onFocus={(e) => {
              e.target.style.borderColor = '#5DADE2';
              e.target.style.boxShadow = '0 0 0 3px rgba(93, 173, 226, 0.25)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#CBD5E0';
              e.target.style.boxShadow = 'none';
            }}
            aria-label="Note Input"
          />
        </div>
        
        <CustomButton 
          title={buttonLabel} 
          onPress={handleEndTurn}
          style={{ width: '100%', marginTop: '8px' }}
        />
      </div>
    </div>
  );
};

export default ScoreEntry;
