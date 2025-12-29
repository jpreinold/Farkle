// components/StatsModal.tsx
import React, { useContext } from 'react';
import Modal from './Modal';
import CustomButton from './CustomButton';
import { ThemeContext, darkTheme } from './ThemeContext';

interface StatsModalProps {
  visible: boolean;
  stats: Record<
    string,
    { rounds: number; totalScore: number; average: number; highest: number }
  >;
  onClose: () => void;
}

const StatsModal: React.FC<StatsModalProps> = ({ visible, stats, onClose }) => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme.primary === darkTheme.primary;
  const playersArray = Object.keys(stats);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <div
        className="w-[80%] p-4 rounded-lg"
        style={{ backgroundColor: theme.modalBackground }}
      >
        <h2
          className="text-2xl font-bold text-center mb-3"
          style={{ color: theme.titleText }}
        >
          Game Statistics
        </h2>
        {playersArray.map((player, index) => {
          const { rounds, totalScore, average, highest } = stats[player];
          return (
            <div
              key={player}
              className={`mb-3 py-2 ${
                index !== playersArray.length - 1
                  ? isDark
                    ? 'border-b border-white'
                    : 'border-b'
                  : ''
              }`}
              style={{
                borderBottomColor:
                  index !== playersArray.length - 1
                    ? isDark
                      ? "#fff"
                      : theme.primary
                    : 'transparent',
              }}
            >
              <p
                className="text-xl font-bold mb-1"
                style={{ color: theme.text }}
              >
                {player}
              </p>
              <p style={{ color: theme.text }}>Rounds Played: {rounds}</p>
              <p style={{ color: theme.text }}>Total Score: {totalScore}</p>
              <p style={{ color: theme.text }}>
                Average Score: {average.toFixed(2)}
              </p>
              <p style={{ color: theme.text }}>Highest Round: {highest}</p>
            </div>
          );
        })}
        <div className="mt-3">
          <CustomButton
            title="Close"
            onPress={onClose}
            style={{ backgroundColor: theme.primary, width: '100%' }}
          />
        </div>
      </div>
    </Modal>
  );
};

export default StatsModal;
