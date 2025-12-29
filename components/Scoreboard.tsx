// components/Scoreboard.tsx
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus } from 'react-icons/fi';
import storage from '../utils/storage';
import ScoreEntry from './ScoreEntry';
import GameOverModal from './GameOverModal';
import Header from './Header';
import EditScoreModal from './EditScoreModal';
import CustomButton from './CustomButton';
import { ThemeContext, darkTheme } from './ThemeContext';
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from './ui/drawer';

interface Score {
  id: number;
  player: string;
  score: number;
  note: string;
}

const Scoreboard: React.FC = () => {
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [players, setPlayers] = useState<string[]>([]);
  const [targetScore, setTargetScore] = useState<number>(10000);
  const [scores, setScores] = useState<Score[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState('');
  const [editingEntry, setEditingEntry] = useState<Score | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const currentPlayer = players[currentPlayerIndex];
  const isDark = theme.primary === darkTheme.primary;

  // Load game configuration and state from localStorage
  useEffect(() => {
    const loadGame = async () => {
      try {
        // Load game configuration (players and targetScore)
        const gameConfigData = await storage.getItem('GAME_CONFIG');
        if (!gameConfigData) {
          // No game config found, redirect to home
          navigate('/');
          return;
        }
        
        const config = JSON.parse(gameConfigData);
        if (!config.players || config.players.length === 0) {
          // Invalid config, redirect to home
          navigate('/');
          return;
        }
        
        setPlayers(config.players || []);
        setTargetScore(config.targetScore || 10000);

        // Load saved game state
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
        // If there's an error, redirect to home
        navigate('/');
      }
    };
    loadGame();
  }, [navigate]);

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

  const handleRestart = () => {
    navigate('/');
  };

  return (
    <div className="flex flex-col relative min-h-screen">
      <Header />
      <div
        className="flex-1 p-6 md:p-8 pb-20"
        style={{ backgroundColor: theme.background }}
      >
        <div className="max-w-full mx-auto">
          {/* Mobile Card View */}
          <div className="block md:hidden space-y-4">
            {/* Totals Card */}
            <div 
              className="card overflow-hidden"
              style={{ 
                backgroundColor: theme.cardBackground,
                boxShadow: `0 8px 24px ${theme.shadowColor}`,
              }}
            >
              <div
                className="py-3 px-4"
                style={{ 
                  backgroundColor: theme.tableHeader,
                  borderBottom: `2px solid ${theme.borderColor}`,
                }}
              >
                <span
                  className="text-base font-bold uppercase tracking-wide"
                  style={{ color: theme.text }}
                >
                  Totals
                </span>
              </div>
              <div className="p-4 space-y-3">
                {players.map((player, index) => {
                  const total = scores
                    .filter(entry => entry.player === player)
                    .reduce((sum, entry) => sum + entry.score, 0);
                  return (
                    <div
                      key={index}
                      className="flex justify-between items-center py-2 px-3 rounded-lg"
                      style={{
                        backgroundColor: index % 2 === 0 
                          ? `${theme.tableRowBorder}20` 
                          : 'transparent',
                      }}
                    >
                      <span
                        className="text-base font-semibold"
                        style={{ color: theme.text }}
                      >
                        {player}
                      </span>
                      <span
                        className="text-lg font-bold"
                        style={{ color: theme.primary }}
                      >
                        {total}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Rounds Cards */}
            {tableData.map((row, rIndex) => (
              <div
                key={rIndex}
                className="card overflow-hidden"
                style={{ 
                  backgroundColor: theme.cardBackground,
                  boxShadow: `0 8px 24px ${theme.shadowColor}`,
                }}
              >
                <div
                  className="py-3 px-4"
                  style={{ 
                    backgroundColor: theme.tableHeader,
                    borderBottom: `2px solid ${theme.borderColor}`,
                  }}
                >
                  <span
                    className="text-base font-bold uppercase tracking-wide"
                    style={{ color: theme.text }}
                  >
                    Round {row[0]}
                  </span>
                </div>
                <div className="p-4 space-y-3">
                  {players.map((player, pIndex) => {
                    const scoreIndex = rIndex * players.length + pIndex;
                    const score = scoreIndex < scores.length ? scores[scoreIndex] : null;
                    return (
                      <button
                        key={pIndex}
                        className="w-full flex justify-between items-center py-2 px-3 rounded-lg transition-all duration-200 hover:bg-opacity-20"
                        style={{
                          backgroundColor: pIndex % 2 === 0 
                            ? `${theme.tableRowBorder}20` 
                            : 'transparent',
                        }}
                        onClick={() => {
                          if (score) {
                            setEditingEntry(score);
                          }
                        }}
                        onMouseEnter={(e) => {
                          if (score) {
                            e.currentTarget.style.backgroundColor = `${theme.secondary}20`;
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = pIndex % 2 === 0 
                            ? `${theme.tableRowBorder}20` 
                            : 'transparent';
                        }}
                      >
                        <span
                          className="text-base font-semibold"
                          style={{ color: theme.text }}
                        >
                          {player}
                        </span>
                        <span
                          className="text-base font-bold"
                          style={{ color: score ? theme.primary : theme.text }}
                        >
                          {score ? score.score : '-'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block">
            <div 
              className="card overflow-hidden"
              style={{ 
                backgroundColor: theme.cardBackground,
                boxShadow: `0 8px 24px ${theme.shadowColor}`,
              }}
            >
              <div className="overflow-x-auto">
                <div className="inline-block min-w-full">
                  {/* Table Header */}
                  <div
                    className="flex flex-row py-4 px-4 sticky top-0 z-10"
                    style={{ 
                      backgroundColor: theme.tableHeader,
                      borderBottom: `2px solid ${theme.borderColor}`,
                    }}
                  >
                    <div
                      className="flex justify-center items-center px-2"
                      style={{ width: columnWidth }}
                    >
                      <span
                        className="text-base font-bold text-center uppercase tracking-wide"
                        style={{ color: theme.text }}
                      >
                        Round
                      </span>
                    </div>
                    {players.map((player, index) => (
                      <div
                        key={index}
                        className="flex justify-center items-center px-2"
                        style={{ width: columnWidth }}
                      >
                        <span
                          className="text-base font-bold text-center uppercase tracking-wide"
                          style={{ color: theme.text }}
                        >
                          {player}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Table Body */}
                  <div className="max-h-[300px] overflow-y-auto">
                    {tableData.map((row, rIndex) => (
                      <div
                        key={rIndex}
                        className={`flex flex-row py-3 px-4 transition-all duration-200 ${
                          rIndex % 2 === 0 ? '' : 'bg-opacity-50'
                        } hover:bg-opacity-80`}
                        style={{
                          backgroundColor: rIndex % 2 === 0 
                            ? 'transparent' 
                            : `${theme.tableRowBorder}40`,
                          borderBottom: `1px solid ${theme.borderColor}`,
                        }}
                      >
                        {row.map((cell, cIndex) => (
                          <button
                            key={cIndex}
                            className={`flex justify-center items-center px-2 transition-all duration-200 ${
                              cIndex === 0 
                                ? 'cursor-default font-semibold' 
                                : 'cursor-pointer hover:bg-opacity-20 rounded-md'
                            }`}
                            style={{ 
                              width: columnWidth,
                              backgroundColor: cIndex !== 0 ? 'transparent' : 'transparent',
                            }}
                            onClick={() => handleCellPress(rIndex, cIndex)}
                            onMouseEnter={(e) => {
                              if (cIndex !== 0) {
                                e.currentTarget.style.backgroundColor = `${theme.secondary}20`;
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (cIndex !== 0) {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }
                            }}
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
                  
                  {/* Totals Row */}
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
                        className="flex justify-center items-center px-2"
                        style={{ width: columnWidth }}
                      >
                        <span
                          className="text-lg font-bold text-center"
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
          </div>
        </div>
      </div>
      {/* Drawer for score entry */}
      <Drawer 
        open={drawerOpen} 
        onOpenChange={setDrawerOpen}
        shouldScaleBackground={false}
        dismissible={true}
      >
        <DrawerContent 
          showOverlay={false}
          className="rounded-t-3xl border-0"
          style={{ 
            backgroundColor: theme.cardBackground,
            borderTop: `2px solid ${theme.borderColor}`,
          }}
        >
          <div className="p-6 pb-8" style={{ paddingBottom: `calc(2rem + env(safe-area-inset-bottom))` }}>
            <ScoreEntry 
              onAddEntry={(score, note) => {
                addScoreEntry(score, note);
                setDrawerOpen(false);
              }} 
              currentPlayer={currentPlayer} 
            />
          </div>
        </DrawerContent>
      </Drawer>
      
      {/* Bottom tab trigger - shown when drawer is closed */}
      {!drawerOpen && (
        <button
          className="fixed bottom-0 left-1/2 transform -translate-x-1/2 z-50 mb-4 px-6 py-3 rounded-t-2xl shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
          style={{
            backgroundColor: theme.secondary,
            boxShadow: `0 4px 14px 0 ${theme.shadowColor}`,
            paddingBottom: `calc(0.75rem + env(safe-area-inset-bottom))`,
          }}
          onClick={() => setDrawerOpen(true)}
        >
          <div className="flex items-center justify-center gap-2">
            <FiPlus 
              className="w-5 h-5" 
              style={{ color: '#ffffff' }}
            />
            <span 
              className="font-semibold text-base"
              style={{ color: '#ffffff' }}
            >
              Add Score
            </span>
          </div>
        </button>
      )}
      {gameOver && (
        <GameOverModal
          visible={gameOver}
          winner={winner}
          finalScores={sortedFinalScores}
          onRestart={handleRestart}
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
