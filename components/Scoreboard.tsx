// components/Scoreboard.tsx
import React, { useState, useEffect, useContext } from 'react';
import storage from '../utils/storage';
import ScoreEntry from './ScoreEntry';
import GameOverModal from './GameOverModal';
import Header from './Header';
import EditScoreModal from './EditScoreModal';
import CustomButton from './CustomButton';
import { ThemeContext, darkTheme } from './ThemeContext';

interface Score {
  id: number;
  player: string;
  score: number;
  note: string;
}

interface ScoreboardProps {
  players: string[];
  targetScore: number;
  onRestart: () => void;
  headerOnPress: () => void;
  continueGame?: boolean;
}

const Scoreboard: React.FC<ScoreboardProps> = ({
  players,
  targetScore,
  onRestart,
  headerOnPress,
  continueGame = false,
}) => {
  const { theme } = useContext(ThemeContext);
  const [scores, setScores] = useState<Score[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState('');
  const [editingEntry, setEditingEntry] = useState<Score | null>(null);

  const currentPlayer = players[currentPlayerIndex];
  const isDark = theme.primary === darkTheme.primary;

  // Load saved game state if continueGame is true.
  useEffect(() => {
    if (continueGame) {
      const loadGameState = async () => {
        try {
          const savedState = await storage.getItem('GAME_STATE');
          if (savedState !== null) {
            const state = JSON.parse(savedState);
            setScores(state.scores || []);
            setCurrentPlayerIndex(state.currentPlayerIndex || 0);
            setGameOver(state.gameOver || false);
            setWinner(state.winner || '');
          }
        } catch (error) {
          console.error('Error loading game state', error);
        }
      };
      loadGameState();
    }
  }, [continueGame]);

  // Persist game state whenever it changes.
  useEffect(() => {
    const saveGameState = async () => {
      try {
        const state = { scores, currentPlayerIndex, gameOver, winner };
        await storage.setItem('GAME_STATE', JSON.stringify(state));
      } catch (error) {
        console.error('Error saving game state', error);
      }
    };
    saveGameState();
  }, [scores, currentPlayerIndex, gameOver, winner]);

  // Check for game over condition.
  useEffect(() => {
    const totals = players.reduce((acc, player) => {
      acc[player] = scores
        .filter((entry) => entry.player === player)
        .reduce((sum, entry) => sum + entry.score, 0);
      return acc;
    }, {} as Record<string, number>);

    for (const player of players) {
      if (totals[player] >= targetScore) {
        setGameOver(true);
        setWinner(player);
        return;
      }
    }
    setGameOver(false);
    setWinner('');
  }, [scores, players, targetScore]);

  // Save game history when game is over.
  useEffect(() => {
    const saveGameHistory = async () => {
      if (gameOver) {
        const finalTotals = players.reduce((acc, player) => {
          acc[player] = scores
            .filter(entry => entry.player === player)
            .reduce((sum, entry) => sum + entry.score, 0);
          return acc;
        }, {} as Record<string, number>);

        const sortedFinalScores = Object.entries(finalTotals)
          .map(([player, total]) => ({ player, total }))
          .sort((a, b) => b.total - a.total);

        const gameHistoryRecord = {
          id: Date.now().toString(),
          date: new Date().toLocaleString(),
          winner,
          players,
          targetScore,
          scores,
          finalScores: sortedFinalScores,
        };

        try {
          const existingHistory = await storage.getItem('GAME_HISTORY');
          const historyArray = existingHistory ? JSON.parse(existingHistory) : [];
          historyArray.push(gameHistoryRecord);
          await storage.setItem('GAME_HISTORY', JSON.stringify(historyArray));
          console.log('Game history saved.');
        } catch (error) {
          console.error('Error saving game history', error);
        }
      }
    };

    saveGameHistory();
  }, [gameOver, scores, players, winner, targetScore]);

  const addScoreEntry = (score: number, note: string) => {
    if (gameOver) return;
    const newEntry: Score = {
      id: scores.length + 1,
      player: currentPlayer,
      score,
      note,
    };
    setScores([...scores, newEntry]);
    switchPlayer();
  };

  const switchPlayer = () => {
    if (gameOver) return;
    setCurrentPlayerIndex((currentPlayerIndex + 1) % players.length);
  };

  const saveEditedEntry = (editedEntry: Score) => {
    setScores(scores.map(entry => (entry.id === editedEntry.id ? editedEntry : entry)));
    setEditingEntry(null);
  };

  // Build table data (round-by-round scores).
  const numRounds = Math.ceil(scores.length / players.length);
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

  // Totals row.
  const totalsRow: (string | number)[] = ["Total"];
  players.forEach(player => {
    const total = scores
      .filter(entry => entry.player === player)
      .reduce((sum, entry) => sum + entry.score, 0);
    totalsRow.push(total);
  });

  const finalTotals = players.reduce((acc, player) => {
    acc[player] = scores
      .filter(entry => entry.player === player)
      .reduce((sum, entry) => sum + entry.score, 0);
    return acc;
  }, {} as Record<string, number>);
  const sortedFinalScores = Object.entries(finalTotals)
    .map(([player, total]) => ({ player, total }))
    .sort((a, b) => b.total - a.total);

  const handleCellPress = (rIndex: number, cIndex: number) => {
    if (cIndex === 0) return;
    const scoreIndex = rIndex * players.length + (cIndex - 1);
    if (scoreIndex < scores.length) {
      setEditingEntry(scores[scoreIndex]);
    }
  };

  // Calculate column width based on viewport
  const calculateColumnWidth = () => {
    const screenWidth = window.innerWidth - 32;
    const totalColumns = players.length + 1;
    const minColumnWidth = 80;
    return totalColumns * minColumnWidth < screenWidth
      ? screenWidth / totalColumns
      : minColumnWidth;
  };

  const [columnWidth, setColumnWidth] = useState(calculateColumnWidth());

  useEffect(() => {
    const handleResize = () => {
      setColumnWidth(calculateColumnWidth());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [players.length]);

  return (
    <div className="flex flex-col relative min-h-screen">
      <Header onPress={headerOnPress} />
      <div
        className="flex-1 p-4 pb-72"
        style={{ backgroundColor: theme.background }}
      >
        <div className="overflow-x-auto">
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
                    <button
                      key={cIndex}
                      className={`flex justify-center items-center p-1 ${
                        cIndex === 0 ? 'cursor-default' : 'cursor-pointer hover:opacity-70'
                      }`}
                      style={{ width: columnWidth }}
                      onClick={() => handleCellPress(rIndex, cIndex)}
                    >
                      <span
                        className="text-base text-center"
                        style={{ color: theme.text }}
                      >
                        {cell}
                      </span>
                    </button>
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
      </div>
      {/* Footer with score entry */}
      <div 
        className="fixed bottom-0 left-0 right-0 transition-all duration-250 z-40"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <ScoreEntry onAddEntry={addScoreEntry} currentPlayer={currentPlayer} />
      </div>
      {gameOver && (
        <GameOverModal
          visible={gameOver}
          winner={winner}
          finalScores={sortedFinalScores}
          onRestart={onRestart}
        />
      )}
      {editingEntry && (
        <EditScoreModal
          visible={true}
          entry={editingEntry}
          onSave={saveEditedEntry}
          onCancel={() => setEditingEntry(null)}
        />
      )}
    </div>
  );
};

export default Scoreboard;
