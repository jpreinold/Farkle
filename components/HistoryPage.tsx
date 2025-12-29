import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import { ThemeContext } from "./ThemeContext";
import CustomButton from "./CustomButton";
import {
  GameSessionSummary,
  listSessions,
} from "../utils/gameSessionStorage";

const HistoryPage: React.FC = () => {
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<GameSessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listSessions();
      setSessions(data);
    } catch (err) {
      console.error("Failed to load sessions:", err);
      setError("Unable to load game history.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const unfinishedSessions = useMemo(
    () =>
      sessions
        .filter((session) => session.status !== "completed")
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        ),
    [sessions]
  );

  const completedSessions = useMemo(
    () =>
      sessions
        .filter((session) => session.status === "completed")
        .sort(
          (a, b) =>
            new Date(b.completedAt || b.updatedAt).getTime() -
            new Date(a.completedAt || a.updatedAt).getTime()
        ),
    [sessions]
  );

  const formatTimestamp = (value?: string | null) => {
    if (!value) return "Unknown time";
    try {
      return new Date(value).toLocaleString();
    } catch (error) {
      return value;
    }
  };

  const handleSessionSelect = (sessionId: string) => {
    navigate(`/game/${sessionId}`);
  };

  return (
    <>
      <Header />
      <div
        className="flex-1 p-6 md:p-8 min-h-screen"
        style={{ backgroundColor: theme.background }}
      >
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2
                className="text-3xl font-bold"
                style={{ color: theme.titleText }}
              >
                Game History
              </h2>
              <p className="opacity-80" style={{ color: theme.text }}>
                Review unfinished sessions and completed matches stored locally.
              </p>
            </div>
            <div className="flex gap-3">
              <CustomButton
                title="Refresh"
                onPress={() => loadSessions()}
                style={{ minWidth: 140 }}
                disabled={loading}
              />
              <CustomButton
                title="Home"
                onPress={() => navigate("/")}
                variant="outline"
                style={{ minWidth: 140 }}
              />
            </div>
          </div>

          {error && (
            <div
              className="p-4 rounded-lg"
              style={{ backgroundColor: theme.cardBackground }}
            >
              <p className="text-sm" style={{ color: theme.text }}>
                {error}
              </p>
            </div>
          )}

          <section
            className="card space-y-4"
            style={{
              backgroundColor: theme.cardBackground,
              boxShadow: `0 4px 16px ${theme.shadowColor}`,
            }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold" style={{ color: theme.text }}>
                Unfinished Games
              </h3>
              <span className="text-sm opacity-80" style={{ color: theme.text }}>
                {unfinishedSessions.length} active
              </span>
            </div>
            {loading ? (
              <p className="text-sm opacity-80" style={{ color: theme.text }}>
                Loading sessions...
              </p>
            ) : unfinishedSessions.length === 0 ? (
              <p className="text-sm opacity-80" style={{ color: theme.text }}>
                No unfinished games. Start a new match to begin playing.
              </p>
            ) : (
              <div className="space-y-3">
                {unfinishedSessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => handleSessionSelect(session.id)}
                    className="w-full text-left p-4 rounded-xl border transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2"
                    style={{
                      borderColor: theme.borderColor,
                      backgroundColor: theme.background,
                      color: theme.text,
                    }}
                  >
                    <p className="font-semibold">
                      {session.players.join(", ") || "Unnamed match"}
                    </p>
                    <p className="text-sm opacity-75">
                      Target {session.targetScore.toLocaleString()} pts • Last
                      played {formatTimestamp(session.updatedAt)}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </section>

          <section
            className="card space-y-4"
            style={{
              backgroundColor: theme.cardBackground,
              boxShadow: `0 4px 16px ${theme.shadowColor}`,
            }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold" style={{ color: theme.text }}>
                Completed Games
              </h3>
              <span className="text-sm opacity-80" style={{ color: theme.text }}>
                {completedSessions.length} total
              </span>
            </div>
            {loading ? (
              <p className="text-sm opacity-80" style={{ color: theme.text }}>
                Loading sessions...
              </p>
            ) : completedSessions.length === 0 ? (
              <p className="text-sm opacity-80" style={{ color: theme.text }}>
                No completed games yet. Finish a match to see it here.
              </p>
            ) : (
              <div className="space-y-3">
                {completedSessions.map((session) => (
                  <div
                    key={session.id}
                    className="w-full p-4 rounded-xl border"
                    style={{
                      borderColor: theme.borderColor,
                      backgroundColor: theme.background,
                      color: theme.text,
                    }}
                  >
                    <p className="font-semibold">
                      {session.players.join(", ") || "Unnamed match"}
                    </p>
                    <p className="text-sm opacity-75">
                      Winner: {session.winner || "TBD"}
                    </p>
                    <p className="text-sm opacity-60">
                      Completed {formatTimestamp(session.completedAt || session.updatedAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
};

export default HistoryPage;


