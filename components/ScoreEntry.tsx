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
    <div className="w-full p-4 bg-white rounded-t-3xl shadow-lg">
      <p className="text-lg font-semibold mb-2 text-center text-gray-800">
        Current Player: {currentPlayer}
      </p>
      <label className="text-base mb-1 block text-gray-800">Score:</label>
      <input
        type="number"
        className="w-full border border-gray-300 rounded-md p-2.5 mb-3 text-base text-gray-800 bg-white"
        placeholder="Enter Score"
        value={score}
        onChange={(e) => setScore(e.target.value)}
        aria-label="Score Input"
      />
      <label className="text-base mb-1 block text-gray-800">Note (Optional):</label>
      <input
        type="text"
        className="w-full border border-gray-300 rounded-md p-2.5 mb-3 text-base text-gray-800 bg-white"
        placeholder="Enter note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        aria-label="Note Input"
      />
      <CustomButton title={buttonLabel} onPress={handleEndTurn} />
    </div>
  );
};

export default ScoreEntry;
