// components/GameActionButtons.tsx
import React from 'react';
import CustomButton from './CustomButton';

interface GameActionButtonsProps {
  onRoll: () => void;
  onEndTurn: () => void;
  onFarkle: () => void;
  canRoll: boolean;
  canEndTurn: boolean;
  farkleOccurred: boolean;
  hasRolled: boolean;
  isRolling: boolean;
  gameOver: boolean;
}

const GameActionButtons: React.FC<GameActionButtonsProps> = ({
  onRoll,
  onEndTurn,
  onFarkle,
  canRoll,
  canEndTurn,
  farkleOccurred,
  hasRolled,
  isRolling,
  gameOver,
}) => {
  if (gameOver) {
    return null;
  }

  if (farkleOccurred) {
    return (
      <CustomButton
        title="Farkle! End Turn"
        onPress={onFarkle}
        disabled={isRolling}
        style={{ width: '100%' }}
      />
    );
  }

  return (
    <div className="space-y-3">
      <CustomButton
        title={hasRolled ? 'Roll Again' : 'Roll Dice'}
        onPress={onRoll}
        disabled={!canRoll || isRolling}
        style={{ width: '100%' }}
      />
      <CustomButton
        title="End Turn"
        onPress={onEndTurn}
        disabled={!canEndTurn}
        variant="outline"
        style={{ width: '100%' }}
      />
    </div>
  );
};

export default GameActionButtons;

