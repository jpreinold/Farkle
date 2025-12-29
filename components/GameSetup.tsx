// components/GameSetup.tsx
import React, { useContext, useState } from 'react';
import CustomButton from './CustomButton';
import Header from './Header';
import { ThemeContext } from './ThemeContext';

interface GameSetupProps {
  onStartGame: (players: string[], targetScore: number) => void;
  headerOnPress?: () => void;
}

const GameSetup: React.FC<GameSetupProps> = ({ onStartGame, headerOnPress }) => {
  const { theme } = useContext(ThemeContext);
  const [targetScore, setTargetScore] = useState('10000');
  const [playerName, setPlayerName] = useState('');
  const [players, setPlayers] = useState<string[]>([]);

  const addPlayer = () => {
    if (playerName.trim() !== '') {
      setPlayers([...players, playerName.trim()]);
      setPlayerName('');
    }
  };

  return (
    <>
      <Header onPress={headerOnPress} />
      <div
        className="flex-1 p-4"
        style={{ backgroundColor: theme.background }}
      >
        <h2
          className="text-3xl font-bold text-center my-2.5"
          style={{ color: theme.text }}
        >
          Game Setup
        </h2>
        {/* Target Score Section */}
        <div className="mb-4">
          <label
            className="text-base mb-1 block"
            style={{ color: theme.text }}
          >
            Target Score:
          </label>
          <input
            type="number"
            className="w-full border rounded-lg py-3 px-3 text-base mr-2"
            style={{
              borderColor: theme.inputBorder,
              color: theme.text,
              backgroundColor: theme.background,
            }}
            placeholder="Enter target score"
            value={targetScore}
            onChange={(e) => setTargetScore(e.target.value)}
            aria-label="Target Score Input"
          />
        </div>
        {/* Player Name Section */}
        <div className="mb-4">
          <label
            className="text-base mb-1 block"
            style={{ color: theme.text }}
          >
            Player Name:
          </label>
          <div className="flex flex-row items-center">
            <input
              type="text"
              className="flex-1 border rounded-lg py-3 px-3 text-base mr-2"
              style={{
                borderColor: theme.inputBorder,
                color: theme.text,
                backgroundColor: theme.background,
              }}
              placeholder="Enter player name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addPlayer();
                }
              }}
              aria-label="Player Name Input"
            />
            <CustomButton title="Add Player" onPress={addPlayer} />
          </div>
        </div>
        {/* Display Player Chips */}
        {players.length > 0 && (
          <div className="flex flex-row flex-wrap mb-4">
            {players.map((player, index) => (
              <div
                key={index}
                className="py-1.5 px-3 rounded-full mr-2 mb-2"
                style={{ backgroundColor: theme.secondary }}
              >
                <span className="text-base text-white">{player}</span>
              </div>
            ))}
          </div>
        )}
        {/* Start Game Button */}
        {players.length > 0 && (
          <CustomButton
            title="Start Game"
            onPress={() => onStartGame(players, parseInt(targetScore, 10) || 10000)}
          />
        )}
      </div>
    </>
  );
};

export default GameSetup;
