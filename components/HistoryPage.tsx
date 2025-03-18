// components/HistoryPage.tsx
import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomButton from './CustomButton';
import Header from './Header';
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

  const renderHistoryItem = (game: GameHistory) => {
    const isDark = theme.primary === darkTheme.primary;
    const backgroundColor = isDark ? theme.secondary : theme.secondary + '33';
    const winnerColor = isDark ? theme.text : theme.primary;

    return (
      <TouchableOpacity
        key={game.id}
        style={[styles.historyItem, { backgroundColor }]}
        onPress={() => setSelectedGame(game)}
      >
        <Text style={[styles.historyDate, { color: theme.text }]}>{game.date}</Text>
        <Text style={[styles.historyWinner, { color: winnerColor }]}>
          Winner: {game.winner}
        </Text>
        <Text style={[styles.historyPlayers, { color: theme.text }]}>
          Players: {game.players.join(', ')}
        </Text>
      </TouchableOpacity>
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

    const screenWidth = Dimensions.get('window').width - 32;
    const totalColumns = players.length + 1;
    const minColumnWidth = 80;
    const computedColumnWidth =
      totalColumns * minColumnWidth < screenWidth
        ? screenWidth / totalColumns
        : minColumnWidth;
    const isDark = theme.primary === darkTheme.primary;

    return (
      <Modal
        visible={true}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedGame(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: theme.modalBackground }]}>
            <Text style={[styles.modalTitle, { color: theme.titleText }]}>Game Details</Text>
            <Text style={[styles.modalSubtitle, { color: theme.text }]}>
              Date: {selectedGame.date}
            </Text>
            <Text style={[styles.modalSubtitle, { color: theme.text }]}>
              Winner: {selectedGame.winner}
            </Text>
            <ScrollView horizontal>
              <View style={[styles.tableContainer, { borderRadius: 8, overflow: 'hidden' }]}>
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
                        {
                          borderColor: isDark
                            ? theme.secondary
                            : theme.secondary + '33',
                        },
                      ]}
                    >
                      {row.map((cell, cIndex) => (
                        <View key={cIndex} style={[styles.tableCell, { width: computedColumnWidth }]}>
                          <Text style={[styles.cellText, { color: theme.text }]}>{cell}</Text>
                        </View>
                      ))}
                    </View>
                  ))}
                </ScrollView>
                <View style={[styles.totalsRow, { backgroundColor: theme.tableRowBorder }]}>
                  {totalsRow.map((cell, index) => (
                    <View key={index} style={[styles.tableCell, { width: computedColumnWidth }]}>
                      <Text style={[styles.headerText, styles.totalText, { color: theme.text }]}>
                        {cell}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </ScrollView>
            <CustomButton
              title="Close"
              onPress={() => setSelectedGame(null)}
              style={styles.closeButton}
            />
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <>
      <Header onPress={onBack} />
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.title, { color: theme.titleText }]}>Game History</Text>
        <ScrollView style={styles.historyList}>
          {history.length > 0 ? (
            history.map((game) => renderHistoryItem(game))
          ) : (
            <Text style={[styles.noHistoryText, { color: theme.text }]}>
              No game history available.
            </Text>
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
    padding: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 24,
  },
  historyList: {
    flex: 1,
    alignSelf: 'stretch',
    marginBottom: 16,
  },
  historyItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
  },
  historyDate: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  historyWinner: {
    fontSize: 16,
  },
  historyPlayers: {
    fontSize: 16,
    marginTop: 4,
  },
  noHistoryText: {
    fontSize: 16,
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
    height: '70%',
    borderRadius: 8,
    padding: 24,
    elevation: 6,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 12,
  },
  modalSubtitle: {
    fontSize: 18,
    marginBottom: 8,
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
  closeButton: {
    marginTop: 20,
    width: '80%',
  },
});

export default HistoryPage;
