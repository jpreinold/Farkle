// components/HistoryPage.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Modal,
  Dimensions 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomButton from './CustomButton';
import Header from './Header';

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
  const [history, setHistory] = useState<GameHistory[]>([]);
  const [selectedGame, setSelectedGame] = useState<GameHistory | null>(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const historyData = await AsyncStorage.getItem('GAME_HISTORY');
        if (historyData) {
          setHistory(JSON.parse(historyData));
        }
      } catch (error) {
        console.error('Error loading game history', error);
      }
    };
    loadHistory();
  }, []);

  const renderHistoryItem = (game: GameHistory) => (
    <TouchableOpacity
      key={game.id}
      style={styles.historyItem}
      onPress={() => setSelectedGame(game)}
    >
      <Text style={styles.historyDate}>{game.date}</Text>
      <Text style={styles.historyWinner}>Winner: {game.winner}</Text>
      <Text style={styles.historyPlayers}>Players: {game.players.join(', ')}</Text>
    </TouchableOpacity>
  );

  // Render game details modal with an increased height.
  const renderGameDetailsModal = () => {
    if (!selectedGame) return null;

    const players = selectedGame.players;
    const scores = selectedGame.scores;
    const numPlayers = players.length;
    const numRounds = Math.ceil(scores.length / numPlayers);
    const tableData: (string | number)[][] = [];
    for (let r = 0; r < numRounds; r++) {
      const row: (string | number)[] = [];
      row.push(r + 1); // round number
      for (let j = 0; j < numPlayers; j++) {
        const index = r * numPlayers + j;
        row.push(index < scores.length ? scores[index].score : '-');
      }
      tableData.push(row);
    }

    // Compute totals row
    const totalsRow: (string | number)[] = ['Total'];
    players.forEach(player => {
      const total = scores
        .filter(entry => entry.player === player)
        .reduce((sum, entry) => sum + entry.score, 0);
      totalsRow.push(total);
    });

    // Compute dynamic column width
    const screenWidth = Dimensions.get('window').width - 32;
    const totalColumns = players.length + 1;
    const minColumnWidth = 80;
    const computedColumnWidth =
      totalColumns * minColumnWidth < screenWidth
        ? screenWidth / totalColumns
        : minColumnWidth;

    return (
      <Modal
        visible={true}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedGame(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Game Details</Text>
            <Text style={styles.modalSubtitle}>Date: {selectedGame.date}</Text>
            <Text style={styles.modalSubtitle}>Winner: {selectedGame.winner}</Text>
            <ScrollView horizontal>
              <View style={styles.tableContainer}>
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
                        <View key={cIndex} style={[styles.tableCell, { width: computedColumnWidth }]}>
                          <Text style={styles.cellText}>{cell}</Text>
                        </View>
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
            <CustomButton title="Close" onPress={() => setSelectedGame(null)} style={styles.closeButton} />
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <>
      <Header onPress={onBack} />
      <View style={styles.container}>
        <Text style={styles.title}>Game History</Text>
        <ScrollView style={styles.historyList}>
          {history.length > 0 ? (
            history.map(game => renderHistoryItem(game))
          ) : (
            <Text style={styles.noHistoryText}>No game history available.</Text>
          )}
        </ScrollView>
        <CustomButton title="Back" onPress={onBack} style={styles.backButton} />
      </View>
      {renderGameDetailsModal()}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    padding: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 24,
    color: '#333',
  },
  historyList: {
    flex: 1,
    alignSelf: 'stretch',
    marginBottom: 16,
  },
  historyItem: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
  },
  historyDate: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  historyWinner: {
    fontSize: 16,
    color: '#4A90E2',
  },
  historyPlayers: {
    fontSize: 16,
    marginTop: 4,
    color: '#333',
  },
  noHistoryText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginVertical: 20,
  },
  backButton: {
    width: '80%',
    marginVertical: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    // Increased height for modal
    height: '70%',
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 10,
    elevation: 6,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 12,
    color: '#333',
  },
  modalSubtitle: {
    fontSize: 18,
    marginBottom: 8,
    color: '#333',
  },
  tableContainer: {
    // Container for table (no extra margin/padding)
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
    maxHeight: 250,
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
  closeButton: {
    marginTop: 20,
    width: '80%',
  },
});

export default HistoryPage;
