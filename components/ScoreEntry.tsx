// components/ScoreEntry.tsx
import React, { useState, useContext } from 'react';
import CustomButton from './CustomButton';
import { ThemeContext } from './ThemeContext';

interface ScoreEntryProps {
  onAddEntry: (score: number, note: string) => void;
  currentPlayer: string;
}

const ScoreEntry: React.FC<ScoreEntryProps> = ({ onAddEntry, currentPlayer }) => {
  const { theme } = useContext(ThemeContext);
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
    <div className="w-full">
      <p 
        className="text-xl font-bold mb-4 text-center"
        style={{ color: theme.text }}
      >
        Current Player: <span style={{ color: theme.secondary }}>{currentPlayer}</span>
      </p>
      
      <div className="space-y-4">
        <div>
          <label 
            className="text-base font-semibold mb-2 block"
            style={{ color: theme.text }}
          >
            Score:
          </label>
          <input
            type="number"
            className="input-modern w-full focus:ring-2 focus:ring-offset-2"
            style={{
              borderColor: theme.inputBorder,
              backgroundColor: theme.cardBackground,
              color: theme.text,
            }}
            placeholder="Enter Score"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            onFocus={(e) => {
              e.target.style.borderColor = theme.secondary;
              e.target.style.boxShadow = `0 0 0 3px ${theme.secondary}40`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = theme.inputBorder;
              e.target.style.boxShadow = 'none';
            }}
            aria-label="Score Input"
          />
        </div>
        
        <div>
          <label 
            className="text-base font-semibold mb-2 block"
            style={{ color: theme.text }}
          >
            Note (Optional):
          </label>
          <input
            type="text"
            className="input-modern w-full focus:ring-2 focus:ring-offset-2"
            style={{
              borderColor: theme.inputBorder,
              backgroundColor: theme.cardBackground,
              color: theme.text,
            }}
            placeholder="Enter note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onFocus={(e) => {
              e.target.style.borderColor = theme.secondary;
              e.target.style.boxShadow = `0 0 0 3px ${theme.secondary}40`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = theme.inputBorder;
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
