// components/HistoryPage.tsx
import React, { useState, useEffect, useContext } from 'react';
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

interface HistoryPageProps {
  onBack: () => void;
}

const HistoryPage: React.FC<HistoryPageProps> = ({ onBack }) => {
  const { theme } = useContext(ThemeContext);
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
    const backgroundColor = isDark ? theme.secondary : theme.secondary + '33';
    const winnerColor = isDark ? theme.text : theme.primary;

    return (
      <button
        key={game.id}
        className="p-3 rounded-lg mb-3 w-full text-left shadow-md"
        style={{ backgroundColor }}
        onClick={() => setSelectedGame(game)}
      >
        <p
          className="text-base font-semibold mb-1"
          style={{ color: theme.text }}
        >
          {game.date}
        </p>
        <p
          className="text-base"
          style={{ color: winnerColor }}
        >
          Winner: {game.winner}
        </p>
        <p
          className="text-base mt-1"
          style={{ color: theme.text }}
        >
          Players: {game.players.join(', ')}
        </p>
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

    const isDark = theme.primary === darkTheme.primary;

    return (
      <Modal
        visible={true}
        animationType="slide"
        onRequestClose={() => setSelectedGame(null)}
      >
        <div
          className="w-[90%] h-[70%] rounded-lg p-6 flex flex-col items-center overflow-auto"
          style={{ backgroundColor: theme.modalBackground }}
        >
          <h2
            className="text-2xl font-bold mb-3"
            style={{ color: theme.titleText }}
          >
            Game Details
          </h2>
          <p
            className="text-lg mb-2"
            style={{ color: theme.text }}
          >
            Date: {selectedGame.date}
          </p>
          <p
            className="text-lg mb-2"
            style={{ color: theme.text }}
          >
            Winner: {selectedGame.winner}
          </p>
          <div className="overflow-x-auto w-full">
            <div className="rounded-lg overflow-hidden inline-block min-w-full">
              <div
                className="flex flex-row py-2 px-1"
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
              <div className="max-h-[250px] overflow-y-auto">
                {tableData.map((row, rIndex) => (
                  <div
                    key={rIndex}
                    className={`flex flex-row py-2 px-1 border-b ${
                      isDark ? '' : 'border-opacity-20'
                    }`}
                    style={{
                      borderBottomColor: isDark
                        ? theme.secondary
                        : theme.secondary + '33',
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
                className="flex flex-row py-2 px-1"
                style={{ backgroundColor: theme.tableRowBorder }}
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
          <div className="mt-5 w-4/5">
            <CustomButton
              title="Close"
              onPress={() => setSelectedGame(null)}
            />
          </div>
        </div>
      </Modal>
    );
  };

  return (
    <>
      <Header onPress={onBack} />
      <div
        className="flex-1 p-4 flex flex-col items-center"
        style={{ backgroundColor: theme.background }}
      >
        <h2
          className="text-3xl font-bold mb-6"
          style={{ color: theme.titleText }}
        >
          Game History
        </h2>
        <div className="flex-1 self-stretch mb-4 overflow-y-auto">
          {history.length > 0 ? (
            history.map((game) => renderHistoryItem(game))
          ) : (
            <p
              className="text-base text-center my-5"
              style={{ color: theme.text }}
            >
              No game history available.
            </p>
          )}
        </div>
        <CustomButton title="Back" onPress={onBack} style={{ width: '80%', marginVertical: 12 }} />
      </div>
      {renderGameDetailsModal()}
    </>
  );
};

export default HistoryPage;
