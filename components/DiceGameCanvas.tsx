// components/DiceGameCanvas.tsx
import React, { useContext } from 'react';
import { ThemeContext } from './ThemeContext';
import DiceBoard from './DiceBoard';

interface DiceGameCanvasProps {
  dice: number[];
  availableDice: number;
  isRolling: boolean;
  hasRolled: boolean;
  selectedIndices: number[];
  onDiceClick: (index: number) => void;
  farkleOccurred: boolean;
  gameOver: boolean;
  selectableIndices?: Set<number>;
}

const DiceGameCanvas: React.FC<DiceGameCanvasProps> = ({
  dice,
  availableDice,
  isRolling,
  hasRolled,
  selectedIndices,
  onDiceClick,
  farkleOccurred,
  gameOver,
  selectableIndices,
}) => {
  const { theme } = useContext(ThemeContext);

  const displayCount = availableDice === 0 ? 6 : availableDice;
  const placeholderMessage = gameOver
    ? 'Game over — review the results!'
    : `Ready to roll ${displayCount} dice`;

  return (
    <div className="w-full">
      {(hasRolled || isRolling) && dice.length > 0 ? (
        <DiceBoard
          dice={dice}
          selectedIndices={selectedIndices}
          bankedIndices={[]}
          isRolling={isRolling}
          onDiceClick={onDiceClick}
          selectableIndices={selectableIndices}
        />
      ) : (
        <div
          className="p-8 rounded-2xl text-center"
          style={{
            backgroundColor: theme.cardBackground,
            border: `2px solid ${theme.borderColor}`,
            color: theme.text,
            boxShadow: `0 6px 18px ${theme.shadowColor}`,
          }}
        >
          <p className="text-base font-medium">{placeholderMessage}</p>
        </div>
      )}

      <div className="mt-3 text-center text-sm font-semibold" style={{ color: theme.text }}>
        {farkleOccurred && (
          <span style={{ color: theme.secondary }}>
            Farkle! No scoring dice rolled.
          </span>
        )}
      </div>
    </div>
  );
};

export default DiceGameCanvas;

