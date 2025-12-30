import React, { useContext, useMemo } from "react";
import Modal from "./Modal";
import CustomButton from "./CustomButton";
import { ThemeContext } from "./ThemeContext";
import { GameSessionState } from "../utils/gameSessionStorage";

interface CompletedGameModalProps {
  visible: boolean;
  session: GameSessionState | null;
  loading: boolean;
  error?: string | null;
  onClose: () => void;
}

type PlayerStat = {
  name: string;
  rounds: number;
  total: number;
  average: number;
  highest: number;
};

type HistoryCell = {
  score: number | null;
  total: number | null;
};

const CompletedGameModal: React.FC<CompletedGameModalProps> = ({
  visible,
  session,
  loading,
  error,
  onClose,
}) => {
  const { theme } = useContext(ThemeContext);
  const players = session?.players ?? [];

  const playerStats = useMemo<PlayerStat[]>(() => {
    if (!session) return [];
    const base: Record<string, PlayerStat> = {};
    session.players.forEach((player) => {
      base[player] = {
        name: player,
        rounds: 0,
        total: 0,
        average: 0,
        highest: 0,
      };
    });
    (session.scores || []).forEach((entry) => {
      if (!base[entry.player]) return;
      const stat = base[entry.player];
      stat.rounds += 1;
      stat.total += entry.score || 0;
      stat.highest = Math.max(stat.highest, entry.score || 0);
    });
    Object.values(base).forEach((stat) => {
      stat.average = stat.rounds > 0 ? stat.total / stat.rounds : 0;
    });
    return session.players.map((player) => base[player]);
  }, [session]);

  const historyRows = useMemo(
    () => {
      if (!session) return [];
      const totals: Record<string, number> = {};
      session.players.forEach((player) => {
        totals[player] = 0;
      });
      const rows: { round: number; cells: HistoryCell[] }[] = [];
      (session.scores || []).forEach((entry, index) => {
        const playerIndex = session.players.indexOf(entry.player);
        if (playerIndex === -1) {
          return;
        }
        const roundIndex = Math.floor(index / session.players.length);
        if (!rows[roundIndex]) {
          rows[roundIndex] = {
            round: roundIndex + 1,
            cells: session.players.map(() => ({
              score: null,
              total: null,
            })),
          };
        }
        totals[entry.player] += entry.score || 0;
        rows[roundIndex].cells[playerIndex] = {
          score:
            typeof entry.score === "number" ? entry.score : (entry.score || 0),
          total: totals[entry.player],
        };
      });
      return rows;
    },
    [session]
  );

  const formatTimestamp = (value?: string | null) => {
    if (!value) return "Unknown time";
    try {
      return new Date(value).toLocaleString();
    } catch {
      return value;
    }
  };

  const contentBackground = {
    backgroundColor: theme.cardBackground,
    color: theme.text,
  };

  const metadataItems = [
    {
      label: "Winner",
      value: session?.winner || "TBD",
    },
    {
      label: "Target Score",
      value: session?.targetScore?.toLocaleString() || "—",
    },
    {
      label: "Completed",
      value: formatTimestamp(session?.completedAt || session?.updatedAt),
    },
    {
      label: "Total Rounds",
      value: historyRows.length.toString(),
    },
  ];

  const renderBody = () => {
    if (loading) {
      return (
        <div
          className="py-16 text-center text-lg font-semibold"
          style={{ color: theme.text }}
        >
          Loading game details...
        </div>
      );
    }
    if (error) {
      return (
        <div
          className="py-8 text-center text-base font-semibold rounded-xl"
          style={{
            color: theme.text,
            backgroundColor: `${theme.borderColor}30`,
          }}
        >
          {error}
        </div>
      );
    }
    if (!session) {
      return (
        <div
          className="py-8 text-center text-base font-semibold rounded-xl"
          style={{
            color: theme.text,
            backgroundColor: `${theme.borderColor}30`,
          }}
        >
          Game details unavailable.
        </div>
      );
    }
    return (
      <>
        <section className="grid gap-4 md:grid-cols-2">
          {metadataItems.map((item) => (
            <div
              key={item.label}
              className="rounded-xl p-4 border"
              style={{ borderColor: theme.borderColor }}
            >
              <p className="text-sm uppercase tracking-wide opacity-75">
                {item.label}
              </p>
              <p className="text-xl font-semibold mt-1" style={{ color: theme.titleText }}>
                {item.value}
              </p>
            </div>
          ))}
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-semibold" style={{ color: theme.titleText }}>
            Player Stats
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {playerStats.map((stat) => (
              <div
                key={stat.name}
                className="p-4 rounded-xl border"
                style={{
                  borderColor: theme.borderColor,
                  backgroundColor: `${theme.tableRowBorder}30`,
                }}
              >
                <p className="text-base font-bold mb-2" style={{ color: theme.primary }}>
                  {stat.name}
                </p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="opacity-70">Rounds</p>
                    <p className="text-lg font-semibold">{stat.rounds}</p>
                  </div>
                  <div>
                    <p className="opacity-70">Total</p>
                    <p className="text-lg font-semibold">{stat.total.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="opacity-70">Average</p>
                    <p className="text-lg font-semibold">
                      {stat.average.toFixed(1)}
                    </p>
                  </div>
                  <div>
                    <p className="opacity-70">Best Turn</p>
                    <p className="text-lg font-semibold">{stat.highest}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h3 className="text-lg font-semibold" style={{ color: theme.titleText }}>
              Turn History
            </h3>
            <span className="text-sm opacity-70">
              Scores are shown as turn value with running total below.
            </span>
          </div>
          {historyRows.length === 0 ? (
            <div
              className="text-center text-base font-semibold rounded-xl p-6"
              style={{
                color: theme.text,
                backgroundColor: `${theme.borderColor}30`,
              }}
            >
              No turn history recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border" style={{ borderColor: theme.borderColor }}>
              <table className="w-full text-sm">
                <thead
                  style={{
                    backgroundColor: theme.tableHeader,
                    color: theme.tableText,
                  }}
                >
                  <tr>
                    <th className="px-4 py-3 text-left">Round</th>
                    {players.map((player) => (
                      <th key={player} className="px-4 py-3 text-left">
                        {player}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {historyRows.map((row) => (
                    <tr
                      key={row.round}
                      className="border-t"
                      style={{ borderColor: theme.tableRowBorder }}
                    >
                      <td className="px-4 py-3 font-semibold" style={{ color: theme.titleText }}>
                        Round {row.round}
                      </td>
                      {row.cells.map((cell, idx) => (
                        <td key={`${row.round}-${players[idx]}`} className="px-4 py-3">
                          {cell.score === null ? (
                            <span className="opacity-50">—</span>
                          ) : (
                            <div className="flex flex-col">
                              <span className="text-base font-semibold" style={{ color: theme.text }}>
                                {cell.score > 0 ? `+${cell.score}` : cell.score}
                              </span>
                              <span className="text-xs opacity-70">
                                Total {cell.total?.toLocaleString()}
                              </span>
                            </div>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <div
        className="w-[95vw] max-w-5xl rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl"
        style={contentBackground}
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold" style={{ color: theme.titleText }}>
              Game Details
            </h2>
            <p className="text-sm opacity-80">
              Review stats and turn-by-turn history for this match.
            </p>
          </div>
          <CustomButton title="Close" onPress={onClose} />
        </div>

        {renderBody()}
      </div>
    </Modal>
  );
};

export default CompletedGameModal;

