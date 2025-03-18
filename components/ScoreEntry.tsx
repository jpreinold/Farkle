// components/ScoreEntry.tsx
import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text } from 'react-native';
import CustomButton from './CustomButton';

interface ScoreEntryProps {
  onAddEntry: (score: number, note: string) => void;
}

const ScoreEntry: React.FC<ScoreEntryProps> = ({ onAddEntry }) => {
  const [score, setScore] = useState('');
  const [note, setNote] = useState('');

  const handleEndTurn = () => {
    if (score.trim() === '') {
      // No score entered, record as Farkle!
      onAddEntry(0, "Farkle");
    } else {
      const parsedScore = parseInt(score, 10);
      if (!isNaN(parsedScore)) {
        onAddEntry(parsedScore, note);
      } else {
        console.warn('Enter a valid number for the score.');
        return; // if invalid, do not clear the fields
      }
    }
    // Clear inputs after submission
    setScore('');
    setNote('');
  };

  const buttonLabel = score.trim() === '' ? "Farkle!" : "End Turn";

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Score:</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Score"
        keyboardType="numeric"
        value={score}
        onChangeText={setScore}
        placeholderTextColor="#999"
        accessibilityLabel="Score Input"
      />
      <Text style={styles.label}>Note (Optional):</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter note"
        value={note}
        onChangeText={setNote}
        placeholderTextColor="#999"
        accessibilityLabel="Note Input"
      />
      <CustomButton title={buttonLabel} onPress={handleEndTurn} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
});

export default ScoreEntry;
