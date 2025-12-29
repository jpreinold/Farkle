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
        className="w-[90%] max-w-lg rounded-2xl p-8 flex flex-col items-center shadow-2xl"
        style={{ backgroundColor: theme.cardBackground }}
      >
        <div className="text-center mb-6">
          <h2
            className="text-4xl font-bold mb-4"
            style={{ color: theme.titleText }}
          >
            🎉 Game Over! 🎉
          </h2>
          <div 
            className="inline-block px-6 py-3 rounded-full mb-4"
            style={{ 
              background: `linear-gradient(135deg, ${theme.secondary} 0%, ${theme.primary} 100%)`,
              boxShadow: `0 4px 14px ${theme.shadowColor}`,
            }}
          >
            <p
              className="text-2xl font-bold"
              style={{ color: '#ffffff' }}
            >
              Winner: {winner}
            </p>
          </div>
        </div>
        
        <div className="w-full mb-6">
          <p
            className="text-xl font-semibold mb-4 text-center"
            style={{ color: theme.text }}
          >
            Final Standings
          </p>
          <div className="space-y-3">
            {finalScores.map((score, index) => (
              <div
                key={index}
                className={`flex flex-row justify-between items-center py-3 px-4 rounded-lg transition-all duration-200 ${
                  index === 0 ? 'ring-2 ring-offset-2' : ''
                }`}
                style={{
                  backgroundColor: index === 0 
                    ? `${theme.secondary}30` 
                    : index % 2 === 0 
                      ? 'transparent' 
                      : `${theme.tableRowBorder}20`,
                  border: `1px solid ${theme.borderColor}`,
                  ringColor: theme.secondary,
                }}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white"
                    style={{ 
                      backgroundColor: index === 0 ? theme.secondary : theme.primary,
                    }}
                  >
                    {index + 1}
                  </div>
                  <span
                    className="text-lg font-semibold"
                    style={{ color: theme.text }}
                  >
                    {score.player}
                  </span>
                </div>
                <span
                  className="text-xl font-bold"
                  style={{ color: theme.primary }}
                >
                  {score.total}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="w-full">
          <CustomButton
            title="New Game"
            onPress={onRestart}
            style={{ width: '100%' }}
          />
        </div>
      </div>
    </Modal>
  );
};

export default GameOverModal;
