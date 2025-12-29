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
  source?: 'auto' | 'manual';
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
        className="w-[90%] max-w-md rounded-2xl p-8 flex flex-col shadow-2xl"
        style={{ backgroundColor: theme.cardBackground }}
      >
        <h2
          className="text-2xl font-bold mb-6 text-center"
          style={{ color: theme.titleText }}
        >
          Edit Score
        </h2>
        
        <div className="space-y-6 mb-6">
          <div>
            <label
              className="text-base font-semibold mb-2 block"
              style={{ color: theme.text }}
            >
              Score:
            </label>
            <input
              type="number"
              className="input-modern w-full focus:ring-2 focus:ring-offset-2"
              style={{
                borderColor: theme.inputBorder,
                color: theme.text,
                backgroundColor: theme.cardBackground,
              }}
              value={score}
              onChange={(e) => setScore(e.target.value)}
              onFocus={(e) => {
                e.target.style.borderColor = theme.secondary;
                e.target.style.boxShadow = `0 0 0 3px ${theme.secondary}40`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = theme.inputBorder;
                e.target.style.boxShadow = 'none';
              }}
              placeholder="Enter score"
            />
          </div>
          
          <div>
            <label
              className="text-base font-semibold mb-2 block"
              style={{ color: theme.text }}
            >
              Note:
            </label>
            <input
              type="text"
              className="input-modern w-full focus:ring-2 focus:ring-offset-2"
              style={{
                borderColor: theme.inputBorder,
                color: theme.text,
                backgroundColor: theme.cardBackground,
              }}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onFocus={(e) => {
                e.target.style.borderColor = theme.secondary;
                e.target.style.boxShadow = `0 0 0 3px ${theme.secondary}40`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = theme.inputBorder;
                e.target.style.boxShadow = 'none';
              }}
              placeholder="Enter note"
            />
          </div>
        </div>
        
        <div className="flex flex-row gap-3">
          <div className="flex-1">
            <CustomButton 
              title="Save" 
              onPress={handleSave}
              style={{ width: '100%' }}
            />
          </div>
          <div className="flex-1">
            <CustomButton
              title="Cancel"
              onPress={onCancel}
              variant="outline"
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default EditScoreModal;
