// components/Scoreboard.tsx
import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ScoreEntry from './ScoreEntry';
import GameOverModal from './GameOverModal';
import Header from './Header';
import EditScoreModal from './EditScoreModal';
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
  const isDark = theme.primary === darkTheme.primary; // determine if dark mode

  // Calculate dynamic column width
  const screenWidth = Dimensions.get('window').width - 32;
  const totalColumns = players.length + 1;
  const minColumnWidth = 80;
  const computedColumnWidth =
    totalColumns * minColumnWidth < screenWidth
      ? screenWidth / totalColumns
      : minColumnWidth;

  // Load saved game state if continueGame is true.
  useEffect(() => {
    if (continueGame) {
      const loadGameState = async () => {
        try {
          const savedState = await AsyncStorage.getItem('GAME_STATE');
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
        await AsyncStorage.setItem('GAME_STATE', JSON.stringify(state));
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
          const existingHistory = await AsyncStorage.getItem('GAME_HISTORY');
          const historyArray = existingHistory ? JSON.parse(existingHistory) : [];
          historyArray.push(gameHistoryRecord);
          await AsyncStorage.setItem('GAME_HISTORY', JSON.stringify(historyArray));
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

  return (
    <>
      <Header onPress={headerOnPress} />
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ScrollView horizontal>
          <View style={styles.tableContainer}>
            <View style={[styles.tableRowHeader, { backgroundColor: theme.tableHeader }]}>
              <View style={[styles.tableCell, { width: computedColumnWidth }]}>
                <Text style={[styles.headerText, { color: theme.text }]}>Round</Text>
              </View>
              {players.map((player, index) => (
                <View key={index} style={[styles.tableCell, { width: computedColumnWidth }]}>
                  <Text style={[styles.headerText, { color: theme.text }]}>{player}</Text>
                </View>
              ))}
            </View>
            <ScrollView style={styles.tableBody}>
              {tableData.map((row, rIndex) => (
                <View
                  key={rIndex}
                  style={[
                    styles.tableRow,
                    { borderColor: isDark ? theme.secondary : theme.secondary + '33' },
                  ]}
                >
                  {row.map((cell, cIndex) => (
                    <TouchableOpacity
                      key={cIndex}
                      style={[styles.tableCell, { width: computedColumnWidth }]}
                      activeOpacity={cIndex === 0 ? 1 : 0.7}
                      onPress={() => handleCellPress(rIndex, cIndex)}
                    >
                      <Text style={[styles.cellText, { color: theme.text }]}>{cell}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </ScrollView>
            <View style={[styles.totalsRow, { backgroundColor: theme.tableRowBorder }]}>
              {totalsRow.map((cell, index) => (
                <View key={index} style={[styles.tableCell, { width: computedColumnWidth }]}>
                  <Text style={[styles.headerText, styles.totalText, { color: theme.text }]}>{cell}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.entrySection}
          keyboardVerticalOffset={80}
        >
          <Text style={[styles.currentPlayerText, { color: theme.text }]}>
            Current Player: {currentPlayer}
          </Text>
          <ScoreEntry onAddEntry={addScoreEntry} />
        </KeyboardAvoidingView>

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
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  tableContainer: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableRowHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  tableCell: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  cellText: {
    fontSize: 16,
    textAlign: 'center',
  },
  tableBody: {
    maxHeight: 250,
  },
  totalsRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  totalText: {
    fontWeight: '700',
  },
  entrySection: {
    paddingVertical: 16,
  },
  currentPlayerText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
});

export default Scoreboard;
