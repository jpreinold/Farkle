// components/EditScoreModal.tsx
import React, { useState, useEffect, useContext } from 'react';
import Modal from './Modal';
import CustomButton from './CustomButton';
import { ThemeContext } from './ThemeContext';

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
  const { theme } = useContext(ThemeContext);
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
    <Modal visible={visible} animationType="slide" onRequestClose={onCancel}>
      <div
        className="w-[85%] p-6 rounded-lg shadow-lg flex flex-col items-center"
        style={{ backgroundColor: theme.background }}
      >
        <h2
          className="text-xl font-bold mb-4"
          style={{ color: theme.titleText }}
        >
          Edit Score
        </h2>
        <label
          className="self-start text-base mb-1"
          style={{ color: theme.titleText }}
        >
          Score:
        </label>
        <input
          type="number"
          className="w-full border rounded-md p-3 text-base mb-3"
          style={{
            borderColor: theme.inputBorder,
            color: theme.text,
          }}
          value={score}
          onChange={(e) => setScore(e.target.value)}
          placeholder="Enter score"
        />
        <label
          className="self-start text-base mb-1"
          style={{ color: theme.titleText }}
        >
          Note:
        </label>
        <input
          type="text"
          className="w-full border rounded-md p-3 text-base mb-3"
          style={{
            borderColor: theme.inputBorder,
            color: theme.text,
          }}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Enter note"
        />
        <div className="flex flex-row justify-around w-full">
          <div className="flex-1 mr-2">
            <CustomButton title="Save" onPress={handleSave} />
          </div>
          <div className="flex-1 ml-2">
            <CustomButton
              title="Cancel"
              onPress={onCancel}
              style={{ backgroundColor: '#A0A0A0' }}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default EditScoreModal;
