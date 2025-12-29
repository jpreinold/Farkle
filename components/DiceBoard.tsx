// components/DiceBoard.tsx
import React, { useContext } from 'react';
import { ThemeContext } from './ThemeContext';
import Dice from './Dice';

interface DiceBoardProps {
  dice: number[]; // Current dice values (1-6)
  selectedIndices: number[]; // Indices of selected dice
  bankedIndices: number[]; // Indices of already banked dice
  isRolling: boolean;
  onDiceClick: (index: number) => void;
  selectableIndices?: Set<number>;
}

const DiceBoard: React.FC<DiceBoardProps> = ({
  dice,
  selectedIndices,
  bankedIndices,
  isRolling,
  onDiceClick,
  selectableIndices,
}) => {
  const { theme } = useContext(ThemeContext);

  const handleDiceClick = (index: number) => {
    // Don't allow clicking banked dice
    if (!bankedIndices.includes(index)) {
      onDiceClick(index);
    }
  };

  return (
    <div className="w-full">
      <div
        className="grid grid-cols-3 gap-4 md:grid-cols-6 md:gap-3 justify-items-center p-4 rounded-lg"
        style={{
          backgroundColor: theme.cardBackground,
          border: `2px solid ${theme.borderColor}`,
        }}
      >
        {dice.map((value, index) => (
          <Dice
            key={index}
            value={value}
            isRolling={isRolling}
            isSelected={selectedIndices.includes(index)}
            isBanked={bankedIndices.includes(index)}
            onClick={() => handleDiceClick(index)}
            isSelectable={
              isRolling
                ? true
                : selectableIndices
                ? selectableIndices.has(index)
                : true
            }
          />
        ))}
      </div>
    </div>
  );
};

export default DiceBoard;

