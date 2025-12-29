// components/GameSetupSimulation.tsx
import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomButton from './CustomButton';
import Header from './Header';
import { ThemeContext } from './ThemeContext';
import storage from '../utils/storage';

const GameSetupSimulation: React.FC = () => {
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [targetScore, setTargetScore] = useState('10000');
  const [playerName, setPlayerName] = useState('');
  const [players, setPlayers] = useState<string[]>([]);

  const addPlayer = () => {
    if (playerName.trim() !== '') {
      setPlayers([...players, playerName.trim()]);
      setPlayerName('');
    }
  };

  const handleStartSimulation = async () => {
    if (players.length === 0) return;

    const target = parseInt(targetScore, 10) || 10000;

    try {
      const gameConfig = {
        players,
        targetScore: target,
      };
      await storage.setItem('GAME_CONFIG_SIMULATION', JSON.stringify(gameConfig));
      await storage.removeItem('GAME_STATE_SIMULATION');
      navigate('/game');
    } catch (error) {
      console.error('Error saving simulation game configuration:', error);
    }
  };

  return (
    <>
      <Header />
      <div
        className="flex-1 p-6 md:p-8"
        style={{ backgroundColor: theme.background }}
      >
        <div className="max-w-2xl mx-auto">
          <h2
            className="text-3xl md:text-4xl font-bold text-center mb-2"
            style={{ color: theme.titleText }}
          >
            Simulation Setup
          </h2>
          <p
            className="text-center mb-8 opacity-80"
            style={{ color: theme.text }}
          >
            Configure players and target score for the virtual dice experience.
          </p>

          {/* Target Score Card */}
          <div
            className="card mb-6"
            style={{
              backgroundColor: theme.cardBackground,
              boxShadow: `0 4px 16px ${theme.shadowColor}`,
            }}
          >
            <label
              className="text-lg font-semibold mb-3 block"
              style={{ color: theme.text }}
            >
              Target Score
            </label>
            <input
              type="number"
              className="input-modern w-full focus:ring-2 focus:ring-offset-2"
              style={{
                borderColor: theme.inputBorder,
                color: theme.text,
                backgroundColor: theme.cardBackground,
              }}
              onFocus={(e) => {
                e.target.style.borderColor = theme.secondary;
                e.target.style.boxShadow = `0 0 0 3px ${theme.secondary}40`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = theme.inputBorder;
                e.target.style.boxShadow = 'none';
              }}
              placeholder="Enter target score"
              value={targetScore}
              onChange={(e) => setTargetScore(e.target.value)}
              aria-label="Simulation Target Score Input"
            />
          </div>

          {/* Player Name Card */}
          <div
            className="card mb-6"
            style={{
              backgroundColor: theme.cardBackground,
              boxShadow: `0 4px 16px ${theme.shadowColor}`,
            }}
          >
            <label
              className="text-lg font-semibold mb-3 block"
              style={{ color: theme.text }}
            >
              Add Players
            </label>
            <div className="flex flex-row items-center gap-3">
              <input
                type="text"
                className="input-modern flex-1 focus:ring-2 focus:ring-offset-2"
                style={{
                  borderColor: theme.inputBorder,
                  color: theme.text,
                  backgroundColor: theme.cardBackground,
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = theme.secondary;
                  e.target.style.boxShadow = `0 0 0 3px ${theme.secondary}40`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = theme.inputBorder;
                  e.target.style.boxShadow = 'none';
                }}
                placeholder="Enter player name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addPlayer();
                  }
                }}
                aria-label="Simulation Player Name Input"
              />
              <CustomButton title="Add" onPress={addPlayer} />
            </div>
          </div>

          {/* Player Chips */}
          {players.length > 0 && (
            <div
              className="card mb-6"
              style={{
                backgroundColor: theme.cardBackground,
                boxShadow: `0 4px 16px ${theme.shadowColor}`,
              }}
            >
              <label
                className="text-lg font-semibold mb-3 block"
                style={{ color: theme.text }}
              >
                Players ({players.length})
              </label>
              <div className="flex flex-row flex-wrap gap-3">
                {players.map((player, index) => (
                  <div
                    key={index}
                    className="py-2 px-4 rounded-full transition-all duration-200 hover:scale-105 hover:shadow-md"
                    style={{
                      backgroundColor: theme.secondary,
                      boxShadow: `0 2px 8px ${theme.shadowColor}`,
                    }}
                  >
                    <span className="text-base font-medium text-white">{player}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Start Simulation Button */}
          {players.length > 0 && (
            <div className="flex justify-center">
              <CustomButton
                title="Start Simulation"
                onPress={handleStartSimulation}
                style={{ minWidth: '220px', paddingLeft: '32px', paddingRight: '32px' }}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default GameSetupSimulation;


