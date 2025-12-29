// components/TurnScoreDisplay.tsx
import React, { useContext } from 'react';
import { ThemeContext } from './ThemeContext';

interface TurnScoreDisplayProps {
  currentPlayer: string;
  turnScore: number;
  selectedScorePreview: number;
  farkleOccurred: boolean;
  isHotDice: boolean;
}

const TurnScoreDisplay: React.FC<TurnScoreDisplayProps> = ({
  currentPlayer,
  turnScore,
  selectedScorePreview,
  farkleOccurred,
  isHotDice,
}) => {
  const { theme } = useContext(ThemeContext);

  return (
    <div
      className="rounded-2xl p-5 text-center transition-all duration-200"
      style={{
        backgroundColor: theme.cardBackground,
        border: `2px solid ${theme.borderColor}`,
        boxShadow: `0 6px 18px ${theme.shadowColor}`,
      }}
    >
      <p className="text-sm font-semibold mb-1" style={{ color: theme.text }}>
        Current Turn · {currentPlayer || 'Player'}
      </p>
      <p className="text-4xl font-extrabold" style={{ color: theme.secondary }}>
        {turnScore}
      </p>
      <div className="mt-2 text-sm" style={{ color: theme.text }}>
        {farkleOccurred && (
          <span className="font-semibold" style={{ color: theme.secondary }}>
            Farkle! Roll to continue.
          </span>
        )}
        {!farkleOccurred && selectedScorePreview > 0 && (
          <span>
            Pending selection:{' '}
            <span className="font-semibold" style={{ color: theme.primary }}>
              +{selectedScorePreview}
            </span>
          </span>
        )}
        {!farkleOccurred && selectedScorePreview === 0 && isHotDice && (
          <span className="font-semibold" style={{ color: theme.secondary }}>
            Hot dice! All dice scored.
          </span>
        )}
        {!farkleOccurred && selectedScorePreview === 0 && !isHotDice && (
          <span>Keep rolling or bank your points.</span>
        )}
      </div>
    </div>
  );
};

export default TurnScoreDisplay;

