// components/HistoryPage.tsx
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import storage from '../utils/storage';
import CustomButton from './CustomButton';
import Header from './Header';
import Modal from './Modal';
import { ThemeContext, darkTheme } from './ThemeContext';

interface Score {
  id: number;
  player: string;
  score: number;
  note: string;
}

interface GameHistory {
  id: string;
  date: string;
  winner: string;
  players: string[];
  targetScore: number;
  scores: Score[];
  finalScores: { player: string; total: number }[];
}

const HistoryPage: React.FC = () => {
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [history, setHistory] = useState<GameHistory[]>([]);
  const [selectedGame, setSelectedGame] = useState<GameHistory | null>(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const historyData = await storage.getItem('GAME_HISTORY');
        if (historyData) {
          setHistory(JSON.parse(historyData));
        }
      } catch (error) {
        console.error('Error loading game history', error);
      }
    };
    loadHistory();
  }, []);

  const renderHistoryItem = (game: GameHistory) => {
    const isDark = theme.primary === darkTheme.primary;
    const winnerColor = isDark ? theme.text : theme.primary;

    return (
      <button
        key={game.id}
        className="card card-hover w-full text-left mb-4 transition-all duration-200"
        style={{ 
          backgroundColor: theme.cardBackground,
          boxShadow: `0 4px 16px ${theme.shadowColor}`,
        }}
        onClick={() => setSelectedGame(game)}
      >
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <p
              className="text-lg font-bold"
              style={{ color: theme.titleText }}
            >
              {game.date}
            </p>
            <div 
              className="px-3 py-1 rounded-full text-sm font-semibold"
              style={{ 
                backgroundColor: theme.secondary,
                color: '#ffffff',
              }}
            >
              {game.players.length} Players
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="text-base font-semibold"
              style={{ color: theme.text }}
            >
              Winner:
            </span>
            <span
              className="text-base font-bold"
              style={{ color: winnerColor }}
            >
              {game.winner}
            </span>
          </div>
          <p
            className="text-sm opacity-75"
            style={{ color: theme.text }}
          >
            Players: {game.players.join(', ')}
          </p>
        </div>
      </button>
    );
  };

  const renderGameDetailsModal = () => {
    if (!selectedGame) return null;

    const players = selectedGame.players;
    const scores = selectedGame.scores;
    const numPlayers = players.length;
    const numRounds = Math.ceil(scores.length / numPlayers);
    const tableData: (string | number)[][] = [];
    for (let r = 0; r < numRounds; r++) {
      const row: (string | number)[] = [];
      row.push(r + 1);
      for (let j = 0; j < players.length; j++) {
        const index = r * players.length + j;
        row.push(index < scores.length ? scores[index].score : '-');
      }
      tableData.push(row);
    }

    const totalsRow: (string | number)[] = ['Total'];
    players.forEach((player) => {
      const total = scores
        .filter((entry) => entry.player === player)
        .reduce((sum, entry) => sum + entry.score, 0);
      totalsRow.push(total);
    });

    const calculateColumnWidth = () => {
      const screenWidth = window.innerWidth - 32;
      const totalColumns = players.length + 1;
      const minColumnWidth = 80;
      return totalColumns * minColumnWidth < screenWidth
        ? screenWidth / totalColumns
        : minColumnWidth;
    };

    const [columnWidth, setColumnWidth] = React.useState(calculateColumnWidth());

    React.useEffect(() => {
      const handleResize = () => {
        setColumnWidth(calculateColumnWidth());
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, [players.length]);

    return (
      <Modal
        visible={true}
        animationType="slide"
        onRequestClose={() => setSelectedGame(null)}
      >
        <div
          className="w-[90%] max-w-4xl h-[85%] rounded-2xl p-6 md:p-8 flex flex-col overflow-auto shadow-2xl"
          style={{ backgroundColor: theme.cardBackground }}
        >
          <div className="mb-6">
            <h2
              className="text-3xl font-bold mb-4"
              style={{ color: theme.titleText }}
            >
              Game Details
            </h2>
            <div className="space-y-2">
              <p
                className="text-lg"
                style={{ color: theme.text }}
              >
                <span className="font-semibold">Date:</span> {selectedGame.date}
              </p>
              <p
                className="text-lg"
                style={{ color: theme.text }}
              >
                <span className="font-semibold">Winner:</span>{' '}
                <span style={{ color: theme.primary, fontWeight: 'bold' }}>
                  {selectedGame.winner}
                </span>
              </p>
            </div>
          </div>
          <div className="overflow-x-auto w-full">
            <div 
              className="rounded-xl overflow-hidden inline-block min-w-full shadow-md"
              style={{ 
                backgroundColor: theme.cardBackground,
                boxShadow: `0 4px 16px ${theme.shadowColor}`,
              }}
            >
              <div
                className="flex flex-row py-4 px-4"
                style={{ backgroundColor: theme.tableHeader }}
              >
                <div
                  className="flex justify-center items-center p-1"
                  style={{ width: columnWidth }}
                >
                  <span
                    className="text-base font-bold text-center"
                    style={{ color: theme.text }}
                  >
                    Round
                  </span>
                </div>
                {players.map((player, index) => (
                  <div
                    key={index}
                    className="flex justify-center items-center p-1"
                    style={{ width: columnWidth }}
                  >
                    <span
                      className="text-base font-bold text-center"
                      style={{ color: theme.text }}
                    >
                      {player}
                    </span>
                  </div>
                ))}
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {tableData.map((row, rIndex) => (
                  <div
                    key={rIndex}
                    className={`flex flex-row py-3 px-4 border-b transition-all duration-200 ${
                      rIndex % 2 === 0 ? '' : 'bg-opacity-50'
                    }`}
                    style={{
                      backgroundColor: rIndex % 2 === 0 
                        ? 'transparent' 
                        : `${theme.tableRowBorder}40`,
                      borderBottomColor: theme.borderColor,
                    }}
                  >
                    {row.map((cell, cIndex) => (
                      <div
                        key={cIndex}
                        className="flex justify-center items-center p-1"
                        style={{ width: columnWidth }}
                      >
                        <span
                          className="text-base text-center"
                          style={{ color: theme.text }}
                        >
                          {cell}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <div
                className="flex flex-row py-4 px-4 border-t-2"
                style={{ 
                  backgroundColor: theme.tableRowBorder,
                  borderTopColor: theme.secondary,
                }}
              >
                {totalsRow.map((cell, index) => (
                  <div
                    key={index}
                    className="flex justify-center items-center p-1"
                    style={{ width: columnWidth }}
                  >
                    <span
                      className="text-base font-bold text-center"
                      style={{ color: theme.text }}
                    >
                      {cell}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-center">
            <CustomButton
              title="Close"
              onPress={() => setSelectedGame(null)}
              style={{ minWidth: '200px' }}
            />
          </div>
        </div>
      </Modal>
    );
  };

  return (
    <>
      <Header />
      <div
        className="flex-1 p-6 md:p-8 flex flex-col"
        style={{ backgroundColor: theme.background }}
      >
        <div className="max-w-2xl mx-auto w-full">
          <h2
            className="text-3xl md:text-4xl font-bold mb-8 text-center"
            style={{ color: theme.titleText }}
          >
            Game History
          </h2>
          <div className="flex-1 mb-6 overflow-y-auto space-y-4">
            {history.length > 0 ? (
              history.map((game) => renderHistoryItem(game))
            ) : (
              <div 
                className="card text-center py-12"
                style={{ 
                  backgroundColor: theme.cardBackground,
                  boxShadow: `0 4px 16px ${theme.shadowColor}`,
                }}
              >
                <p
                  className="text-lg opacity-75"
                  style={{ color: theme.text }}
                >
                  No game history available.
                </p>
              </div>
            )}
          </div>
          <div className="flex justify-center">
            <CustomButton 
              title="Back" 
              onPress={() => navigate('/')} 
              style={{ minWidth: '200px' }} 
            />
          </div>
        </div>
      </div>
      {renderGameDetailsModal()}
    </>
  );
};

export default HistoryPage;
