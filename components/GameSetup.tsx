// components/GameSetup.tsx
import React, { useContext, useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import CustomButton from './CustomButton';
import Header from './Header';
import { ThemeContext } from './ThemeContext';

interface GameSetupProps {
  onStartGame: (players: string[], targetScore: number) => void;
  headerOnPress?: () => void;
}

const GameSetup: React.FC<GameSetupProps> = ({ onStartGame, headerOnPress }) => {
  const { theme } = useContext(ThemeContext);
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
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.title, { color: theme.text }]}>Game Setup</Text>
        {/* Target Score Section */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Target Score:</Text>
          <TextInput
            style={[
              styles.input,
              {
                width: '100%',
                borderColor: theme.inputBorder,
                color: theme.text,
                backgroundColor: theme.background,
              },
            ]}
            placeholder="Enter target score"
            keyboardType="numeric"
            value={targetScore}
            onChangeText={setTargetScore}
            placeholderTextColor={theme.inputBorder}
            accessibilityLabel="Target Score Input"
          />
        </View>
        {/* Player Name Section */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Player Name:</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[
                styles.playerInput,
                {
                  flex: 1,
                  borderColor: theme.inputBorder,
                  color: theme.text,
                  backgroundColor: theme.background,
                },
              ]}
              placeholder="Enter player name"
              value={playerName}
              onChangeText={setPlayerName}
              placeholderTextColor={theme.inputBorder}
              accessibilityLabel="Player Name Input"
            />
            <CustomButton title="Add Player" onPress={addPlayer} />
          </View>
        </View>
        {/* Display Player Chips */}
        {players.length > 0 && (
          <View style={styles.chipsContainer}>
            {players.map((player, index) => (
              <View key={index} style={[styles.chip, { backgroundColor: theme.secondary }]}>
                <Text style={styles.chipText}>{player}</Text>
              </View>
            ))}
          </View>
        )}
        {/* Start Game Button */}
        {players.length > 0 && (
          <CustomButton
            title="Start Game"
            onPress={() => onStartGame(players, parseInt(targetScore, 10) || 10000)}
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginVertical: 10,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12, // updated to match player input height
    paddingHorizontal: 12,
    fontSize: 16,
    marginRight: 8,
  },
  playerInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 16,
    marginRight: 8,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: {
    fontSize: 16,
    color: '#fff',
  },
});

export default GameSetup;
