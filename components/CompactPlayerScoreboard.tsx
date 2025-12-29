// components/CompactPlayerScoreboard.tsx
import React, { useContext } from 'react';
import { ThemeContext } from './ThemeContext';

interface CompactPlayerScoreboardProps {
  players: string[];
  totals: Record<string, number>;
  targetScore: number;
  currentPlayerIndex: number;
}

const CompactPlayerScoreboard: React.FC<CompactPlayerScoreboardProps> = ({
  players,
  totals,
  targetScore,
  currentPlayerIndex,
}) => {
  const { theme } = useContext(ThemeContext);

  if (players.length === 0) {
    return null;
  }

  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="flex gap-3 min-w-max">
        {players.map((player, index) => {
          const total = totals[player] ?? 0;
          const progress = Math.min(total / targetScore, 1);
          const isActive = index === currentPlayerIndex;

          return (
            <div
              key={player}
              className="min-w-[160px] rounded-2xl p-4 flex flex-col gap-2 transition-all duration-200"
              style={{
                backgroundColor: isActive ? `${theme.secondary}20` : theme.cardBackground,
                border: `2px solid ${isActive ? theme.secondary : theme.borderColor}`,
                boxShadow: `0 4px 12px ${theme.shadowColor}`,
              }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="text-base font-semibold truncate"
                  style={{ color: theme.text }}
                >
                  {player}
                </span>
                {isActive && (
                  <span
                    className="text-xs font-bold uppercase tracking-wide"
                    style={{ color: theme.secondary }}
                  >
                    Turn
                  </span>
                )}
              </div>
              <div className="text-2xl font-extrabold" style={{ color: theme.primary }}>
                {total}
              </div>
              <div
                className="w-full h-2 rounded-full overflow-hidden"
                style={{ backgroundColor: `${theme.borderColor}80` }}
              >
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${progress * 100}%`,
                    backgroundColor: theme.secondary,
                  }}
                />
              </div>
              <div className="text-xs text-right" style={{ color: theme.text }}>
                {Math.min(Math.round(progress * 100), 100)}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CompactPlayerScoreboard;

