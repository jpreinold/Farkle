// components/StatsModal.tsx
import React, { useContext } from 'react';
import { Modal, View, Text, Button, StyleSheet } from 'react-native';
import { ThemeContext, darkTheme } from './ThemeContext';

interface StatsModalProps {
  visible: boolean;
  stats: Record<
    string,
    { rounds: number; totalScore: number; average: number; highest: number }
  >;
  onClose: () => void;
}

const StatsModal: React.FC<StatsModalProps> = ({ visible, stats, onClose }) => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme.primary === darkTheme.primary; // determine if dark mode
  const playersArray = Object.keys(stats);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: theme.modalBackground }]}>
          <Text style={[styles.title, { color: theme.titleText }]}>Game Statistics</Text>
          {playersArray.map((player, index) => {
            const { rounds, totalScore, average, highest } = stats[player];
            return (
              <View
                key={player}
                style={[
                  styles.playerStats,
                  index !== playersArray.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: isDark ? "#fff" : theme.primary,
                  },
                ]}
              >
                <Text style={[styles.playerName, { color: theme.text }]}>{player}</Text>
                <Text style={{ color: theme.text }}>Rounds Played: {rounds}</Text>
                <Text style={{ color: theme.text }}>Total Score: {totalScore}</Text>
                <Text style={{ color: theme.text }}>Average Score: {average.toFixed(2)}</Text>
                <Text style={{ color: theme.text }}>Highest Round: {highest}</Text>
              </View>
            );
          })}
          <Button title="Close" onPress={onClose} color={theme.primary} />
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
    paddingVertical: 8,
  },
  playerName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default StatsModal;
