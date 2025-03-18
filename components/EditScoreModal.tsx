// components/EditScoreModal.tsx
import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, StyleSheet } from 'react-native';
import CustomButton from './CustomButton';

interface Score {
  id: number;
  player: string;
  score: number;
  note: string;
}

interface EditScoreModalProps {
  visible: boolean;
  entry: Score;
  onSave: (editedEntry: Score) => void;
  onCancel: () => void;
}

const EditScoreModal: React.FC<EditScoreModalProps> = ({ visible, entry, onSave, onCancel }) => {
  const [score, setScore] = useState(entry.score.toString());
  const [note, setNote] = useState(entry.note);

  useEffect(() => {
    setScore(entry.score.toString());
    setNote(entry.note);
  }, [entry]);

  const handleSave = () => {
    const parsedScore = parseInt(score, 10);
    if (!isNaN(parsedScore)) {
      onSave({ ...entry, score: parsedScore, note });
    } else {
      console.warn('Invalid score');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onCancel}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Edit Score</Text>
          <Text style={styles.label}>Score:</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={score}
            onChangeText={setScore}
            placeholder="Enter score"
            placeholderTextColor="#999"
          />
          <Text style={styles.label}>Note:</Text>
          <TextInput
            style={styles.input}
            value={note}
            onChangeText={setNote}
            placeholder="Enter note"
            placeholderTextColor="#999"
          />
          <View style={styles.buttonRow}>
            <CustomButton title="Save" onPress={handleSave} style={styles.button} />
            <CustomButton title="Cancel" onPress={onCancel} style={[styles.button, styles.cancelButton]} />
          </View>
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
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    color: '#333',
  },
  label: {
    alignSelf: 'flex-start',
    fontSize: 16,
    marginBottom: 4,
    color: '#333',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    color: '#333',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#A0A0A0',
  },
});

export default EditScoreModal;
