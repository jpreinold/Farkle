// components/ManualEntryPanel.tsx
import React, { useContext } from 'react';
import CustomButton from './CustomButton';
import { ThemeContext } from './ThemeContext';

interface ManualEntryPanelProps {
  currentPlayer: string;
  scoreValue: string;
  noteValue: string;
  onScoreChange: (value: string) => void;
  onNoteChange: (value: string) => void;
  onBank: () => void;
  onSubmit: () => void;
  onFarkle: () => void;
  canBank: boolean;
  canSubmit: boolean;
  disabled?: boolean;
}

const ManualEntryPanel: React.FC<ManualEntryPanelProps> = ({
  currentPlayer,
  scoreValue,
  noteValue,
  onScoreChange,
  onNoteChange,
  onBank,
  onSubmit,
  onFarkle,
  canBank,
  canSubmit,
  disabled = false,
}) => {
  const { theme } = useContext(ThemeContext);

  return (
    <div className="space-y-4">
      <p
        className="text-xl font-bold text-center"
        style={{ color: theme.text }}
      >
        Current Player:{' '}
        <span style={{ color: theme.secondary }}>{currentPlayer}</span>
      </p>

      <div className="space-y-4">
        <div>
          <label
            className="text-base font-semibold mb-2 block"
            style={{ color: theme.text }}
          >
            Score to add
          </label>
          <input
            type="number"
            className="input-modern w-full focus:ring-2 focus:ring-offset-2"
            style={{
              borderColor: theme.inputBorder,
              backgroundColor: theme.cardBackground,
              color: theme.text,
            }}
            placeholder="Enter score"
            value={scoreValue}
            onChange={(e) => onScoreChange(e.target.value)}
            onFocus={(e) => {
              e.target.style.borderColor = theme.secondary;
              e.target.style.boxShadow = `0 0 0 3px ${theme.secondary}40`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = theme.inputBorder;
              e.target.style.boxShadow = 'none';
            }}
            aria-label="Manual score input"
            disabled={disabled}
          />
        </div>

        <div>
          <label
            className="text-base font-semibold mb-2 block"
            style={{ color: theme.text }}
          >
            Note (optional)
          </label>
          <input
            type="text"
            className="input-modern w-full focus:ring-2 focus:ring-offset-2"
            style={{
              borderColor: theme.inputBorder,
              backgroundColor: theme.cardBackground,
              color: theme.text,
            }}
            placeholder="Enter note"
            value={noteValue}
            onChange={(e) => onNoteChange(e.target.value)}
            onFocus={(e) => {
              e.target.style.borderColor = theme.secondary;
              e.target.style.boxShadow = `0 0 0 3px ${theme.secondary}40`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = theme.inputBorder;
              e.target.style.boxShadow = 'none';
            }}
            aria-label="Manual note input"
            disabled={disabled}
          />
        </div>

        <div className="space-y-3">
          <CustomButton
            title="Bank Score"
            onPress={onBank}
            disabled={!canBank || disabled}
            style={{ width: '100%' }}
          />
          <CustomButton
            title="Submit Score"
            onPress={onSubmit}
            disabled={!canSubmit || disabled}
            variant="primary"
            style={{ width: '100%' }}
          />
          <CustomButton
            title="Farkle"
            onPress={onFarkle}
            disabled={disabled}
            variant="outline"
            style={{ width: '100%' }}
          />
        </div>
      </div>
    </div>
  );
};

export default ManualEntryPanel;

