// components/StatsModal.tsx
import React from 'react';
import { Modal, View, Text, Button, StyleSheet } from 'react-native';

interface StatsModalProps {
  visible: boolean;
  stats: Record<
    string,
    { rounds: number; totalScore: number; average: number; highest: number }
  >;
  onClose: () => void;
}

const StatsModal: React.FC<StatsModalProps> = ({ visible, stats, onClose }) => {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Game Statistics</Text>
          {Object.keys(stats).map((player, index) => {
            const { rounds, totalScore, average, highest } = stats[player];
            return (
              <View key={index} style={styles.playerStats}>
                <Text style={styles.playerName}>{player}</Text>
                <Text>Rounds Played: {rounds}</Text>
                <Text>Total Score: {totalScore}</Text>
                <Text>Average Score: {average.toFixed(2)}</Text>
                <Text>Highest Round: {highest}</Text>
              </View>
            );
          })}
          <Button title="Close" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  playerStats: {
    marginBottom: 12,
  },
  playerName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default StatsModal;
