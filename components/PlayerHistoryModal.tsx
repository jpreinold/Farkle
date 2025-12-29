// components/PlayerHistoryModal.tsx
import React, { useContext, useMemo } from 'react';
import Modal from './Modal';
import CustomButton from './CustomButton';
import { ThemeContext } from './ThemeContext';

export interface PlayerHistoryEntry {
  id: number;
  player: string;
  score: number;
  note: string;
  source?: 'auto' | 'manual';
  sequence: number;
  round: number;
}

interface PlayerHistoryModalProps {
  visible: boolean;
  player: string;
  entries: PlayerHistoryEntry[];
  onClose: () => void;
  onEdit: (entryId: number) => void;
  onDelete: (entryId: number) => void;
}

const PlayerHistoryModal: React.FC<PlayerHistoryModalProps> = ({
  visible,
  player,
  entries,
  onClose,
  onEdit,
  onDelete,
}) => {
  const { theme } = useContext(ThemeContext);

  const sortedEntries = useMemo(() => {
    return [...entries].sort((a, b) => b.sequence - a.sequence);
  }, [entries]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <div
        className="w-[90%] max-w-2xl rounded-2xl p-6 flex flex-col shadow-2xl max-h-[85vh]"
        style={{ backgroundColor: theme.cardBackground }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2
              className="text-2xl font-bold"
              style={{ color: theme.titleText }}
            >
              {player} — History
            </h2>
            <p className="text-sm opacity-80" style={{ color: theme.text }}>
              Tap an entry to edit or delete previous turns.
            </p>
          </div>
          <CustomButton title="Close" onPress={onClose} />
        </div>

        {sortedEntries.length === 0 ? (
          <div
            className="flex-1 flex items-center justify-center text-center text-base font-semibold rounded-xl p-6"
            style={{
              color: theme.text,
              backgroundColor: `${theme.borderColor}30`,
            }}
          >
            No turns recorded for this player yet.
          </div>
        ) : (
          <div className="space-y-3 overflow-y-auto pr-1">
            {sortedEntries.map((entry) => (
              <div
                key={entry.id}
                className="rounded-xl p-4 border transition-colors duration-200"
                style={{
                  borderColor: theme.borderColor,
                  backgroundColor: `${theme.tableRowBorder}20`,
                }}
              >
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p
                        className="text-sm font-semibold uppercase tracking-wide"
                        style={{ color: theme.secondary }}
                      >
                        Round {entry.round} · Turn #{entry.sequence}
                      </p>
                      <p
                        className="text-2xl font-extrabold"
                        style={{ color: theme.primary }}
                      >
                        {entry.score}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="px-3 py-1 rounded-lg text-sm font-semibold transition-colors duration-200"
                        style={{
                          color: theme.text,
                          backgroundColor: `${theme.secondary}20`,
                        }}
                        onClick={() => onEdit(entry.id)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="px-3 py-1 rounded-lg text-sm font-semibold transition-colors duration-200"
                        style={{
                          color: theme.secondary,
                          backgroundColor: `${theme.secondary}10`,
                        }}
                        onClick={() => onDelete(entry.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="text-sm space-y-1" style={{ color: theme.text }}>
                    <p>
                      Source:{' '}
                      <span className="font-semibold">
                        {entry.source === 'manual' ? 'Manual Entry' : 'Dice'}
                      </span>
                    </p>
                    <p>
                      Note:{' '}
                      <span className="font-semibold">
                        {entry.note?.trim() ? entry.note : '—'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default PlayerHistoryModal;

