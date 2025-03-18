// components/GameSetup.tsx
import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import CustomButton from './CustomButton';
import Header from './Header';

interface GameSetupProps {
  onStartGame: (players: string[], targetScore: number) => void;
  headerOnPress?: () => void;
}

const GameSetup: React.FC<GameSetupProps> = ({ onStartGame, headerOnPress }) => {
  const [targetScore, setTargetScore] = useState('10000');
  const [playerName, setPlayerName] = useState('');
  const [players, setPlayers] = useState<string[]>([]);

  const addPlayer = () => {
    if (playerName.trim() !== '') {
      setPlayers([...players, playerName.trim()]);
      setPlayerName('');
    }
  };

  return (
    <>
      <Header onPress={headerOnPress} />
      <View style={styles.container}>
        <Text style={styles.title}>Game Setup</Text>

        {/* Target Score Section */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Target Score:</Text>
          <TextInput
            style={[styles.input, { width: '100%' }]}
            placeholder="Enter target score"
            keyboardType="numeric"
            value={targetScore}
            onChangeText={setTargetScore}
            placeholderTextColor="#999"
            accessibilityLabel="Target Score Input"
          />
        </View>

        {/* Player Name Section */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Player Name:</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Enter player name"
              value={playerName}
              onChangeText={setPlayerName}
              placeholderTextColor="#999"
              accessibilityLabel="Player Name Input"
            />
            <CustomButton title="Add Player" onPress={addPlayer} />
          </View>
        </View>

        {/* Display Player Chips */}
        {players.length > 0 && (
          <View style={styles.chipsContainer}>
            {players.map((player, index) => (
              <View key={index} style={styles.chip}>
                <Text style={styles.chipText}>{player}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Start Game Button */}
        {players.length > 0 && (
          <CustomButton
            title="Start Game"
            onPress={() =>
              onStartGame(players, parseInt(targetScore, 10) || 10000)
            }
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginVertical: 10,
    color: '#333',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
    color: '#333',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
    marginRight: 8,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  chip: {
    backgroundColor: '#BDBDBD',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: {
    fontSize: 16,
    color: '#333',
  },
});

export default GameSetup;
