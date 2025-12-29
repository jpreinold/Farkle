// components/StatsModal.tsx
import React, { useContext } from 'react';
import Modal from './Modal';
import CustomButton from './CustomButton';
import { ThemeContext } from './ThemeContext';

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
  const playersArray = Object.keys(stats);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <div
        className="w-[90%] max-w-lg rounded-2xl p-8 shadow-2xl"
        style={{ backgroundColor: theme.cardBackground }}
      >
        <h2
          className="text-3xl font-bold text-center mb-8"
          style={{ color: theme.titleText }}
        >
          Game Statistics
        </h2>
        
        <div className="space-y-4 mb-6">
          {playersArray.map((player, index) => {
            const { rounds, totalScore, average, highest } = stats[player];
            return (
              <div
                key={player}
                className={`p-5 rounded-xl transition-all duration-200 ${
                  index !== playersArray.length - 1
                    ? 'mb-4 border-b-2'
                    : ''
                }`}
                style={{
                  backgroundColor: index % 2 === 0 
                    ? `${theme.tableRowBorder}30` 
                    : 'transparent',
                  borderBottomColor: index !== playersArray.length - 1
                    ? theme.borderColor
                    : 'transparent',
                }}
              >
                <h3
                  className="text-xl font-bold mb-3"
                  style={{ color: theme.primary }}
                >
                  {player}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm opacity-75 mb-1" style={{ color: theme.text }}>
                      Rounds Played
                    </p>
                    <p className="text-lg font-semibold" style={{ color: theme.text }}>
                      {rounds}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm opacity-75 mb-1" style={{ color: theme.text }}>
                      Total Score
                    </p>
                    <p className="text-lg font-semibold" style={{ color: theme.text }}>
                      {totalScore}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm opacity-75 mb-1" style={{ color: theme.text }}>
                      Average Score
                    </p>
                    <p className="text-lg font-semibold" style={{ color: theme.text }}>
                      {average.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm opacity-75 mb-1" style={{ color: theme.text }}>
                      Highest Round
                    </p>
                    <p className="text-lg font-semibold" style={{ color: theme.text }}>
                      {highest}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="flex justify-center">
          <CustomButton
            title="Close"
            onPress={onClose}
            style={{ minWidth: '200px' }}
          />
        </div>
      </div>
    </Modal>
  );
};

export default StatsModal;
