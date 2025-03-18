// components/GameOverModal.tsx
import React, { useContext } from 'react';
import { Modal, View, Text, StyleSheet, ScrollView } from 'react-native';
import CustomButton from './CustomButton';
import { ThemeContext, darkTheme } from './ThemeContext';

interface GameOverModalProps {
  visible: boolean;
  winner: string;
  finalScores: { player: string; total: number }[];
  onRestart: () => void;
}

const GameOverModal: React.FC<GameOverModalProps> = ({ visible, winner, finalScores, onRestart }) => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme.primary === darkTheme.primary;
  
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onRestart}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: theme.modalBackground }]}>
          <Text style={[styles.title, { color: theme.titleText }]}>Game Over!</Text>
          <Text style={[styles.winnerText, { color: isDark ? theme.text : theme.primary }]}>
            Winner: {winner}
          </Text>
          <Text style={[styles.subtitle, { color: theme.text }]}>Final Standings:</Text>
          <ScrollView style={styles.standingsContainer}>
            {finalScores.map((score, index) => (
              <View
                key={index}
                style={[
                  styles.standingRow,
                  { borderColor: isDark ? "#fff" : theme.primary }
                ]}
              >
                <Text style={[styles.rankText, { color: theme.text }]}>{index + 1}.</Text>
                <Text style={[styles.playerText, { color: theme.text }]}>{score.player}</Text>
                <Text style={[styles.scoreText, { color: theme.text }]}>{score.total}</Text>
              </View>
            ))}
          </ScrollView>
          <CustomButton
            title="Restart Game"
            onPress={onRestart}
            style={[styles.restartButton, { backgroundColor: theme.primary }]}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    padding: 24,
    borderRadius: 10,
    elevation: 6,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 12,
  },
  winnerText: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    marginBottom: 12,
  },
  standingsContainer: {
    maxHeight: 200,
    width: '100%',
    marginBottom: 12,
  },
  standingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
  },
  rankText: {
    fontSize: 16,
    fontWeight: '700',
    width: 30,
  },
  playerText: {
    fontSize: 16,
    flex: 1,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: '700',
    width: 50,
    textAlign: 'right',
  },
  restartButton: {
    marginTop: 20,
    width: '100%',
  },
});

export default GameOverModal;
