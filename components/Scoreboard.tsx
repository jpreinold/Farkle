// components/Scoreboard.tsx
import React, { useState, useEffect } from 'react';
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
  const [scores, setScores] = useState<Score[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState('');
  const [editingEntry, setEditingEntry] = useState<Score | null>(null);

  const currentPlayer = players[currentPlayerIndex];

  // Calculate dynamic column width
  const screenWidth = Dimensions.get('window').width - 32; // 16 padding each side
  const totalColumns = players.length + 1; // "Round" column + one per player
  const minColumnWidth = 80;
  const computedColumnWidth =
    totalColumns * minColumnWidth < screenWidth
      ? screenWidth / totalColumns
      : minColumnWidth;

  // Only load saved game state if continueGame is true.
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

  // Persist game state whenever it changes
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

  // Check for game over condition
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
        // Compute final totals for each player.
        const finalTotals = players.reduce((acc, player) => {
          acc[player] = scores
            .filter(entry => entry.player === player)
            .reduce((sum, entry) => sum + entry.score, 0);
          return acc;
        }, {} as Record<string, number>);

        const sortedFinalScores = Object.entries(finalTotals)
          .map(([player, total]) => ({ player, total }))
          .sort((a, b) => b.total - a.total);

        // Create a game history record with complete data.
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

  // Add a score entry then switch player automatically.
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

  // Update a score entry after editing.
  const saveEditedEntry = (editedEntry: Score) => {
    setScores(scores.map(entry => (entry.id === editedEntry.id ? editedEntry : entry)));
    setEditingEntry(null);
  };

  // Build table data: Each row represents a round.
  // We assume scores are recorded in strict round-robin order.
  const numPlayers = players.length;
  const numRounds = Math.ceil(scores.length / numPlayers);
  const tableData: (string | number)[][] = [];
  for (let r = 0; r < numRounds; r++) {
    const row: (string | number)[] = [];
    row.push(r + 1); // first cell is the round number
    for (let j = 0; j < numPlayers; j++) {
      const index = r * numPlayers + j;
      row.push(index < scores.length ? scores[index].score : '-');
    }
    tableData.push(row);
  }

  // Compute totals row for display in table.
  const totalsRow: (string | number)[] = ["Total"];
  players.forEach(player => {
    const total = scores
      .filter(entry => entry.player === player)
      .reduce((sum, entry) => sum + entry.score, 0);
    totalsRow.push(total);
  });

  // Compute final totals and sorted final scores (for modal).
  const finalTotals = players.reduce((acc, player) => {
    acc[player] = scores
      .filter(entry => entry.player === player)
      .reduce((sum, entry) => sum + entry.score, 0);
    return acc;
  }, {} as Record<string, number>);
  const sortedFinalScores = Object.entries(finalTotals)
    .map(([player, total]) => ({ player, total }))
    .sort((a, b) => b.total - a.total);

  // Function to handle tap on a table cell (if editable).
  // We allow editing if the cell is not in the first column and contains a valid score.
  const handleCellPress = (rIndex: number, cIndex: number) => {
    if (cIndex === 0) return; // don't allow editing the round number
    const scoreIndex = rIndex * numPlayers + (cIndex - 1);
    if (scoreIndex < scores.length) {
      setEditingEntry(scores[scoreIndex]);
    }
  };

  return (
    <>
      <Header onPress={headerOnPress} />
      <View style={styles.container}>
        <ScrollView horizontal>
          <View>
            {/* Header Row */}
            <View style={styles.tableRowHeader}>
              <View style={[styles.tableCell, { width: computedColumnWidth }]}>
                <Text style={styles.headerText}>Round</Text>
              </View>
              {players.map((player, index) => (
                <View key={index} style={[styles.tableCell, { width: computedColumnWidth }]}>
                  <Text style={styles.headerText}>{player}</Text>
                </View>
              ))}
            </View>
            {/* Data Rows */}
            <ScrollView style={styles.tableBody}>
              {tableData.map((row, rIndex) => (
                <View key={rIndex} style={styles.tableRow}>
                  {row.map((cell, cIndex) => (
                    <TouchableOpacity
                      key={cIndex}
                      style={[styles.tableCell, { width: computedColumnWidth }]}
                      activeOpacity={cIndex === 0 ? 1 : 0.7}
                      onPress={() => handleCellPress(rIndex, cIndex)}
                    >
                      <Text style={styles.cellText}>{cell}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </ScrollView>
            {/* Totals Row */}
            <View style={styles.totalsRow}>
              {totalsRow.map((cell, index) => (
                <View key={index} style={[styles.tableCell, { width: computedColumnWidth }]}>
                  <Text style={[styles.headerText, styles.totalText]}>{cell}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Score Entry Section wrapped in KeyboardAvoidingView */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.entrySection}
          keyboardVerticalOffset={80}
        >
          <Text style={styles.currentPlayerText}>
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
    backgroundColor: '#F5F7FA',
    padding: 16,
  },
  tableRowHeader: {
    flexDirection: 'row',
    backgroundColor: '#ddd',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#eee',
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
    color: '#333',
    textAlign: 'center',
  },
  cellText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  tableBody: {
    maxHeight: 400,
  },
  totalsRow: {
    flexDirection: 'row',
    backgroundColor: '#ccc',
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
    marginBottom: 12,
    color: '#333',
  },
});

export default Scoreboard;
