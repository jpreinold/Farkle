// components/GameOverModal.tsx
import React, { useContext } from 'react';
import Modal from './Modal';
import CustomButton from './CustomButton';
import { ThemeContext, darkTheme } from './ThemeContext';

interface GameOverModalProps {
  visible: boolean;
  winner: string;
  finalScores: { player: string; total: number }[];
  onRestart: () => void;
}

const GameOverModal: React.FC<GameOverModalProps> = ({ visible, winner, finalScores, onRestart }) => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme.primary === darkTheme.primary;
  
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onRestart}>
      <div
        className="w-[85%] p-6 rounded-lg shadow-lg flex flex-col items-center"
        style={{ backgroundColor: theme.modalBackground }}
      >
        <h2
          className="text-2xl font-bold mb-3"
          style={{ color: theme.titleText }}
        >
          Game Over!
        </h2>
        <p
          className="text-xl font-semibold mb-2"
          style={{ color: isDark ? theme.text : theme.primary }}
        >
          Winner: {winner}
        </p>
        <p
          className="text-xl mb-3"
          style={{ color: theme.text }}
        >
          Final Standings:
        </p>
        <div className="max-h-[200px] w-full mb-3 overflow-y-auto">
          {finalScores.map((score, index) => (
            <div
              key={index}
              className={`flex flex-row justify-between py-1 border-b ${
                isDark ? 'border-white' : ''
              }`}
              style={{
                borderBottomColor: isDark ? "#fff" : theme.primary,
              }}
            >
              <span
                className="text-base font-bold w-8"
                style={{ color: theme.text }}
              >
                {index + 1}.
              </span>
              <span
                className="text-base flex-1"
                style={{ color: theme.text }}
              >
                {score.player}
              </span>
              <span
                className="text-base font-bold w-12 text-right"
                style={{ color: theme.text }}
              >
                {score.total}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-5 w-full">
          <CustomButton
            title="Restart Game"
            onPress={onRestart}
            style={{ backgroundColor: theme.primary, width: '100%' }}
          />
        </div>
      </div>
    </Modal>
  );
};

export default GameOverModal;
