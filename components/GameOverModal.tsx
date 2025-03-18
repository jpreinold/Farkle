// components/GameOverModal.tsx
import React from 'react';
import { Modal, View, Text, StyleSheet, ScrollView } from 'react-native';
import CustomButton from './CustomButton';

interface GameOverModalProps {
  visible: boolean;
  winner: string;
  finalScores: { player: string; total: number }[];
  onRestart: () => void;
}

const GameOverModal: React.FC<GameOverModalProps> = ({ visible, winner, finalScores, onRestart }) => {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Game Over!</Text>
          <Text style={styles.winnerText}>Winner: {winner}</Text>
          <Text style={styles.subtitle}>Final Standings:</Text>
          <ScrollView style={styles.standingsContainer}>
            {finalScores.map((score, index) => (
              <View key={index} style={styles.standingRow}>
                <Text style={styles.rankText}>{index + 1}.</Text>
                <Text style={styles.playerText}>{score.player}</Text>
                <Text style={styles.scoreText}>{score.total}</Text>
              </View>
            ))}
          </ScrollView>
          <CustomButton title="Restart Game" onPress={onRestart} style={styles.restartButton} />
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
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 10,
    elevation: 6,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 12,
    color: '#333',
  },
  winnerText: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 8,
    color: '#4A90E2',
  },
  subtitle: {
    fontSize: 20,
    marginBottom: 12,
    color: '#333',
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
    borderColor: '#eee',
  },
  rankText: {
    fontSize: 16,
    fontWeight: '700',
    width: 30,
    color: '#333',
  },
  playerText: {
    fontSize: 16,
    flex: 1,
    color: '#333',
  },
  scoreText: {
    fontSize: 16,
    fontWeight: '700',
    width: 50,
    textAlign: 'right',
    color: '#333',
  },
  restartButton: {
    marginTop: 20,
    backgroundColor: '#4A90E2',
  },
});

export default GameOverModal;
